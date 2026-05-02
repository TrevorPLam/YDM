Feature: Newsletter subscription
  Scenario: New subscriber
    Given a new email address
    When a subscription request is sent to /api/newsletter
    Then a 201 response is returned
    And a welcome email is dispatched
    And the subscription is saved in the database

  Scenario: Duplicate subscriber
    Given an already subscribed email
    When the same subscription request is sent
    Then a 200 (OK) response is returned without creating a duplicate
    And no additional welcome email is sent

  Scenario: Invalid email format
    Given an invalid email address
    When a subscription request is sent to /api/newsletter
    Then a 400 response is returned
    And no subscription is created
    And no email is sent
