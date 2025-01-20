<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('utility_usage', function (Blueprint $table) {
            $table->id('usage_id');
            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('utility_id');
            $table->timestamp('usage_date');
            $table->decimal('old_meter_reading', 10, 2);
            $table->decimal('new_meter_reading', 10, 2);
            $table->decimal('amount_used', 10, 2);
            $table->timestamps();
    
            $table->foreign('room_id')->references('room_id')->on('room_detail')->onDelete('cascade');
            $table->foreign('utility_id')->references('utility_id')->on('utilities')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_usage');
    }
};
