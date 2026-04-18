'use server'

import { sendEmail } from "@/lib/email";

export async function sendContactForm(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        return { success: false, error: "Missing required fields" };
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Inquiry - Recruit Sphere</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; pt: 10px;">
                This message was sent via the Recruit Sphere Contact Form.
            </p>
        </div>
    `;

    try {
        const result = await sendEmail({
            to: "varni1505@gmail.com",
            subject: `New Business Inquiry from ${name} (${company || 'Company'})`,
            html
        });

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: "Failed to send email" };
        }
    } catch (error: any) {
        console.error("Contact form action error:", error);
        return { success: false, error: error.message };
    }
}
