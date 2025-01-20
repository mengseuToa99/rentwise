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
        Schema::create('payment_history', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('invoice_id');
            $table->decimal('payment_amount', 10, 2);
            $table->timestamp('payment_date');
            $table->enum('payment_method', ['cash', 'credit_card', 'bank_transfer']);
            $table->timestamps();
    
            $table->foreign('invoice_id')->references('invoice_id')->on('invoice_detail')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_history');
    }
};
