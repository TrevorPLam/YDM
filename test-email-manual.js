/**
 * Manual Email Testing Instructions
 * 
 * To test the email service with your actual SMTP configuration:
 * 
 * 1. Copy .env.example to .env
 * 2. Fill in your actual SMTP credentials in .env:
 *    - SMTP_HOST (e.g., smtp.gmail.com)
 *    - SMTP_PORT (e.g., 587)
 *    - SMTP_USER (your email address)
 *    - SMTP_PASS (your app password)
 *    - EMAIL_FROM (your from address)
 * 
 * 3. Run the integration tests which will test with real SMTP:
 *    pnpm --filter @workspace/api-server test --testPathPattern=email.integration.test.ts
 * 
 * 4. Check the console output for preview URLs from Ethereal Email
 * 
 * 5. For production testing, update the integration test to use your real SMTP
 *    credentials instead of Ethereal Email test accounts.
 * 
 * The integration tests verify:
 * - SMTP connection and authentication
 * - Contact form email sending
 * - Newsletter welcome email sending  
 * - Error handling for invalid emails
 * - Template rendering (both HTML and text)
 */

console.log('📧 Email Service Testing Instructions');
console.log('=====================================');
console.log('');
console.log('1. Set up your .env file with SMTP credentials');
console.log('2. Run: pnpm --filter @workspace/api-server test --testPathPattern=email.integration.test.ts');
console.log('3. Check the preview URLs in the console output');
console.log('4. Verify emails render correctly in the preview');
console.log('');
console.log('For production testing, modify the integration test to use your real SMTP credentials.');
