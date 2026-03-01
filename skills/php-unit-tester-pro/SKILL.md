---
name: php-unit-tester-pro
description: "Expert PHPUnit 9.6+ testing workflow for CodeIgniter 4. Covers model, controller, and integration testing with focus on mocking, data validation, and CI/CD integration."
category: testing
risk: safe
source: local
tags: "[phpunit, testing, ci4, php, quality-assurance, mocking]"
date_added: "2026-02-28"
---

# php-unit-tester-pro

## Purpose

To provide a comprehensive and expert-level testing workflow for CodeIgniter 4 projects using PHPUnit. This skill ensures that all application logic—models, controllers, and custom libraries—is thoroughly validated through automated testing, reducing bugs and improving long-term maintainability.

## When to Use This Skill

This skill should be used when:
- Writing new unit tests for models or helper functions.
- Performing feature tests for CI4 controllers and their routing.
- Implementing integration tests that involve database state.
- Mocking external dependencies or complex project sections.
- Setting up or refining the testing environment (`phpunit.xml.dist`).
- Debugging failing tests or improving overall test coverage.

## Core Capabilities

1.  **Unit Testing (Models & Libraries)**: Validating business logic in isolation using PHPUnit's standard assertions.
2.  **Feature/Integration Testing**: Testing CI4 request/response cycles using the built-in `FeatureTestCase`.
3.  **Database State Management**: Utilizing CI4's `DatabaseTestTrait` for migrations and seeding during tests.
4.  **Expert Mocking Strategy**: Leveraging PHPUnit's `createMock` and CI4's mocking capabilities for services and models.
5.  **Craftsmanship Standards**: Ensuring test code follows the project's "Precise Alignment" and "Sequential Flow" guidelines for clarity.

## Step-by-Step Testing Workflow

### Phase 1: Test Environment Configuration

1.  **Verify Configuration**: Ensure `phpunit.xml.dist` (and a local `phpunit.xml` if needed) is correctly pointing to the `tests/` directory.
2.  **Mocking & Services**: Identify any CI4 services (`Config`, `Request`, `Response`) that need to be mocked for the particular test suite.

### Phase 2: Writing a Model Unit Test

1.  **Extend CIDatabaseTestCase**: Always use CI4's database-aware test case for model testing.
    ```php
    use CodeIgniter\Test\CIDatabaseTestCase;
    
    class MyModelTest extends CIDatabaseTestCase {
        protected $refresh = true; // Migrates database before each test
        protected $seed    = 'TestSeeder'; // Optional seeder
    }
    ```
2.  **Sequential Test Logic**:
    ```php
    public function testSaveRecordSuccess() {
        $model           = model('MyModel');
        $data['name']    = 'Test Entry';
        $data['status']  = 'Active';
        
        $result          = $model->save($data);
        $this->assertTrue($result);
    }
    ```

### Phase 3: Writing a Controller Feature Test

1.  **Extend FeatureTestCase**: Test the full request-response cycle.
2.  **Simulate Requests**:
    ```php
    public function testLoginAuthenticateSuccess() {
        $result = $this->withSession([
            'status' => 'active'
        ])->post('login/authenticate', [
            'username' => 'admin',
            'password' => 'secret123'
        ]);

        $result->assertStatus(200);
        $result->assertJSONFragment(['title' => 'Success']);
    }
    ```

### Phase 4: Mocking & Verification

1.  **Service Mocking**:
    ```php
    public function testMockedService() {
        $mock = $this->getMockBuilder('App\Services\MyService')
                     ->onlyMethods(['processData'])
                     ->getMock();
        $mock->method('processData')
             ->willReturn(true);
        
        // Inject or use the mock in the test
    }
    ```

## Best Practices (The Tester Standard)

- **Isolation is Key**: Every test should be able to run independently without relying on the state from previous tests.
- **Assertive Names**: Test method names should clearly state the expected outcome (e.g., `testShouldFailWhenUsernameIsEmpty`).
- **Clean Up**: Use `tearDown()` to reset any environment or service changes made during the test.
- **Craftsmanship**: Align code precisely (e.g., in `$data` arrays) even in test files to maintain high quality standards across the whole codebase.

## Bundled Resources

### examples/
- `model_test_example.php`: Advanced model testing with database traits.
- `controller_feature_test.php`: Feature testing for a standard CI4 controller.
- `mocking_pattern.php`: Simplified mocking of CI4 services and models.

## References
- [CI4 Testing Documentation](https://codeigniter.com/user_guide/testing/index.html)
- [PHPUnit 9.6 Documentation](https://phpunit.de/manual/9.6/en/index.html)
