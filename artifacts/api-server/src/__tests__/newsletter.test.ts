import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import app from "../app";
import { db } from "@workspace/db";
import { newsletterSubscriptions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

/**
 * Integration tests for newsletter subscription endpoint
 * Follows TDD approach - write failing test first, then implement
 * Tests BDD scenarios from docs/features/newsletter.feature
 */

describe("Newsletter API", () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    await db.delete(newsletterSubscriptions);
  });

  afterAll(async () => {
    // Clean up test data after running tests
    await db.delete(newsletterSubscriptions);
  });

  describe("POST /api/newsletter", () => {
    it("should return 201 for new subscriber", async () => {
      const newSubscriber = {
        email: "new@example.com",
        firstName: "John",
        lastName: "Doe",
        source: "footer",
      };

      const response = await request(app)
        .post("/api/newsletter")
        .send(newSubscriber)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        publicId: expect.any(String),
        email: "new@example.com",
        firstName: "John",
        lastName: "Doe",
        source: "footer",
        isActive: true,
        createdAt: expect.any(String),
      });

      // Verify subscription was saved to database
      const savedSubscription = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, "new@example.com"))
        .limit(1);

      expect(savedSubscription).toHaveLength(1);
      expect(savedSubscription[0].email).toBe("new@example.com");
      expect(savedSubscription[0].isActive).toBe(true);
    });

    it("should return 200 for existing subscriber (idempotent)", async () => {
      // First, create a subscription
      const existingSubscriber = {
        email: "existing@example.com",
        firstName: "Jane",
        source: "blog",
      };

      await request(app)
        .post("/api/newsletter")
        .send(existingSubscriber)
        .expect(201);

      // Then try to subscribe the same email again
      const duplicateResponse = await request(app)
        .post("/api/newsletter")
        .send(existingSubscriber)
        .expect(200);

      expect(duplicateResponse.body).toMatchObject({
        id: expect.any(Number),
        publicId: expect.any(String),
        email: "existing@example.com",
        firstName: "Jane",
        source: "blog",
        isActive: true,
        createdAt: expect.any(String),
      });

      // Verify only one subscription exists in database
      const allSubscriptions = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, "existing@example.com"));

      expect(allSubscriptions).toHaveLength(1);
    });

    it("should return 400 for invalid email format", async () => {
      const invalidSubscriber = {
        email: "invalid-email",
        firstName: "Test",
        source: "footer",
      };

      const response = await request(app)
        .post("/api/newsletter")
        .send(invalidSubscriber)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid email format");

      // Verify no subscription was created
      const savedSubscription = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, "invalid-email"))
        .limit(1);

      expect(savedSubscription).toHaveLength(0);
    });

    it("should return 400 for missing required email field", async () => {
      const incompleteSubscriber = {
        firstName: "Test",
        source: "footer",
      };

      const response = await request(app)
        .post("/api/newsletter")
        .send(incompleteSubscriber)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("email");
    });

    it("should handle rate limiting", async () => {
      const subscriber = {
        email: "ratelimit@example.com",
        firstName: "Test",
        source: "footer",
      };

      // Make 11 requests rapidly (exceeding the limit of 10)
      const requests = Array(11).fill(null).map(() =>
        request(app)
          .post("/api/newsletter")
          .send(subscriber)
      );

      // First 10 should succeed, 11th should be rate limited
      const responses = await Promise.allSettled(requests);

      const successfulResponses = responses
        .filter((result) => result.status === "fulfilled" && result.value.status === 201)
        .length;

      const rateLimitedResponse = responses
        .find((result) => result.status === "fulfilled" && result.value.status === 429);

      expect(successfulResponses).toBe(10);
      expect(rateLimitedResponse).toBeDefined();
    });
  });

  describe("GET /api/newsletter/:publicId", () => {
    it("should return subscription by public ID", async () => {
      // First create a subscription to get a public ID
      const createResponse = await request(app)
        .post("/api/newsletter")
        .send({
          email: "retrieve@example.com",
          source: "test",
        })
        .expect(201);

      const { publicId } = createResponse.body;

      // Then retrieve it
      const getResponse = await request(app)
        .get(`/api/newsletter/${publicId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: expect.any(Number),
        publicId,
        email: "retrieve@example.com",
        isActive: true,
        createdAt: expect.any(String),
      });
    });

    it("should return 404 for non-existent public ID", async () => {
      const response = await request(app)
        .get("/api/newsletter/nonexistent")
        .expect(404);

      expect(response.body).toMatchObject({
        error: "Newsletter subscription not found",
      });
    });
  });

  describe("DELETE /api/newsletter", () => {
    it("should unsubscribe active subscription", async () => {
      // First create a subscription
      const createResponse = await request(app)
        .post("/api/newsletter")
        .send({
          email: "unsubscribe@example.com",
          source: "test",
        })
        .expect(201);

      // Then unsubscribe it
      const unsubscribeResponse = await request(app)
        .delete("/api/newsletter")
        .send({
          email: "unsubscribe@example.com",
          reason: "No longer interested",
        })
        .expect(204);

      // Verify subscription is now inactive
      const subscription = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, "unsubscribe@example.com"))
        .limit(1);

      expect(subscription).toHaveLength(1);
      expect(subscription[0].isActive).toBe(false);
      expect(subscription[0].unsubscribeReason).toBe("No longer interested");
    });

    it("should return 400 for missing email in unsubscribe", async () => {
      const response = await request(app)
        .delete("/api/newsletter")
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Email is required for unsubscription",
      });
    });

    it("should return 204 for non-existent email unsubscribe", async () => {
      const response = await request(app)
        .delete("/api/newsletter")
        .send({
          email: "nonexistent@example.com",
        reason: "Test",
        })
        .expect(204); // Graceful handling - no error for non-existent subscription
    });
  });
});
