/**
 * Email templates index
 * Centralized exports for all email template functions
 */

export {
  generateContactNotificationHtml,
  generateContactNotificationText,
  type ContactNotificationData,
} from './contact-notification';

export {
  generateNewsletterWelcomeHtml,
  generateNewsletterWelcomeText,
  type NewsletterWelcomeData,
} from './newsletter-welcome';
