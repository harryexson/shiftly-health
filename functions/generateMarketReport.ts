import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get market data
    const shifts = await base44.entities.Shift.filter({});
    const staffProfiles = await base44.entities.StaffProfile.filter({});
    const applications = await base44.entities.ShiftApplication.filter({});

    // Calculate market statistics
    const openShifts = shifts.filter(s => s.status === 'open');
    const filledShifts = shifts.filter(s => s.status === 'filled' || s.status === 'completed');
    
    // Rate analysis by staff type
    const ratesByType = {
      licensed: shifts.filter(s => s.staff_type_required === 'licensed').map(s => s.hourly_rate).filter(Boolean),
      unlicensed_dsp: shifts.filter(s => s.staff_type_required === 'unlicensed_dsp').map(s => s.hourly_rate).filter(Boolean),
      unlicensed_caregiver: shifts.filter(s => s.staff_type_required === 'unlicensed_caregiver').map(s => s.hourly_rate).filter(Boolean)
    };

    const calcStats = (rates) => {
      if (rates.length === 0) return { min: 0, max: 0, avg: 0 };
      const min = Math.min(...rates);
      const max = Math.max(...rates);
      const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
      return { min, max, avg: Math.round(avg * 100) / 100 };
    };

    const licensedStats = calcStats(ratesByType.licensed);
    const dspStats = calcStats(ratesByType.unlicensed_dsp);
    const caregiverStats = calcStats(ratesByType.unlicensed_caregiver);

    // Fill rate analysis
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
    const fillRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

    // Time-based demand analysis
    const urgentShifts = shifts.filter(s => s.urgent).length;
    const urgentPercentage = shifts.length > 0 ? Math.round((urgentShifts / shifts.length) * 100) : 0;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthStaff Connect', margin, 25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Market Analysis & Competitive Pricing Report', margin, 35);

    y = 55;
    doc.setTextColor(0, 0, 0);

    // Report date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })}`, margin, y);
    y += 15;

    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This report provides a comprehensive analysis of the current healthcare staffing market on our platform. With ${staffProfiles.length} active healthcare professionals and ${shifts.length} total shifts posted, the platform demonstrates strong market activity.`;
    const summaryLines = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 15;

    // Market Overview Section
    doc.setFillColor(240, 249, 255);
    doc.rect(margin - 5, y - 5, pageWidth - margin * 2 + 10, 45, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Market Overview', margin, y + 5);
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    const col1 = margin;
    const col2 = margin + 60;
    const col3 = margin + 120;

    doc.text(`Total Shifts: ${shifts.length}`, col1, y);
    doc.text(`Open Positions: ${openShifts.length}`, col2, y);
    doc.text(`Fill Rate: ${fillRate}%`, col3, y);
    y += 8;
    doc.text(`Active Staff: ${staffProfiles.length}`, col1, y);
    doc.text(`Completed: ${filledShifts.length}`, col2, y);
    doc.text(`Urgent: ${urgentPercentage}%`, col3, y);
    y += 30;

    // Competitive Pricing Analysis
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Competitive Pricing Analysis', margin, y);
    y += 15;

    // Table header
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Staff Type', margin + 5, y);
    doc.text('Min Rate', margin + 70, y);
    doc.text('Max Rate', margin + 100, y);
    doc.text('Avg Rate', margin + 130, y);
    y += 10;

    // Table rows
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    const drawRow = (label, stats, bgColor) => {
      if (bgColor) {
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
      }
      doc.text(label, margin + 5, y);
      doc.text(`$${stats.min.toFixed(2)}`, margin + 70, y);
      doc.text(`$${stats.max.toFixed(2)}`, margin + 100, y);
      doc.text(`$${stats.avg.toFixed(2)}`, margin + 130, y);
      y += 10;
    };

    drawRow('Licensed (RN/LPN/NP)', licensedStats, [249, 250, 251]);
    drawRow('DSP (Direct Support)', dspStats, [255, 255, 255]);
    drawRow('Caregiver/CNA', caregiverStats, [249, 250, 251]);
    y += 10;

    // Market Recommendations
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Pricing Recommendations', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    const recommendations = [
      `• Licensed Professionals: Recommend offering $${Math.round(licensedStats.avg * 1.05)}-${Math.round(licensedStats.avg * 1.15)}/hr to attract top talent`,
      `• DSP Staff: Market rate of $${Math.round(dspStats.avg)}/hr; urgent shifts warrant +15% premium`,
      `• Caregivers: Competitive range $${Math.round(caregiverStats.avg * 0.95)}-${Math.round(caregiverStats.avg * 1.1)}/hr`,
      `• Weekend/Holiday shifts typically command 15-20% premium rates`,
      `• Night shifts average 10-15% higher than day shifts`
    ];

    recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(rec, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    });
    y += 10;

    // Demand Analysis
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Demand Analysis', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    const demandInsights = [
      `• ${urgentPercentage}% of shifts are marked urgent, indicating high immediate demand`,
      `• Average ${Math.round(totalApplications / Math.max(shifts.length, 1))} applications per shift`,
      `• Platform fill rate of ${fillRate}% - ${fillRate > 70 ? 'excellent' : fillRate > 50 ? 'good' : 'opportunity for improvement'}`,
      `• ${staffProfiles.filter(s => s.verification_status === 'verified').length} verified professionals ready to work`
    ];

    demandInsights.forEach(insight => {
      doc.text(insight, margin, y);
      y += 7;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFillColor(37, 99, 235);
    doc.rect(0, footerY - 5, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('HealthStaff Connect - Healthcare Staffing Platform', margin, footerY + 5);
    doc.text(`Report generated for: ${user.email}`, margin, footerY + 10);
    doc.text('Confidential - For internal use only', pageWidth - margin - 50, footerY + 5);

    // Generate PDF bytes
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=market-analysis-report.pdf'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});