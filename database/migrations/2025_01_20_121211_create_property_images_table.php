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
        Schema::create('property_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->unsignedBigInteger('property_id');
            $table->string('image_path');
            $table->timestamps();
    
            $table->foreign('property_id')->references('property_id')->on('property_detail')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};
