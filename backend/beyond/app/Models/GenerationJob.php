<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GenerationJob extends Model
{
    protected $table = 'generate_jobs';

    protected $fillable = [
        'article_id',
        'job_status',
        'job_id',
        'enhanced_article_id',
    ];
}

