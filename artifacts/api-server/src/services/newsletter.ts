import { db } from "@workspace/db";
import { newsletterSubscriptions } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { emailService } from "./email";
import { logger } from "../lib/logger";
import type { SubscribeNewsletterBody } from "@workspace/api-zod";
import crypto from "crypto";

/**
 * Newsletter service implementing business logic for newsletter subscriptions
 * Follows DDD patterns and task requirements:
 * - Part of Communication bounded context
 * - Uses ubiquitous language from domain
 * - Idempotent operations to prevent duplicates
 * - Thin interface hiding implementation details
 * - Proper error handling and logging
 */

export interface NewsletterSubscriptionRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
}

export interface NewsletterSubscriptionResponse {
  id: number;
  publicId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  source: string;
  isActive: boolean;
  createdAt: string;
}

class NewsletterService {
  /**
   * Subscribe an email to the newsletter
   * Handles idempotency by checking for existing subscriptions
   * Returns 201 for new subscriptions, 200 for existing ones
   */
  async subscribe(payload: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> {
    try {
      logger.info({
        msg: "Processing newsletter subscription",
        email: payload.email,
        source: payload.source || "footer",
      });

      // Check if email is already subscribed (idempotency check)
      const existingSubscription = await this.findActiveSubscription(payload.email);

      if (existingSubscription) {
        logger.info({
          msg: "Email already subscribed, returning existing subscription",
          email: payload.email,
          subscriptionId: existingSubscription.id,
        });

        // Return existing subscription (idempotent response)
        return {
          id: existingSubscription.id,
          publicId: existingSubscription.publicId,
          email: existingSubscription.email,
          firstName: existingSubscription.firstName || undefined,
          lastName: existingSubscription.lastName || undefined,
          source: existingSubscription.source,
          isActive: existingSubscription.isActive,
          createdAt: new Date(existingSubscription.createdAt).toISOString(),
        };
      }

      // Generate a unique public ID for new subscription
      const publicId = this.generatePublicId();

      // Prepare subscription data for database insertion
      const subscriptionData = {
        publicId,
        email: payload.email,
        firstName: payload.firstName || null,
        lastName: payload.lastName || null,
        source: payload.source || "footer",
        isActive: true,
        unsubscribeReason: null,
        unsubscribedAt: null,
        preferences: null,
      };

      // Insert subscription into database
      const result = await db.insert(newsletterSubscriptions).values(subscriptionData).returning();

      if (!result || result.length === 0) {
        throw new Error("Failed to save newsletter subscription");
      }

      const savedSubscription = result[0];

      logger.info({
        msg: "Newsletter subscription saved successfully",
        subscriptionId: savedSubscription.id,
        publicId: savedSubscription.publicId,
        email: savedSubscription.email,
      });

      // Send welcome email asynchronously
      // Don't wait for email to complete to avoid blocking response
      this.sendWelcomeEmail({
        email: savedSubscription.email,
        firstName: savedSubscription.firstName,
        lastName: savedSubscription.lastName,
        source: savedSubscription.source,
      }).catch((error) => {
        logger.error({
          msg: "Failed to send welcome email",
          error: error instanceof Error ? error.message : String(error),
          subscriptionId: savedSubscription.id,
        });
      });

      // Return response matching OpenAPI schema
      const response: NewsletterSubscriptionResponse = {
        id: savedSubscription.id,
        publicId: savedSubscription.publicId,
        email: savedSubscription.email,
        firstName: savedSubscription.firstName || undefined,
        lastName: savedSubscription.lastName || undefined,
        source: savedSubscription.source,
        isActive: savedSubscription.isActive,
        createdAt: new Date(savedSubscription.createdAt).toISOString(),
      };

      return response;
    } catch (error) {
      logger.error({
        msg: "Failed to process newsletter subscription",
        error: error instanceof Error ? error.message : String(error),
        email: payload.email,
      });

      // Re-throw to let route handler handle the error response
      throw error;
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * Sets isActive to false and records unsubscribe reason
   */
  async unsubscribe(email: string, reason?: string): Promise<void> {
    try {
      logger.info({
        msg: "Processing newsletter unsubscription",
        email,
        reason,
      });

      // Find active subscription
      const subscription = await this.findActiveSubscription(email);

      if (!subscription) {
        logger.info({
          msg: "No active subscription found for email",
          email,
        });
        return; // Graceful exit - no subscription to unsubscribe
      }

      // Update subscription to inactive
      await db
        .update(newsletterSubscriptions)
        .set({
          isActive: false,
          unsubscribeReason: reason || null,
          unsubscribedAt: new Date().toISOString(),
        })
        .where(eq(newsletterSubscriptions.email, email));

      logger.info({
        msg: "Newsletter subscription deactivated successfully",
        subscriptionId: subscription.id,
        email,
        reason,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to process newsletter unsubscription",
        error: error instanceof Error ? error.message : String(error),
        email,
        reason,
      });

      throw error;
    }
  }

  /**
   * Find an active subscription by email
   */
  async findActiveSubscription(email: string): Promise<any | null> {
    // Find active subscription using and condition
    const subscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(and(eq(newsletterSubscriptions.email, email), eq(newsletterSubscriptions.isActive, true)))
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return null;
    }

    return subscription[0];
  }

  /**
   * Get a subscription by public ID (for future features)
   */
  async getSubscriptionByPublicId(publicId: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.publicId, publicId))
        .limit(1);

      if (!result || result.length === 0) {
        return null;
      }

      const subscription = result[0];

      return {
        id: subscription.id,
        publicId: subscription.publicId,
        email: subscription.email,
        firstName: subscription.firstName || undefined,
        lastName: subscription.lastName || undefined,
        source: subscription.source,
        isActive: subscription.isActive,
        createdAt: new Date(subscription.createdAt).toISOString(),
      };
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve newsletter subscription",
        error: error instanceof Error ? error.message : String(error),
        publicId,
      });

      throw error;
    }
  }

  /**
   * Send welcome email for newsletter subscription
   * Runs asynchronously to avoid blocking main flow
   */
  private async sendWelcomeEmail(subscription: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    source: string;
  }): Promise<void> {
    try {
      const subject = "Welcome to Our Newsletter!";
      
      const html = this.generateWelcomeEmailHtml(subscription);
      const text = this.generateWelcomeEmailText(subscription);

      await emailService.sendEmail({
        to: subscription.email,
        subject,
        text,
        html,
      });
      
      logger.info({
        msg: "Welcome email sent successfully",
        email: subscription.email,
        firstName: subscription.firstName,
      });
    } catch (error) {
      // Error is already logged by the email service
      // This catch prevents the error from propagating
      throw error;
    }
  }

  /**
   * Generate HTML welcome email for newsletter subscription
   */
  private generateWelcomeEmailHtml(subscription: any): string {
    const firstName = subscription.firstName || "Subscriber";
    
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0066ff, #00aaff); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Our Newsletter! 🎉</h1>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h2 style="color: #0066ff; margin-top: 0;">Hello ${firstName}!</h2>
            <p style="color: #333; line-height: 1.6;">Thank you for subscribing to our newsletter. You'll now receive updates about our latest news, insights, and exclusive content.</p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #0066ff;">
              <p style="margin: 0; color: #666;"><strong>Subscription Details:</strong></p>
              <ul style="color: #666; padding-left: 20px;">
                <li><strong>Email:</strong> ${subscription.email}</li>
                <li><strong>Source:</strong> ${subscription.source}</li>
                <li><strong>Status:</strong> Active ✅</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              If you didn't subscribe to this newsletter, please ignore this email or contact us.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email was sent automatically from our newsletter system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text welcome email for newsletter subscription
   */
  private generateWelcomeEmailText(subscription: any): string {
    const firstName = subscription.firstName || "Subscriber";
    
    return `
Welcome to Our Newsletter!

Hello ${firstName}!

Thank you for subscribing to our newsletter. You'll now receive updates about our latest news, insights, and exclusive content.

Subscription Details:
Email: ${subscription.email}
Source: ${subscription.source}
Status: Active

If you didn't subscribe to this newsletter, please ignore this email or contact us.

---
This email was sent automatically from our newsletter system.
    `.trim();
  }

  /**
   * Generate a unique public ID for newsletter subscriptions
   * Uses crypto for better randomness than Math.random()
   */
  private generatePublicId(): string {
    return crypto.randomBytes(6).toString("hex").toUpperCase();
  }
}

// Export singleton instance
export const newsletterService = new NewsletterService();
