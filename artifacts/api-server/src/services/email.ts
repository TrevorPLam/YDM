import nodemailer from "nodemailer";
import { logger } from "../lib/logger";
import {
  generateContactNotificationHtml,
  generateContactNotificationText,
  type ContactNotificationData,
} from "../templates";

/**
 * Email service configuration and functionality
 * Follows Nodemailer best practices from research:
 * - Pooled connections for performance
 * - Connection verification
 * - Environment-based configuration
 * - Proper error handling and logging
 */

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  /**
   * Load email configuration from environment variables
   */
  private loadConfig(): EmailConfig {
    const config = {
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
      from: process.env.EMAIL_FROM || "noreply@example.com",
    };

    return config;
  }

  /**
   * Validate required configuration
   */
  private validateConfig(): void {
    if (!this.config.auth.user || !this.config.auth.pass) {
      logger.warn("Email service credentials not configured, using test mode");
    }
  }

  /**
   * Initialize and verify the transporter connection
   */
  private async initializeTransporter(): Promise<void> {
    if (this.transporter) {
      return;
    }

    try {
      // Create transporter with pooled connections for performance
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        pool: true, // Use pooled connections
        maxConnections: 5,
        maxMessages: 100,
      });

      // Verify connection following best practices
      if (this.transporter) {
        await this.transporter.verify();
      }
      
      logger.info({
        msg: "Email service initialized successfully",
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to initialize email service",
        error: error instanceof Error ? error.message : String(error),
        host: this.config.host,
        port: this.config.port,
      });
      
      // Don't throw, allow service to continue in degraded mode
      this.transporter = null;
    }
  }

  /**
   * Send email using the configured transporter
   * Asynchronous sending to avoid blocking requests
   */
  async sendEmail(message: EmailMessage): Promise<void> {
    await this.initializeTransporter();

    if (!this.transporter) {
      logger.warn({
        msg: "Email service not available, skipping email send",
        to: message.to,
        subject: message.subject,
      });
      return;
    }

    try {
      const mailOptions = {
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info({
        msg: "Email sent successfully",
        messageId: info.messageId,
        to: message.to,
        subject: message.subject,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to send email",
        error: error instanceof Error ? error.message : String(error),
        to: message.to,
        subject: message.subject,
      });
      
      // Don't throw to avoid breaking the contact submission flow
      // Email failures should be logged but not block the main functionality
    }
  }

  /**
   * Send contact form notification email
   */
  async sendContactNotification(contactData: ContactNotificationData): Promise<void> {
    const subject = `New Contact Form Submission from ${contactData.fullName}`;
    
    const html = generateContactNotificationHtml(contactData);
    const text = generateContactNotificationText(contactData);

    await this.sendEmail({
      to: this.config.from, // Send to admin email (same as from for now)
      subject,
      text,
      html,
    });
  }

  
  /**
   * Check if email service is available and configured
   */
  isAvailable(): boolean {
    return this.transporter !== null;
  }

  /**
   * Check if email service is properly configured with credentials
   */
  isConfigured(): boolean {
    return !!(this.config.auth.user && this.config.auth.pass && this.config.host);
  }

  /**
   * Get email service status for health checks
   */
  getStatus(): {
    configured: boolean;
    available: boolean;
    host: string;
    port: number;
    secure: boolean;
  } {
    return {
      configured: this.isConfigured(),
      available: this.isAvailable(),
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
