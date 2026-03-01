<?php

namespace App\Models;

class InsertUpdateExamples extends GenericModel
{
    public function save_record($data)
    {
        $b = $this->db->table('my_table');

        // Aligned values assignment using set()
        $b->set('firstName',    $data['firstName']);
        $b->set('lastName',     $data['lastName']);
        $b->set('email',        $data['email']);
        $b->set('updatedAt',    date('Y-m-d H:i:s'));

        // Single insert
        $b->insert();

        // Returning inserted ID
        return $this->db->insertID();
    }

    public function update_record($id, $data)
    {
        $b = $this->db->table('my_table');

        // Update fields with aligned assignments
        $b->set('firstName',    $data['firstName']);
        $b->set('lastName',     $data['lastName']);
        $b->set('email',        $data['email']);
        $b->set('updatedAt',    date('Y-m-d H:i:s'));

        // Identify the record to update
        $b->where('id', $id);

        // Execute update
        $b->update();

        return true;
    }

    public function delete_record($id)
    {
        $b = $this->db->table('my_table');

        // Identify the record to delete
        $b->where('id', $id);

        // Execute delete
        $b->delete();

        return true;
    }

    public function batch_update($ids, $status)
    {
        $b = $this->db->table('my_table');

        // Set status for all targeted IDs
        $b->set('status',       $status);
        $b->set('updatedAt',    date('Y-m-d H:i:s'));

        // Use whereIn for batch conditions
        $b->whereIn('id', $ids);

        // Execute update
        $b->update();

        return true;
    }
}
