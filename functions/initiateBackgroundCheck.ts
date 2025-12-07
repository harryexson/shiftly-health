import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staff_email } = await req.json();

    // Get staff profile
    const staffProfiles = await base44.asServiceRole.entities.StaffProfile.filter({
      user_email: staff_email
    });

    if (staffProfiles.length === 0) {
      return Response.json({ error: 'Staff profile not found' }, { status: 404 });
    }

    const staffProfile = staffProfiles[0];

    // Create candidate in Checkr
    const checkrApiKey = Deno.env.get('CHECKR_API_KEY');
    
    const candidateResponse = await fetch('https://api.checkr.com/v1/candidates', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(checkrApiKey + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: staff_email,
        first_name: staffProfile.full_name?.split(' ')[0] || 'N/A',
        last_name: staffProfile.full_name?.split(' ').slice(1).join(' ') || 'N/A',
        phone: staffProfile.phone || '',
        zipcode: staffProfile.zip_code || '',
        custom_id: staffProfile.id
      })
    });

    if (!candidateResponse.ok) {
      const error = await candidateResponse.text();
      throw new Error(`Checkr candidate creation failed: ${error}`);
    }

    const candidate = await candidateResponse.json();

    // Create background check report
    const reportResponse = await fetch('https://api.checkr.com/v1/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(checkrApiKey + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidate_id: candidate.id,
        package: 'tasker_standard', // Standard background check package
        work_locations: [{
          country: 'US',
          state: staffProfile.state || 'CA'
        }]
      })
    });

    if (!reportResponse.ok) {
      const error = await reportResponse.text();
      throw new Error(`Checkr report creation failed: ${error}`);
    }

    const report = await reportResponse.json();

    // Create compliance record for tracking
    await base44.asServiceRole.entities.ComplianceRecord.create({
      user_email: staff_email,
      record_type: 'background_check',
      document_name: 'Automated Background Check',
      verification_status: 'pending',
      third_party_verification_id: report.id,
      notes: `Checkr report initiated. Report ID: ${report.id}, Candidate ID: ${candidate.id}`
    });

    // Update staff profile to pending
    await base44.asServiceRole.entities.StaffProfile.update(staffProfile.id, {
      verification_status: 'pending'
    });

    // Send notification to staff
    await base44.asServiceRole.entities.Notification.create({
      user_email: staff_email,
      type: 'verification_update',
      title: 'Background Check Initiated',
      message: 'Your background check has been started. You will be notified once the results are available (typically 1-3 business days).',
      priority: 'medium',
      status: 'unread'
    });

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: staff_email,
      subject: 'Background Check Initiated - Shiftly Health',
      body: `
        <h2>Background Check in Progress</h2>
        <p>Hi ${staffProfile.full_name},</p>
        <p>We've initiated your background check through our verification partner, Checkr.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>The check typically takes 1-3 business days to complete</li>
          <li>You'll receive a notification once results are available</li>
          <li>You may receive an email from Checkr to complete additional steps</li>
        </ul>
        <p>Thank you for your patience!</p>
      `
    });

    return Response.json({
      success: true,
      report_id: report.id,
      candidate_id: candidate.id,
      status: report.status
    });

  } catch (error) {
    console.error('Background check initiation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});