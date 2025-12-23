<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('generate_jobs', function (Blueprint $table) {
            $table->id();

            // Related article
            $table->unsignedBigInteger('article_id');

            // Job identifier from Node worker
            $table->string('job_id')->unique();

            // Job status (processing, completed, failed)
            $table->string('job_status')->default('processing');

            $table->timestamps();

            // Foreign key constraint (recommended)
            $table->foreign('article_id')
                ->references('id')
                ->on('articles')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generate_jobs');
    }
};
