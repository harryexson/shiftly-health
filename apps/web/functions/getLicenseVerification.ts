import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staff_email, license_number, license_state, license_type } = await req.json();

    // Get staff profile
    const staffProfiles = await base44.asServiceRole.entities.StaffProfile.filter({
      user_email: staff_email
    });

    if (staffProfiles.length === 0) {
      return Response.json({ error: 'Staff profile not found' }, { status: 404 });
    }

    const staffProfile = staffProfiles[0];

    // Verify with Checkr Professional License Verification
    const checkrApiKey = Deno.env.get('CHECKR_API_KEY');

    // Create or get candidate
    let candidateId;
    const existingRecords = await base44.asServiceRole.entities.ComplianceRecord.filter({
      user_email: staff_email,
      record_type: 'background_check'
    });

    if (existingRecords.length > 0 && existingRecords[0].notes?.includes('Candidate ID:')) {
      const match = existingRecords[0].notes.match(/Candidate ID: ([a-zA-Z0-9_-]+)/);
      candidateId = match ? match[1] : null;
    }

    if (!candidateId) {
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
          custom_id: staffProfile.id
        })
      });

      if (!candidateResponse.ok) {
        const error = await candidateResponse.text();
        throw new Error(`Checkr candidate creation failed: ${error}`);
      }

      const candidate = await candidateResponse.json();
      candidateId = candidate.id;
    }

    // Create professional license verification
    const verificationResponse = await fetch('https://api.checkr.com/v1/screenings', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(checkrApiKey + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        type: 'professional_license_verification',
        license_number: license_number,
        license_state: license_state,
        license_type: license_type || 'nursing'
      })
    });

    if (!verificationResponse.ok) {
      const error = await verificationResponse.text();
      throw new Error(`License verification failed: ${error}`);
    }

    const verification = await verificationResponse.json();

    // Create compliance record
    await base44.asServiceRole.entities.ComplianceRecord.create({
      user_email: staff_email,
      record_type: 'license_verification',
      document_name: `${license_type} License - ${license_state}`,
      verification_status: 'pending',
      third_party_verification_id: verification.id,
      notes: `Automated license verification. Screening ID: ${verification.id}, License: ${license_number}, State: ${license_state}`
    });

    // Send notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: staff_email,
      type: 'verification_update',
      title: 'License Verification Initiated',
      message: 'Your professional license verification has been started. You will be notified once complete.',
      priority: 'medium',
      status: 'unread'
    });

    return Response.json({
      success: true,
      screening_id: verification.id,
      status: verification.status
    });

  } catch (error) {
    console.error('License verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});