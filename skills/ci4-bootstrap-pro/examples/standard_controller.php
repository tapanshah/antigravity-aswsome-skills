<?php

namespace App\Controllers;

class StandardController extends BaseController
{
    public function __construct()
    {
        // Define module-specific variables with standard alignment
        $this->main                    = 'MyMainModule';
        $this->sub                     = 'MySubModule';
        $this->data['table']           = 'my_table';
        $this->data['controller_page'] = site_url('mymodule');
    }

    public function index()
    {
        $data          = $this->data;
        $data['title'] = 'Overview';

        // Fetch data using standard query builder pattern
        // $b = $this->db->table('my_tables');
        // $data['records'] = $b->get()->getResult();

        // Standard sequential view echo
        echo view('header', $data);
        echo view('modules/mymodule/index', $data);
        echo view('footer', $data);
    }

    public function create()
    {
        $data          = $this->data;
        $data['title'] = 'Create New Record';

        echo view('header', $data);
        echo view('modules/mymodule/create', $data);
        echo view('footer', $data);
    }

    public function save()
    {
        $res['status']  = 500;
        $res['title']   = 'Server Error';
        $res['message'] = 'An error occurred while saving.';

        $postData = $this->request->getPost();

        if ($postData) {
            // Save logic
            $res['status']  = 200;
            $res['title']   = 'Success';
            $res['message'] = 'Record saved successfully';
        }

        return $this->response->setStatusCode($res['status'])->setJSON($res);
    }
}
