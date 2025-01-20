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
    Schema::create('invoice_detail', function (Blueprint $table) {
        $table->id('invoice_id');
        $table->unsignedBigInteger('rental_id');
        $table->decimal('amount_due', 10, 2);
        $table->timestamp('due_date');
        $table->boolean('paid')->default(false);
        $table->enum('payment_method', ['cash', 'credit_card', 'bank_transfer']);
        $table->enum('payment_status', ['pending', 'paid', 'overdue']);
        $table->timestamps();

        $table->foreign('rental_id')->references('rental_id')->on('rental_detail')->onDelete('cascade');
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_detail');
    }
};
