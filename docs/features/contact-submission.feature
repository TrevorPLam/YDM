Feature: Contact submission
  As a website visitor
  I want to submit a contact form
  So that I can inquire about services or request information

  Background:
    Given the contact API endpoint is available at /api/contacts

  Scenario: Successful contact submission
    Given a valid contact form payload
      | field      | value                         |
      | fullName   | John Doe                      |
      | email      | john.doe@example.com          |
      | company    | Acme Corporation              |
      | phone      | +1-555-0123                   |
      | message    | I am interested in your services. Please contact me. |
    When the form is submitted to /api/contacts
    Then a 201 response is returned
    And the response contains a contact id and publicId
    And the contact is saved in the database
    And a notification email is sent to the configured address

  Scenario: Contact submission with minimal required fields
    Given a contact form payload with only required fields
      | field    | value                |
      | fullName | Jane Smith           |
      | email    | jane.smith@email.com |
      | message  | Hello, I need help.  |
    When the form is submitted to /api/contacts
    Then a 201 response is returned
    And the contact is saved in the database

  Scenario: Contact submission with invalid email format
    Given a contact form payload
      | field    | value           |
      | fullName | Invalid User    |
      | email    | not-an-email    |
      | message  | Test message.   |
    When the form is submitted to /api/contacts
    Then a 400 response is returned
    And the response contains validation errors for the email field

  Scenario: Contact submission with missing required fields
    Given an empty contact form payload
    When the form is submitted to /api/contacts
    Then a 400 response is returned
    And the response contains validation errors for fullName, email, and message

  Scenario: Contact submission with message too short
    Given a contact form payload
      | field    | value        |
      | fullName | Short User   |
      | email    | user@test.com |
      | message  | Hi.          |
    When the form is submitted to /api/contacts
    Then a 400 response is returned
    And the response contains validation error indicating minimum message length
