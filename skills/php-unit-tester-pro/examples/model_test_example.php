<?php

namespace App\Tests;

use CodeIgniter\Test\CIDatabaseTestCase;
use App\Models\Inventory_model;

class ModelTestExample extends CIDatabaseTestCase
{
    /**
     * @var bool Whether to refresh the database (migrate + seed) before each test
     */
    protected $refresh = true;

    /**
     * @var string Name of the seeder to run
     */
    protected $seed = 'InventorySeeder';

    public function testSaveInventoryRecordSuccess()
    {
        $model           = model(Inventory_model::class);

        // Craftsmanship: Aligned assignments
        $data['itemName'] = 'Standard Item';
        $data['qty']      = 100;
        $data['branchID'] = 1;

        // Perform save
        $result          = $model->save($data);

        // Assertions
        $this->assertTrue($result);
        $this->seeInDatabase('mms_inventory', [
            'itemName' => 'Standard Item',
            'qty'      => 100
        ]);
    }

    public function testGetInventoryRecordNotFound()
    {
        $model           = model(Inventory_model::class);
        $record          = $model->find(999999);

        // Assertion
        $this->assertNull($record);
    }
}
