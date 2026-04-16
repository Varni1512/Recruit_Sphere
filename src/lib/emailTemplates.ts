export function getRecruitmentEmailTemplate({ 
    candidateName, 
    role, 
    status, 
    reason, 
    message 
}: { 
    candidateName: string; 
    role: string; 
    status: string; 
    reason?: string; 
    message: string; 
}) {
    const statusColors: Record<string, string> = {
        'Applied': '#2563eb',
        'Shortlisted': '#059669',
        'Rejected': '#dc2626',
        'Coding Round': '#7c3aed',
        'AI Interview Round': '#0891b2',
        'Interview Round': '#ea580c',
        'Hire': '#059669',
    };

    const color = statusColors[status] || '#4b5563';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    
                    <!-- Top subtle color band -->
                    <tr>
                        <td style="height: 4px; background-color: ${color};"></td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #f3f4f6;">
                            <div style="font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">
                                <span style="color: ${color};">Recruit</span>Sphere
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Application Update</h2>
                            
                            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                Hi <strong>${candidateName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                ${message}
                            </p>

                            <!-- Role and Status Card -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; border: 1px solid #f3f4f6; border-radius: 8px; padding: 24px;">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6b7280; margin-bottom: 4px;">Role Profile</div>
                                        <div style="font-size: 16px; font-weight: 600; color: #111827;">${role}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td ${reason ? 'style="padding-bottom: 16px;"' : ''}>
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6b7280; margin-bottom: 8px;">Process Status</div>
                                        <div>
                                            <span style="display: fill; background-color: ${color}; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">
                                                ${status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                ${reason ? `
                                <tr>
                                    <td style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6b7280; margin-bottom: 4px;">Feedback / Action</div>
                                        <div style="font-size: 14px; color: #4b5563; font-style: italic; line-height: 1.5;">${reason}</div>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>

                            <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                For a detailed overview of your application timeline and next steps, please log in to your candidate portal.
                            </p>

                            <!-- Call to Action -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://recruit-sphere.vercel.app'}/candidate/applications" 
                                           style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.2px;">
                                           Access Candidate Portal
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 32px 40px; border-top: 1px solid #f3f4f6;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #4b5563; text-align: center;">
                                Recruit Sphere Talent Team
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
                                This is an automated notification regarding your application.<br>
                                Please do not reply directly to this email.<br><br>
                                &copy; ${new Date().getFullYear()} Recruit Sphere. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
