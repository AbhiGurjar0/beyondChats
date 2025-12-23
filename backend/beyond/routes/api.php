<?php

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\GenerationJob as GenerationJob;

Route::post('/articles/{id}/generate', function ($id) {

    $article = Article::find($id);
    if (!$article) {
        return response()->json([
            'message' => 'Article not found'
        ], 404);
    }

    $response = Http::timeout(5)->post(
        'http://127.0.0.1:4000/generate',
        ['article_id' => $id]
    );
    GenerationJob::create([
        'article_id' => $id,
        'job_id' => $response->json('job_id'),
        'job_status' => 'processing'
    ]);

    if (!$response->successful()) {
        return response()->json([
            'message' => 'Node worker failed',
            'status' => $response->status(),
            'body' => $response->body()
        ], 500);
    }
    return response()->json([
        'message' => 'Generation started',
        'job_id' => $response->json('job_id')
    ]);
});

Route::post('/articles', function (Request $request) {

    $validated = $request->validate([
        'title' => 'required|string',
        'content' => 'required|string',
        'is_generated' => 'required|boolean',
        'parent_id' => 'nullable|exists:articles,id',
    ]);

    $article = Article::create($validated);

    return response()->json([
        'message' => 'Article created successfully',
        'article' => $article
        
    ], 201);
});
Route::put('/generation-jobs/update-status', function (Request $request) {

    $validated = $request->validate([
        'job_id' => 'required|string',
        'job_status' => 'required|string',
        'enhanced_article_id' => 'nullable|integer|exists:articles,id',
    ]);

    $job = GenerationJob::where('job_id', $validated['job_id'])->first();
    if (!$job) {
        return response()->json([
            'message' => 'Generation job not found'
        ], 404);
    }

    $job->update([
        'job_status' => $validated['job_status'],
        'enhanced_article_id' => $validated['enhanced_article_id'] ?? $job->enhanced_article_id,
    ]);

    return response()->json([
        'message' => 'Job status updated successfully',
        'job' => $job
    ]);
});