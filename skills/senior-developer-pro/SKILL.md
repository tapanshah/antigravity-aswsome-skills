---
name: senior-developer-pro
description: "Advanced architectural oversight and technical leadership for CodeIgniter 4 and Bootstrap projects. Focuses on system design, performance optimization, security, and consistent code quality."
category: leadership
risk: safe
source: local
tags: "[architecture, senior-dev, ci4, optimization, scalability, security]"
date_added: "2026-02-28"
---

# senior-developer-pro

## Purpose

To act as a senior technical leader and architect within the project. This skill ensures that all development work—from a single view to complex multi-module integrations—adheres to high standards of performance, security, and maintainability while respecting the project's established conventions (e.g., precise alignment and sequential view rendering).

## When to Use This Skill

This skill should be used when:
- Designing new system modules or complex database schemas.
- Planning the architectural interaction between different project sections (e.g., `Administrator` vs `Dashboard`).
- Conducting deep performance reviews of code or database queries.
- Implementing complex security logic like Role Based Access Control (RBAC).
- Deciding on a refactoring strategy for legacy or suboptimal code.
- Mentoring or providing high-level guidance on complex technical problems.

## Core Capabilities

1.  **Architectural Design**: Designing modular, reusable components using CI4's MVC architecture.
2.  **Performance & Scaling Oversight**: Identifying N+1 query problems, optimizing asset loading, and ensuring efficient MySQL indexing.
3.  **Security Architecture**: Hardening the application against OWASP Top 10 vulnerabilities while managing the custom RBAC system.
4.  **Adherence to Coding Standards**: Enforcing the project's unique "Sequential View rendering" and "Precise Alignment" rules as a mark of craftsmanship.
5.  **Technical Debt Reduction**: Transitioning legacy patterns to modern project standards (e.g., raw `$.ajax` calls) in a systematic way.

## Step-by-Step Senior Workflow

### Phase 1: High-Level Architectural Design

1.  **Requirement Analysis**: Break down complex features into specific models and controller methods.
2.  **Schema Planning**: Design normalized tables with appropriate primary/foreign keys and indexes. Ensure alignment in schema definitions.
3.  **Dependency Mapping**: Identify which existing models (`GenericModel`, `ConfigModel`, etc.) can be reused to avoid duplication (DRY).

### Phase 2: Design-First Implementation

1.  **Controller Structure**: Planning for thin controllers and fat models where appropriate. Use sequential `echo view` for clear rendering flow.
    ```php
    // Senior Pattern: Sequential Echo View with Aligned Assignments
    $data                    = $this->data;
    $data['title']           = 'Architectural Overview';
    $data['controller_page'] = site_url('architecture');
    
    echo view('header', $data);
    echo view('modules/admin/overview', $data);
    echo view('footer', $data);
    ```
2.  **Model Logic**: Encapsulating complex data transformations within the model to keep controllers readable.

### Phase 3: Performance & Security Review

1.  **Query Builder Optimization**: Using the `ci4-query-builder-pro` patterns to ensure efficient execution.
2.  **Input/Output Security**: Ensuring all user-provided data is validated on input and escaped on output (though sequential views handle output, senior oversight ensures no raw echos avoid the framework's safety).
3.  **Frontend Performance**: Optimizing raw `$.ajax` calls to handle large payloads efficiently and providing immediate visual feedback to the user.

## Best Practices (The Senior Standard)

- **The Craftsmanship Rule**: Aligned assignments (`=`) and array keys (`=>`) are non-negotiable for project consistency.
- **Explicit over Implicit**: Use raw `$.ajax` for transparency and control over the request lifecycle (spinner loading, error handling).
- **Graceful Error Handling**: Always provide meaningful `Swal.fire` feedback for AJAX errors. Never let an operation fail silently.
- **Module Isolation**: Keep module-specific logic within its own directory under `app/Views/modules/`.

## Bundled Resources

### examples/
- `system_architecture.md`: Example of a multi-module integration plan.
- `advanced_rbac_check.php`: Pattern for handling permissions in a senior-level controller.

### references/
- `performance_optimization_guide.md`: Tips for MySQL and View rendering performance.

## References
- [CodeIgniter 4 Advanced Topics](https://codeigniter.com/user_guide/concepts/index.html)
- [PHP Design Patterns](https://phptherightway.com/#design_patterns)
