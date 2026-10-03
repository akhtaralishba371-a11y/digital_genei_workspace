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
        Schema::create('billing_configs', function (Blueprint $table) {
            $table->id();
            $table->string('planName')->default('Starter'); // Starter|Business|Enterprise
            $table->integer('currentSeats')->default(0);
            $table->integer('maxSeats')->default(0);
            $table->string('billingCycle')->default('monthly'); // monthly|yearly
            $table->string('nextInvoiceDate')->nullable();
            $table->decimal('nextInvoiceAmount', 12, 2)->default(0);
            $table->json('paymentMethod')->nullable(); // { brand, last4 }
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_configs');
    }
};
