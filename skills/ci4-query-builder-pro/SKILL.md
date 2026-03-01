---
name: ci4-query-builder-pro
description: "Professional CodeIgniter 4 Query Builder workflow for database operations. Focuses on security, performance, and consistent alignment conventions."
category: database
risk: safe
source: local
tags: "[ci4, php, sql, database, query-builder]"
date_added: "2026-02-28"
---

# ci4-query-builder-pro

## Purpose

To provide a standardized and secure approach to database operations in CodeIgniter 4 using the Query Builder Class. This skill ensures that all database interactions follow the project's preferred patterns, including sequential execution and clear code alignment.

## When to Use This Skill

This skill should be used when:
- Performing complex SELECT, INSERT, UPDATE, or DELETE operations.
- Designing data retrieval logic in models or controllers.
- Implementing joining logic between multiple tables.
- Building dynamic database filters based on user input.

## Core Capabilities

1.  **Standard Query Construction**: Using `$this->db->table()` for all database operations.
2.  **Consistent Fetching Patterns**: Standardized use of `getRow()` for single records and `getResult()` or `getResultArray()` for collections.
3.  **Secure Parameter Handling**: Utilizing Query Builder's built-in escaping to prevent SQL injection.
4.  **Aligned Code Structure**: Maintaining precise alignment of assignments and array keys for improved readability.

## Step-by-Step Workflow

### Phase 1: Initializing the Builder

1.  **Define the Target Table**: Always initialize with `$this->db->table('table_name')`.
2.  **Assignment Alignment**: Ensure the variable assignment is aligned with other surrounding code.

### Phase 2: Data Retrieval (SELECT)

1.  **Explicit Selection**: Use `select()` to specify only the fields needed.
2.  **Join Logic**: Implement `join('other_table', 'condition', 'type')` for related data.
3.  **Conditions**: Use `where()` and `like()` for filtering.
4.  **Execution and Fetching**:
    - Single Record: `$rec = $b->get()->getRow();`
    - Multiple Records: `$recs = $b->get()->getResult();`

### Phase 3: Data Modification (INSERT/UPDATE/DELETE)

1.  **Setting Values**: Use `set('field', $value)` for each field to be modified.
2.  **Execution**:
    - Insert: `$b->insert();`
    - Update: `$b->update();`
    - Delete: `$b->delete();`

## Best Practices

- **Avoid Raw Queries**: Use the Query Builder methods instead of `query()` whenever possible for security and portability.
- **Assignment Alignment**: Align `=` for better readability:
  ```php
  $b->set('firstName',  $firstName);
  $b->set('lastName',   $lastName);
  $b->set('email',      $email);
  ```
- **Chained vs. Sequential Builder**: While chaining is supported, sequential assignments (as shown below) are often clearer in complex logic.
  ```php
  $b = $this->db->table('users');
  $b->select('userID, userName');
  $b->where('rstatus', 1);
  $rec = $b->get()->getRow();
  ```
- **Consistent Results**: Use `getRow()` or `getRowArray()` for single row results consistently across the project.

## Bundled Resources

### examples/
- `select_examples.php`: Standard data retrieval patterns.
- `insert_update_examples.php`: Data modification patterns with alignment.

## References
- [CI4 Query Builder Documentation](https://codeigniter.com/user_guide/database/query_builder.html)
