<?php

namespace App\Controllers;

/**
 * SeniorDeveloperController
 * Demonstrates high-level patterns like RBAC and complex View management.
 */
class SeniorDeveloperController extends BaseController
{
    /**
     * @var string Table name for this module
     */
    protected $table;

    public function __construct()
    {
        // Standard Aligned Assignments
        $this->main                    = 'Administrator';
        $this->sub                     = 'Security Audit';
        $this->data['table']           = $this->table = 'security_logs';
        $this->data['controller_page'] = site_url('security');
    }

    /**
     * Senior Pattern: Integrated RBAC and Sequential Rendering
     */
    public function index()
    {
        // 1. RBAC check (Assume $current_user->isAdmin is the check)
        if (!$this->data['current_user']->isAdmin) {
            return redirect()->to(site_url('unauthorize'));
        }

        // 2. Complex data preparation
        $data                    = $this->data;
        $data['title']           = 'Security Logs Overview';
        
        // Use Query Builder skill patterns
        $b = $this->db->table($this->table);
        $b->select('logID, userName, action, timestamp');
        $b->orderBy('timestamp', 'desc');
        $data['logs']            = $b->get()->getResult();

        // 3. Craftsmanship: Sequential View Echo
        echo view('header',  $data);
        echo view('modules/security/index', $data);
        echo view('footer',  $data);
    }

    /**
     * Senior Pattern: Secure, High-Performance AJAX Save
     */
    public function save()
    {
        // Initialize standard response array
        $res['status']           = 500;
        $res['title']            = 'Operation Failed';
        $res['message']          = 'A critical error occurred.';

        // Ensure user has write permission
        if (!$this->data['current_user']->isAdmin) {
            $res['status']       = 403;
            $res['message']      = 'Unauthorized access to save data.';
            return $this->response->setStatusCode(403)->setJSON($res);
        }

        $postData                = $this->request->getPost();

        // Senior-level validation can happen here
        if ($postData) {
            // Save logic using builder
            // $b = $this->db->table(...);
            
            $res['status']       = 200;
            $res['title']        = 'Success';
            $res['message']      = 'Security configuration updated.';
            $res['data']['url']  = site_url('security');
        }

        // Return standard JSON for raw $.ajax to handle
        return $this->response->setStatusCode($res['status'])->setJSON($res);
    }
}
