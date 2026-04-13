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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: ${color}; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Recruit Sphere</h1>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 5px 0 0 0; font-size: 14px;">Your Career, Reimagined</p>
            </div>
            
            <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0;">Application Update</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear <strong>${candidateName}</strong>,</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid ${color};">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Job Position</p>
                    <p style="margin: 5px 0 15px 0; color: #111827; font-size: 18px; font-weight: bold;">${role}</p>
                    
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Current Status</p>
                    <p style="margin: 5px 0 0 0; color: ${color}; font-size: 16px; font-weight: bold;">${status}</p>
                    
                    ${reason ? `
                        <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Feedback</p>
                        <p style="margin: 5px 0 0 0; color: #ef4444; font-size: 14px; font-style: italic;">"${reason}"</p>
                    ` : ''}
                </div>
                
                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                    You can track your application progress in real-time by visiting your dashboard.
                </p>
                
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://recruit-sphere.vercel.app'}/candidate/applications" 
                       style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                       View Application Dashboard
                    </a>
                </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    &copy; 2026 Recruit Sphere AI. All rights reserved.<br>
                    This is an automated message, please do not reply.
                </p>
            </div>
        </div>
    `;
}
