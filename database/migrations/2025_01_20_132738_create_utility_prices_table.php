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
        Schema::create('utility_prices', function (Blueprint $table) {
            $table->id('price_id');
            $table->unsignedBigInteger('utility_id');
            $table->decimal('price', 10, 2);
            $table->timestamp('effective_date');
            $table->timestamps();
    
            $table->foreign('utility_id')->references('utility_id')->on('utilities')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utility_prices');
    }
};
