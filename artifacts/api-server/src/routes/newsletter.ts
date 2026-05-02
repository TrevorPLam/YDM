import { Router, type Request, Response, NextFunction } from "express";
import { validateRequest } from "../middlewares/validation";
import { newsletterRateLimit } from "../middlewares/rateLimit";
import { newsletterService } from "../services/newsletter";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

/**
 * Newsletter routes module
 * Implements newsletter subscription endpoint following OpenAPI specification
 * Uses thin controllers that delegate to services
 * Follows DDD patterns and task requirements
 */

const router = Router();

/**
 * POST /api/newsletter
 * Subscribe an email to the newsletter
 * 
 * Request body: NewsletterSubscription
 * Response: NewsletterResponse (201) or NewsletterResponse (200) for existing, or Error (400/500)
 */
router.post(
  "/",
  newsletterRateLimit,
  validateRequest(SubscribeNewsletterBody as any),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Request body is already validated by middleware
      const subscriptionData = req.body as any;

      logger.info({
        msg: "Processing newsletter subscription",
        email: subscriptionData.email,
        source: subscriptionData.source || "footer",
      });

      // Check for existing subscription first to determine correct status code
      const existingSubscription = await newsletterService.findActiveSubscription(subscriptionData.email);
      const isNewSubscription = existingSubscription === null;

      // Delegate to newsletter service for business logic
      const result = await newsletterService.subscribe({
        email: subscriptionData.email,
        firstName: subscriptionData.firstName,
        lastName: subscriptionData.lastName,
        source: subscriptionData.source,
      });

      logger.info({
        msg: "Newsletter subscription processed successfully",
        subscriptionId: result.id,
        publicId: result.publicId,
        email: result.email,
        isNewSubscription,
      });

      // Return 201 for new subscriptions, 200 for existing ones (idempotent response)
      const statusCode = isNewSubscription ? 201 : 200;

      return res.status(statusCode).json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to process newsletter subscription",
        error: error instanceof Error ? error.message : String(error),
        email: req.body?.email,
      });

      // Pass error to error handling middleware
      next(error);
      return;
    }
  }
);

/**
 * DELETE /api/newsletter
 * Unsubscribe an email from the newsletter
 * 
 * Request body: { email: string, reason?: string }
 * Response: 204 (No Content) or Error (400/404/500)
 */
router.delete(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, reason } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({
          error: "Email is required for unsubscription",
        });
      }

      logger.info({
        msg: "Processing newsletter unsubscription",
        email,
        reason,
      });

      // Delegate to newsletter service for business logic
      await newsletterService.unsubscribe(email, reason);

      logger.info({
        msg: "Newsletter unsubscription processed successfully",
        email,
        reason,
      });

      // Return 204 No Content for successful unsubscription
      return res.status(204).send();
    } catch (error) {
      logger.error({
        msg: "Failed to process newsletter unsubscription",
        error: error instanceof Error ? error.message : String(error),
        email: req.body?.email,
        reason: req.body?.reason,
      });

      // Pass error to error handling middleware
      next(error);
      return;
    }
  }
);

/**
 * GET /api/newsletter/:publicId
 * Get newsletter subscription by public ID (for future features)
 * 
 * Response: NewsletterResponse (200) or Error (404/500)
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
        msg: "Retrieving newsletter subscription by public ID",
        publicId,
      });

      const subscription = await newsletterService.getSubscriptionByPublicId(publicId);

      if (!subscription) {
        return res.status(404).json({
          error: "Newsletter subscription not found",
        });
      }

      logger.info({
        msg: "Newsletter subscription retrieved successfully",
        subscriptionId: subscription.id,
        publicId: subscription.publicId,
      });

      return res.json(subscription);
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve newsletter subscription",
        error: error instanceof Error ? error.message : String(error),
        publicId: req.params?.publicId,
      });

      next(error);
      return;
    }
  }
);

export default router;
