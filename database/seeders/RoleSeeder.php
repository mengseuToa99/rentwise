<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run()
    {
        DB::table('roles')->insert([
            ['role_id' => 1, 'role_name' => 'admin', 'description' => 'Administrator'],
            ['role_id' => 2, 'role_name' => 'landlord', 'description' => 'Property Owner'],
            ['role_id' => 3, 'role_name' => 'tenant', 'description' => 'Room Renter'],
        ]);
    }
}
