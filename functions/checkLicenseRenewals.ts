import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const notificationIntervals = [60, 30, 7]; // Days before expiration
    const notifications = [];
    
    // Get all compliance records with expiry dates
    const records = await base44.asServiceRole.entities.ComplianceRecord.filter({
      expiry_date: { $exists: true },
      verification_status: { $in: ['verified', 'pending'] }
    });

    for (const record of records) {
      const expiryDate = new Date(record.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Skip if already expired or too far in future
      if (daysUntilExpiry < 0 || daysUntilExpiry > 60) continue;
      
      // Check if we should send a notification
      for (const interval of notificationIntervals) {
        if (daysUntilExpiry === interval) {
          // Get staff profile
          const profiles = await base44.asServiceRole.entities.StaffProfile.filter({
            user_email: record.user_email
          });
          const profile = profiles[0];
          
          // Send notification to staff
          await base44.asServiceRole.entities.Notification.create({
            user_email: record.user_email,
            type: 'verification_update',
            title: `License Renewal Required: ${record.document_name}`,
            message: `Your ${record.document_name} expires in ${daysUntilExpiry} days. Please renew it as soon as possible.`,
            priority: daysUntilExpiry <= 7 ? 'urgent' : 'high',
            status: 'unread',
            action_url: '/StaffProfile'
          });

          // Send email to staff
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: record.user_email,
            subject: `⚠️ License Renewal Required: ${record.document_name}`,
            body: `
              <h2>License Renewal Reminder</h2>
              <p>Dear ${profile?.full_name || 'Healthcare Professional'},</p>
              <p>This is an automated reminder that your <strong>${record.document_name}</strong> is expiring soon.</p>
              <ul>
                <li><strong>Document:</strong> ${record.document_name}</li>
                <li><strong>Expiry Date:</strong> ${new Date(record.expiry_date).toLocaleDateString()}</li>
                <li><strong>Days Remaining:</strong> ${daysUntilExpiry} days</li>
              </ul>
              <p><strong>Action Required:</strong> Please renew your license and upload the updated document to your profile.</p>
              <p>Log in to Shiftly Health to update your credentials.</p>
              <p>If you have already renewed, please upload the new document to your profile.</p>
            `
          });

          // Send notification to admins
          const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
          for (const admin of admins) {
            await base44.asServiceRole.entities.Notification.create({
              user_email: admin.email,
              type: 'verification_update',
              title: `Staff License Expiring: ${profile?.full_name || record.user_email}`,
              message: `${record.document_name} for ${profile?.full_name || record.user_email} expires in ${daysUntilExpiry} days.`,
              priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
              status: 'unread',
              action_url: '/CredentialVerification'
            });
          }

          notifications.push({
            user_email: record.user_email,
            document: record.document_name,
            days_until_expiry: daysUntilExpiry,
            expiry_date: record.expiry_date
          });
        }
      }
      
      // Update status to 'expired' if past expiry date
      if (daysUntilExpiry < 0 && record.verification_status !== 'expired') {
        await base44.asServiceRole.entities.ComplianceRecord.update(record.id, {
          verification_status: 'expired'
        });
      }
    }

    return Response.json({
      success: true,
      notifications_sent: notifications.length,
      notifications: notifications,
      records_checked: records.length
    });

  } catch (error) {
    console.error('License renewal check error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});