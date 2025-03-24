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
        Schema::create('room_detail', function (Blueprint $table) {
            $table->id('room_id');
            $table->unsignedBigInteger('property_id');
            $table->string('room_name');
            $table->integer('floor_number');
            $table->string('room_number');
            $table->timestamp('due_date');
            $table->string('room_type');
            $table->text('description')->nullable();
            $table->boolean('available')->default(true);
            $table->decimal('rent_amount', 10, 2);
            $table->timestamps();
    
            $table->foreign('property_id')->references('property_id')->on('property_detail')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_detail');
    }
};
