<?php

namespace App\Models;

class SelectExamples extends GenericModel
{
    public function get_user_details($userID)
    {
        // Standard initialized builder
        $b = $this->db->table('users');

        // Select with specific fields
        $b->select('userID');
        $b->select('userName');
        $b->select('firstName');
        $b->select('lastName');
        $b->select('branches.branchCode');
        $b->select('branches.branchType');

        // Join with related table
        $b->join('branches', 'users.branchID = branches.branchID', 'left');

        // Where condition
        $b->where('users.userID', $userID);

        // Fetch single row
        $rec = $b->get()->getRow();

        return $rec;
    }

    public function list_active_records($limit = 10, $offset = 0)
    {
        $b = $this->db->table('my_table');

        $b->select('id, name, status');
        $b->where('status', 'Active');
        $b->orderBy('name', 'asc');
        $b->limit($limit, $offset);

        // Fetch multiple rows
        $recs = $b->get()->getResult();

        return $recs;
    }

    public function search_records($keyword)
    {
        $b = $this->db->table('my_table');

        $b->select('*');
        $b->like('name',    $keyword, 'both');
        $b->orLike('code',  $keyword, 'both');

        $recs = $b->get()->getResultArray();

        return $recs;
    }
}
