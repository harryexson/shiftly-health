import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const webhookSecret = Deno.env.get('CHECKR_WEBHOOK_SECRET');
    const signature = req.headers.get('x-checkr-signature');
    const body = await req.text();

    // Verify webhook signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const base44 = createClientFromRequest(req);

    // Process report completion events
    if (event.type === 'report.completed' || event.type === 'report.adjudicated') {
      const report = event.data.object;

      // Find compliance record by Checkr report ID
      const complianceRecords = await base44.asServiceRole.entities.ComplianceRecord.filter({
        third_party_verification_id: report.id
      });

      if (complianceRecords.length === 0) {
        console.error('Compliance record not found for report:', report.id);
        return Response.json({ error: 'Record not found' }, { status: 404 });
      }

      const complianceRecord = complianceRecords[0];
      const staff_email = complianceRecord.user_email;

      // Determine verification status based on report result
      let verificationStatus = 'pending';
      let notificationTitle = 'Background Check Update';
      let notificationMessage = '';
      let emailSubject = '';
      let emailBody = '';

      if (report.status === 'clear') {
        verificationStatus = 'verified';
        notificationTitle = '✅ Background Check Approved';
        notificationMessage = 'Your background check has been cleared! You can now apply for shifts.';
        emailSubject = 'Background Check Approved - Shiftly Health';
        emailBody = `
          <h2 style="color: green;">✅ Background Check Approved</h2>
          <p>Great news! Your background check has been successfully completed and cleared.</p>
          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your profile is now fully verified</li>
            <li>You can apply for all available shifts</li>
            <li>Facilities can see your verified status</li>
          </ul>
          <p>Start browsing shifts now!</p>
        `;
      } else if (report.status === 'consider') {
        verificationStatus = 'pending';
        notificationTitle = '⚠️ Background Check Requires Review';
        notificationMessage = 'Your background check requires manual review. Our team will contact you within 24 hours.';
        emailSubject = 'Background Check Review Required - Shiftly Health';
        emailBody = `
          <h2 style="color: orange;">⚠️ Background Check Review Required</h2>
          <p>Your background check has been completed but requires additional review.</p>
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Our compliance team will review your results within 24 hours</li>
            <li>You may be contacted for additional information</li>
            <li>We'll notify you of the final decision</li>
          </ul>
          <p>If you have questions, please contact support@shiftlyhealth.com</p>
        `;
      } else if (report.status === 'suspended' || report.status === 'dispute') {
        verificationStatus = 'rejected';
        notificationTitle = '❌ Background Check Issue';
        notificationMessage = 'There was an issue with your background check. Please contact support for details.';
        emailSubject = 'Background Check Issue - Shiftly Health';
        emailBody = `
          <h2 style="color: red;">Background Check Issue</h2>
          <p>Unfortunately, there was an issue processing your background check.</p>
          <p><strong>What to do next:</strong></p>
          <ul>
            <li>Contact our support team at support@shiftlyhealth.com</li>
            <li>We'll work with you to resolve any issues</li>
            <li>You may have the right to dispute findings</li>
          </ul>
          <p>Status: ${report.status}</p>
        `;
      }

      // Update compliance record
      await base44.asServiceRole.entities.ComplianceRecord.update(complianceRecord.id, {
        verification_status: verificationStatus,
        verified_date: new Date().toISOString(),
        notes: `${complianceRecord.notes || ''}\nCheckr webhook update: Status ${report.status} at ${new Date().toISOString()}`
      });

      // Update staff profile
      const staffProfiles = await base44.asServiceRole.entities.StaffProfile.filter({
        user_email: staff_email
      });

      if (staffProfiles.length > 0) {
        await base44.asServiceRole.entities.StaffProfile.update(staffProfiles[0].id, {
          verification_status: verificationStatus
        });
      }

      // Send notification
      await base44.asServiceRole.entities.Notification.create({
        user_email: staff_email,
        type: 'verification_update',
        title: notificationTitle,
        message: notificationMessage,
        priority: verificationStatus === 'verified' ? 'high' : 'urgent',
        status: 'unread'
      });

      // Send email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: staff_email,
        subject: emailSubject,
        body: emailBody
      });

      // Log audit trail
      await base44.asServiceRole.entities.AuditLog.create({
        admin_email: 'system@shiftlyhealth.com',
        action: 'background_check_completed',
        target_user_email: staff_email,
        target_entity: 'StaffProfile',
        details: `Background check ${verificationStatus} via Checkr webhook. Report ID: ${report.id}`,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});