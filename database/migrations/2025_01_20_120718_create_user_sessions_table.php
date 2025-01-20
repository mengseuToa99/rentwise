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
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->string('session_id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->timestamp('login_time')->useCurrent();
            $table->timestamp('expiry_time')->nullable();
            $table->string('ip_address');
            $table->text('user_agent');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
    
            $table->foreign('user_id')->references('user_id')->on('user_detail')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
