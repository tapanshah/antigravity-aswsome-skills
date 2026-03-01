# Senior Developer Performance Optimization Guide

This guide outlines advanced techniques for maintaining high performance in this project's CodeIgniter 4, Bootstrap 5.3.2, and MySQL ecosystem.

## 1. Database Performance (MySQL & Query Builder)

- **Indexing is Key**: Ensure all `WHERE` and `JOIN` columns have composite or single-column indexes.
- **Select Specific Columns**: Avoid `select('*')`. Only retrieve exactly what the view needs to reduce bandwidth and memory.
- **Batch Operations**: Use `whereIn` and `insertBatch` vs executing single queries in a loop.
- **N+1 Query Detection**: If you have a loop that executes a query for each item, refactor it to use a single query with a `join` or `whereIn`.

## 2. Server-Side Rendering (PHP & CI4)

- **Sequential View Rendering**: Our project's pattern of `echo view(...)` is memory-efficient because it streams the output during execution.
- **View Caching**: Consider caching static views (e.g., Reports) if the data doesn't change frequently.
- **Model Efficiency**: Use CI4's internal caching for repetitive queries or common configurations (`ConfigModel`).

## 3. Frontend Experience (Bootstrap & jQuery)

- **Raw AJAX Lifecycle**: Always handle the `beforeSend` (loader) and `complete` (cleanup) states of every `$.ajax` call to ensure the UI remains responsive.
- **DOM Minimization**: Avoid large table DOM structures; use DataTables with server-side processing for results over 1,000 rows.
- **Asset Loading**: Ensure module-specific CSS/JS are only loaded when needed via the header's dynamic arrays.

## 4. Craftsmanship & Maintenance

- **DRY Principle**: Extract common logic into `GenericModel` or specific reusable traits.
- **Standardized Responses**: Always return a consistent JSON structure (`status`, `title`, `message`, `data`) so all frontend handlers can be reused.
- **Code Readability**: Horizontal alignment is not just for aesthetics; it allows seniors to scan code for errors much faster (e.g., misaligned assignments often reveal missing semicolons or variables).
