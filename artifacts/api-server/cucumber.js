const { Given, When, Then } = require('@cucumber/cucumber');

// Define feature steps
const contactSubmissionSteps = contactSubmissionSteps();

// Create Cucumber configuration
module.exports = {
  default: {
    // Required step definitions
    stepDefinitions: [contactSubmissionSteps],
    
    // Test environment
    publishQuiet: true,
    format: 'progress', // Shows progress dots
    
    // Test files
    spec: [
      'src/__tests__/features/contact-submission.feature'
    ],
    
    // Test runner options
    dryRun: false,
    strict: true,
    
    // World configuration
    worldParameters: {
      // Test database configuration
      database: {
        host: 'localhost',
        port: 5432,
        username: 'test',
        password: 'test'
      }
    }
  }
};
