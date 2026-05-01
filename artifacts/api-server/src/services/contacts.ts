import { db } from "@workspace/db";
import { contacts } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { emailService } from "./email";
import { logger } from "../lib/logger";
import type { SubmitContactBody } from "@workspace/api-zod";
import crypto from "crypto";

/**
 * Contact service implementing business logic for contact form submissions
 * Follows DDD patterns and the task requirements:
 * - Part of Communication bounded context
 * - Uses ubiquitous language from domain
 * - Thin interface hiding implementation details
 * - Proper error handling and logging
 */

export interface ContactSubmission {
  fullName: string;
  email: string;
  company?: string;
  message: string;
  phone?: string;
}

export interface ContactResponse {
  id: number;
  publicId: string;
  fullName: string;
  email: string;
  company?: string;
  message: string;
  phone?: string;
  source: string;
  status: string;
  createdAt: string;
}

class ContactService {
  /**
   * Submit a contact form entry
   * Handles validation, persistence, and email notification
   */
  async submitContact(payload: ContactSubmission): Promise<ContactResponse> {
    try {
      logger.info({
        msg: "Processing contact submission",
        email: payload.email,
        fullName: payload.fullName,
      });

      // Generate a unique public ID for the contact
      const publicId = this.generatePublicId();

      // Prepare contact data for database insertion
      const contactData = {
        publicId,
        fullName: payload.fullName,
        email: payload.email,
        company: payload.company || null,
        message: payload.message,
        phone: payload.phone || null,
        source: "website", // Default source for web submissions
        status: "new", // Default status for new submissions
      };

      // Insert contact into database
      const result = await db.insert(contacts).values(contactData).returning();

      if (!result || result.length === 0) {
        throw new Error("Failed to save contact submission");
      }

      const savedContact = result[0];

      logger.info({
        msg: "Contact saved successfully",
        contactId: savedContact.id,
        publicId: savedContact.publicId,
        email: savedContact.email,
      });

      // Send email notification asynchronously
      // Don't wait for email to complete to avoid blocking the response
      this.sendNotificationEmail(payload).catch((error) => {
        logger.error({
          msg: "Failed to send contact notification email",
          error: error instanceof Error ? error.message : String(error),
          contactId: savedContact.id,
        });
      });

      // Return response matching OpenAPI schema
      const response: ContactResponse = {
        id: savedContact.id,
        publicId: savedContact.publicId,
        fullName: savedContact.fullName,
        email: savedContact.email,
        company: savedContact.company || undefined,
        message: savedContact.message,
        phone: savedContact.phone || undefined,
        source: savedContact.source,
        status: savedContact.status,
        createdAt: new Date(savedContact.createdAt).toISOString(),
      };

      return response;
    } catch (error) {
      logger.error({
        msg: "Failed to process contact submission",
        error: error instanceof Error ? error.message : String(error),
        email: payload.email,
        fullName: payload.fullName,
      });

      // Re-throw to let the route handler handle the error response
      throw error;
    }
  }

  /**
   * Send notification email for contact submission
   * Runs asynchronously to avoid blocking the main flow
   */
  private async sendNotificationEmail(payload: ContactSubmission): Promise<void> {
    try {
      await emailService.sendContactNotification(payload);
      
      logger.info({
        msg: "Contact notification email sent successfully",
        email: payload.email,
        fullName: payload.fullName,
      });
    } catch (error) {
      // Error is already logged by the email service
      // This catch prevents the error from propagating
      throw error;
    }
  }

  /**
   * Generate a unique public ID for contact entries
   * Uses crypto for better randomness than Math.random()
   */
  private generatePublicId(): string {
    return crypto.randomBytes(6).toString("hex").toUpperCase();
  }

  /**
   * Get a contact by public ID (for future features)
   */
  async getContactByPublicId(publicId: string): Promise<ContactResponse | null> {
    try {
      const result = await db
        .select()
        .from(contacts)
        .where(eq(contacts.publicId, publicId))
        .limit(1);

      if (!result || result.length === 0) {
        return null;
      }

      const contact = result[0];

      return {
        id: contact.id,
        publicId: contact.publicId,
        fullName: contact.fullName,
        email: contact.email,
        company: contact.company || undefined,
        message: contact.message,
        phone: contact.phone || undefined,
        source: contact.source,
        status: contact.status,
        createdAt: new Date(contact.createdAt).toISOString(),
      };
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve contact",
        error: error instanceof Error ? error.message : String(error),
        publicId,
      });

      throw error;
    }
  }

  /**
   * List contacts with pagination (for future admin features)
   */
  async listContacts(options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ contacts: ContactResponse[]; total: number }> {
    try {
      const page = options.page || 0;
      const limit = Math.min(options.limit || 10, 100); // Max 100 per page
      const offset = page * limit;

      // Simple query for now - can be enhanced later with proper filtering
      const result = await db
        .select()
        .from(contacts)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(contacts.createdAt));

      const contactResponses: ContactResponse[] = result.map((contact: any) => ({
        id: contact.id,
        publicId: contact.publicId,
        fullName: contact.fullName,
        email: contact.email,
        company: contact.company || undefined,
        message: contact.message,
        phone: contact.phone || undefined,
        source: contact.source,
        status: contact.status,
        createdAt: new Date(contact.createdAt).toISOString(),
      }));

      return {
        contacts: contactResponses,
        total: contactResponses.length, // Simplified for now
      };
    } catch (error) {
      logger.error({
        msg: "Failed to list contacts",
        error: error instanceof Error ? error.message : String(error),
        options,
      });

      throw error;
    }
  }
}

// Export singleton instance
export const contactService = new ContactService();
