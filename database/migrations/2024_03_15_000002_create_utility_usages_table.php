<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('utility_usages', function (Blueprint $table) {
            $table->id('usage_id');
            $table->unsignedBigInteger('invoice_id');
            $table->unsignedBigInteger('utility_id');
            $table->decimal('amount_used', 10, 2);
            $table->decimal('old_meter_reading', 10, 2);
            $table->decimal('new_meter_reading', 10, 2);
            $table->date('usage_date');
            $table->timestamps();

            $table->foreign('invoice_id')
                  ->references('invoice_id')
                  ->on('invoices')
                  ->onDelete('cascade');

            $table->foreign('utility_id')
                  ->references('utility_id')
                  ->on('utilities')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_usages');
    }
}; 