/**
 * Contact form notification email templates
 * Generates both HTML and plain text versions for contact form submissions
 */

export interface ContactNotificationData {
  fullName: string;
  email: string;
  company?: string;
  message: string;
  phone?: string;
}

/**
 * Generate HTML email for contact form submission
 */
export function generateContactNotificationHtml(data: ContactNotificationData): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0066ff;">New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This email was sent automatically from the contact form.
        </p>
      </body>
    </html>
  `;
}

/**
 * Generate plain text email for contact form submission
 */
export function generateContactNotificationText(data: ContactNotificationData): string {
  return `
New Contact Form Submission

Name: ${data.fullName}
Email: ${data.email}
${data.company ? `Company: ${data.company}\n` : ''}
${data.phone ? `Phone: ${data.phone}\n` : ''}
Message:
${data.message}

---
This email was sent automatically from the contact form.
  `.trim();
}
