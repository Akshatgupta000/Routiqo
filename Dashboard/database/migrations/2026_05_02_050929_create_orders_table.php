<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('address');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->foreignId('delivery_center_id')->nullable()->constrained('delivery_centers')->nullOnDelete();
            $table->string('priority', 16)->default('medium');
            $table->string('status', 32)->default('pending');
            $table->timestamps();

            $table->index(['delivery_center_id', 'status']);
            $table->index(['status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
