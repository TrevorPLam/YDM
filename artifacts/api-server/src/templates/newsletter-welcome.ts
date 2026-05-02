/**
 * Newsletter welcome email templates
 * Generates both HTML and plain text versions for newsletter subscription confirmations
 */

export interface NewsletterWelcomeData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  source: string;
}

/**
 * Generate HTML welcome email for newsletter subscription
 */
export function generateNewsletterWelcomeHtml(data: NewsletterWelcomeData): string {
  const firstName = data.firstName || "Subscriber";
  const lastName = data.lastName || "";
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0066ff, #00aaff); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Our Newsletter! 🎉</h1>
        </div>
        
        <p>Dear ${displayName},</p>
        <p>Thank you for subscribing to our newsletter! You're now on our list to receive the latest updates and insights.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">You can expect:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Weekly updates on industry trends</li>
            <li>Exclusive content and insights</li>
            <li>Early access to new features</li>
            <li>Special offers and announcements</li>
          </ul>
        </div>
        
        <div style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066ff;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Subscription Details:</strong><br>
            Email: ${data.email}<br>
            Source: ${data.source}
          </p>
        </div>
        
        <p style="margin-top: 30px;">Best regards,<br>The Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p style="margin: 0;">
            You received this email because you subscribed to our newsletter.<br>
            If you didn't subscribe or would like to unsubscribe, please contact us.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate plain text welcome email for newsletter subscription
 */
export function generateNewsletterWelcomeText(data: NewsletterWelcomeData): string {
  const firstName = data.firstName || "Subscriber";
  const lastName = data.lastName || "";
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;
  
  return `
Welcome to Our Newsletter!

Dear ${displayName},

Thank you for subscribing to our newsletter! You're now on our list to receive the latest updates and insights.

You can expect:
- Weekly updates on industry trends
- Exclusive content and insights
- Early access to new features
- Special offers and announcements

Subscription Details:
Email: ${data.email}
Source: ${data.source}

Best regards,
The Team

---
You received this email because you subscribed to our newsletter.
If you didn't subscribe or would like to unsubscribe, please contact us.
  `.trim();
}
