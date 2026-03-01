---
name: ci4-bootstrap-pro
description: "Professional CodeIgniter 4 and Bootstrap 5.3.2 development workflow for high-quality enterprise applications. Covers layout patterns, AJAX data handling, and rich UI component integration."
category: development
risk: safe
source: local
tags: "[ci4, bootstrap, php, enterprise, mvc]"
date_added: "2026-02-28"
---

# ci4-bootstrap-pro

## Purpose

To provide a standardized, high-performance workflow for building and maintaining enterprise applications using CodeIgniter 4 and Bootstrap 5.3.2. This skill ensures consistency in layout architecture, data handling, and UI/UX patterns across the codebase.

## When to Use This Skill

This skill should be used when:
- Creating new modules or views in a CodeIgniter 4 project.
- Implementing or modifying UI components using Bootstrap 5.3.2.
- Designing AJAX-based interactions using raw jQuery `$.ajax` patterns.
- Integrating third-party JS libraries (DataTables, Select2, SweetAlert2) within the project's ecosystem.
- Refactoring legacy views to align with modern corporate design standards.

## Core Capabilities

1.  **Layout Architecture Management**: Standardizing the use of `header.php` and `footer.php` partials with sequential `echo` injection.
2.  **Raw AJAX & JSON Implementation**: Implementing secure and efficient AJAX interactions using raw jQuery `$.ajax` with standard loader and SweetAlert2 feedback.
3.  **View Scaffolding**: Generating professional Bootstrap 5 layouts using cards, responsive tables, and standard spacing.
4.  **Code Consistency**: Following specific alignment patterns for assignments and array keys as used throughout the project.

## Step-by-Step Workflow

### Phase 1: Planning the View

1.  **Identify the Module Path**: Views should be placed within `app/Views/modules/`.
2.  **Map Data Requirements**: Identify the variables needed (e.g., `$company_name`, `$current_user`).

### Phase 2: Controller Implementation

1.  **Coding Style**: Use sequential `echo` for view rendering and maintain precise alignment for assignments.
2.  **Data Preparation**:
    ```php
    public function index() {
        $data                    = $this->data; // Contains global settings
        $data['title']           = 'My Module Page';
        $data['controller_page'] = site_url('mymodule');
        
        echo view('header', $data);
        echo view('modules/my_module/index', $data);
        echo view('footer', $data);
    }
    ```
3.  **Standard JSON Responses**:
    ```php
    $res['status']  = 200;
    $res['title']   = 'Success';
    $res['message'] = 'Operation completed';
    $res['data']    = ['url' => site_url('mymodule')]; // Forwarding URL
    return $this->response->setStatusCode($res['status'])->setJSON($res);
    ```

### Phase 3: View Development (Bootstrap 5.3.2)

1.  **Container Structure**: Use `.container-fluid` for full-width internal pages.
2.  **Card Layout**: Use `.card`, `.card-header`, and `.card-body` for consistent sectioning.

### Phase 4: Raw AJAX Implementation

1.  **Spinner Feedback**: Use a `.spinner-border-sm` within the button during processing.
2.  **SweetAlert2 Integration**: Use `Swal.fire` for success/error alerts and redirect based on `response.data.url`.
3.  **Data Submission**: Use `FormData` to handle form fields seamlessly.

## Best Practices

- **Code Alignment**: Align `=` and `=>` for better readability as per project standard.
- **AJAX States**: Always handle `beforeSend`, `success`, `error`, and `complete` states to provide a smooth UX.
- **Never Hardcode Paths**: Always use `base_url()` and `site_url()`.
- **Dynamic Assets**: Load module-specific assets via the `$data` array in `header.php`.

## Bundled Resources

### examples/
- `standard_controller.php`: Sequential view echo and aligned assignments.
- `bootstrap_view.php`: Standard card-based layout with action buttons.
- `standard_ajax.js`: Raw jQuery `$.ajax` pattern with loaders and SweetAlert2.

## References
- [CodeIgniter 4 Documentation](https://codeigniter.com/user_guide/index.html)
- [Bootstrap 5.3 Documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
