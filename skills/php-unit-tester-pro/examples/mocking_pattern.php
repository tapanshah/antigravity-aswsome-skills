<?php

namespace App\Tests;

use CodeIgniter\Test\FeatureTestCase;
use CodeIgniter\Config\Services;
use App\Models\Inventory_model;

class MockingPattern extends FeatureTestCase
{
    /**
     * @var bool Whether to refresh the database
     */
    protected $refresh = true;

    /**
     * Senior Pattern: Mocking complex services for isolation
     */
    public function testMockedInventoryService()
    {
        // 1. Create a mock for the service
        $mock = $this->getMockBuilder('App\Services\InventoryService')
                     ->onlyMethods(['updateStock'])
                     ->getMock();

        // 2. Set expectation with aligned data
        $mock->method('updateStock')
             ->with(101, 5) // Item ID 101, Qty 5
             ->willReturn(true);

        // 3. Inject the mock into the CI4 service system
        Services::injectMock('inventoryService', $mock);

        // 4. Perform the action (the controller will use the mock automatically)
        $data['itemID']   = 101;
        $data['qty']      = 5;

        // POST request to the action that uses the service
        $result = $this->post('inventory/update', $data);

        // Assertions: The action should succeed using the mocked data
        $result->assertStatus(200);
        $result->assertJSONFragment(['message' => 'Stock updated successfully']);
    }

    /**
     * Senior Pattern: Mocking data models to avoid DB interactions
     */
    public function testMockedInventoryModel()
    {
        // 1. Create a mock for the model
        $modelMock = $this->getMockBuilder(Inventory_model::class)
                          ->disableOriginalConstructor()
                          ->getMock();

        // 2. Set expectation for fetching data
        $modelMock->method('find')
                  ->with(123)
                  ->willReturn([
                      'itemID'   => 123,
                      'itemName' => 'Mocked Item',
                      'qty'      => 456
                  ]);

        // 3. Using the mock (models can be explicitly passed or mocked via Services if retrieved through factory)
        $resultData = $modelMock->find(123);

        // Assertions
        $this->assertEquals('Mocked Item', $resultData['itemName']);
        $this->assertEquals(456,           $resultData['qty']);
    }
}
