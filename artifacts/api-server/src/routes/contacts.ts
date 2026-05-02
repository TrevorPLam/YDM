import { Router, type Request, Response, NextFunction } from "express";
import { validateRequest } from "../middlewares/validation";
import { contactRateLimit } from "../middlewares/rateLimit";
import { contactService } from "../services/contacts";
import { SubmitContactBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

/**
 * Contact routes module
 * Implements the contact form endpoint following the OpenAPI specification
 * Uses thin controllers that delegate to services
 * Follows DDD patterns and the task requirements
 */

const router = Router();

/**
 * POST /api/contacts
 * Submit a contact form entry
 * 
 * Request body: ContactSubmission
 * Response: ContactResponse (201) or Error (400/500)
 */
router.post(
  "/",
  contactRateLimit,
  validateRequest(SubmitContactBody as any),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Request body is already validated by middleware
      const contactData = req.body as any;

      logger.info({
        msg: "Processing contact submission",
        email: contactData.email,
        fullName: contactData.fullName,
      });

      // Delegate to contact service for business logic
      const result = await contactService.submitContact({
        fullName: contactData.fullName,
        email: contactData.email,
        company: contactData.company,
        message: contactData.message,
        phone: contactData.phone,
      });

      logger.info({
        msg: "Contact submission processed successfully",
        contactId: result.id,
        publicId: result.publicId,
        email: result.email,
      });

      // Return 201 with the contact response matching OpenAPI schema
      return res.status(201).json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to process contact submission",
        error: error instanceof Error ? error.message : String(error),
        email: req.body?.email,
        fullName: req.body?.fullName,
      });

      // Pass error to error handling middleware
      next(error);
      return;
    }
  }
);

/**
 * GET /api/contacts/:publicId
 * Get a contact by public ID (for future features)
 * 
 * Response: ContactResponse (200) or Error (404/500)
 */
router.get(
  "/:publicId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;

      if (!publicId || typeof publicId !== "string") {
        return res.status(400).json({
          error: "Invalid public ID",
        });
      }

      logger.info({
        msg: "Retrieving contact by public ID",
        publicId,
      });

      const contact = await contactService.getContactByPublicId(publicId);

      if (!contact) {
        return res.status(404).json({
          error: "Contact not found",
        });
      }

      logger.info({
        msg: "Contact retrieved successfully",
        contactId: contact.id,
        publicId: contact.publicId,
      });

      return res.json(contact);
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve contact",
        error: error instanceof Error ? error.message : String(error),
        publicId: req.params?.publicId,
      });

      next(error);
      return;
    }
  }
);

/**
 * GET /api/contacts
 * List contacts with pagination (for future admin features)
 * 
 * Query parameters: page, limit, status
 * Response: { contacts: ContactResponse[], total: number } (200) or Error (500)
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const status = req.query.status as string | undefined;

      logger.info({
        msg: "Listing contacts",
        page,
        limit,
        status,
      });

      const result = await contactService.listContacts({
        page,
        limit,
        status,
      });

      logger.info({
        msg: "Contacts listed successfully",
        count: result.contacts.length,
        total: result.total,
      });

      return res.json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to list contacts",
        error: error instanceof Error ? error.message : String(error),
        query: req.query,
      });

      next(error);
      return;
    }
  }
);

export default router;
