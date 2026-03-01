<?php

namespace App\Tests;

use CodeIgniter\Test\FeatureTestCase;

class ControllerFeatureTest extends FeatureTestCase
{
    /**
     * @var bool Whether to refresh the database
     */
    protected $refresh = true;

    /**
     * Senior Pattern: High-level Feature Testing
     */
    public function testLoginIndexRenderSuccess()
    {
        // Simulate a GET request to the login page
        $result = $this->get('login');

        // Assertions
        $result->assertStatus(200);
        $result->assertSee('Login');
        $result->assertHeader('Content-Type', 'text/html');
    }

    /**
     * Senior Pattern: Feature Testing for Authenticated Controller
     */
    public function testDashboardAccessRedirectIfUnauthenticated()
    {
        // Unauthenticated user attempting to access dashboard
        $result = $this->get('dashboard');

        // Assertions: Redirected to login
        $result->assertStatus(302);
        $result->assertRedirectTo(site_url('login'));
    }

    public function testDashboardAccessSuccessIfAuthenticated()
    {
        // Authenticated user (with session data aligned for readability)
        $userSession['userID']       = 1;
        $userSession['userName']     = 'admin';
        $userSession['groupID']      = 1;
        $userSession['current_user'] = (object)[
            'userID'       => 1,
            'userName'     => 'admin',
            'isAdmin'      => true,
            'branchID'     => 1,
            'branchCode'   => 'Main',
            'preferences'  => 'Dashboard,Administrator'
        ];

        // Perform request with the prepared session
        $result = $this->withSession($userSession)->get('dashboard');

        // Assertions: Successfully rendered
        $result->assertStatus(200);
        $result->assertSee('Dashboard Overview');
    }

    public function testSaveRecordViaAjaxSuccess()
    {
        // Post data aligned with craftsmanship
        $postData['firstName']   = 'Test';
        $postData['lastName']    = 'User';
        $postData['email']       = 'test@example.com';

        // Perform POST request to the save route
        $result = $this->post('mymodule/save', $postData);

        // Assertions: JSON response with standard status code and result structure
        $result->assertStatus(200);
        $result->assertJSONFragment([
            'status'  => 200,
            'title'   => 'Success',
            'message' => 'Record saved successfully'
        ]);
    }
}
