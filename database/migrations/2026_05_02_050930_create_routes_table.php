<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_center_id')->constrained('delivery_centers')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->uuid('comparison_batch_id')->nullable();
            $table->string('optimization_profile', 32)->nullable();
            $table->decimal('total_distance', 12, 3)->default(0)->comment('Kilometers');
            $table->unsignedInteger('total_time')->default(0)->comment('Seconds');
            $table->string('status', 32)->default('planned');
            $table->unsignedSmallInteger('next_stop_sequence')->nullable()->comment('Next stop to service (1-based)');
            $table->timestamp('departure_at')->nullable();
            $table->timestamps();

            $table->index(['delivery_center_id', 'status']);
            $table->index('comparison_batch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
