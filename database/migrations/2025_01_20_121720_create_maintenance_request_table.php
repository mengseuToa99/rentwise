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
        Schema::create('maintenance_request', function (Blueprint $table) {
            $table->id('request_id');
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('room_id');
            $table->enum('category', ['plumbing', 'electricity', 'cleaning', 'other']);
            $table->text('description');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed']);
            $table->timestamps();
    
            $table->foreign('tenant_id')->references('user_id')->on('user_detail')->onDelete('cascade');
            $table->foreign('room_id')->references('room_id')->on('room_detail')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_request');
    }
};
