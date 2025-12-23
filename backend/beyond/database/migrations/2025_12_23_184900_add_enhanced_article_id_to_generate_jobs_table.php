<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('generate_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('enhanced_article_id')
                  ->nullable()
                  ->after('article_id');

            // Optional but recommended foreign key
            $table->foreign('enhanced_article_id')
                  ->references('id')
                  ->on('articles')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('generate_jobs', function (Blueprint $table) {
            $table->dropForeign(['enhanced_article_id']);
            $table->dropColumn('enhanced_article_id');
        });
    }
};
