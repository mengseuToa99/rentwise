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
        Schema::create('property_detail', function (Blueprint $table) {
            $table->id('property_id');
            $table->unsignedBigInteger('landlord_id');
            $table->string('property_name');
            $table->string('address');
            $table->string('location');
            $table->integer('total_floors');
            $table->integer('total_rooms');
            $table->text('description')->nullable();
            $table->timestamps();
    
            $table->foreign('landlord_id')->references('user_id')->on('user_detail')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_detail');
    }
};
