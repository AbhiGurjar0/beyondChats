<?php

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\GenerationJob as GenerationJob;

Route::post('/articles/{id}/generate', function ($id) {

    // 1. Find the article
    $article = Article::find($id);

    if (!$article) {
        return response()->json([
            'message' => 'Article not found'
        ], 404);
    }

    // 2. Call Node.js Worker 
    try {
        $response = Http::timeout(60)->post(
            'https://beyondchats-1-8zpv.onrender.com/generate',
            ['article_id' => $id]
        );
    } catch (\Exception $e) {
        Log::error('Node API Connection Failed', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to connect to AI Worker',
            'error' => $e->getMessage()
        ], 500);
    }

    // 3. Handle Request Failure
    if (!$response->successful()) {
        Log::error('Node API Request Failed', [
            'status' => $response->status(),
            'body' => $response->body()
        ]);

        return response()->json([
            'message' => 'Node worker returned an error',
            'status' => $response->status(),
            'body' => $response->body()
        ], 500);
    }

    // 4. Handle Success but Missing Data
    $jobId = $response->json('job_id');

    if (!$jobId) {
        Log::error('Node API returned success but no job_id', ['body' => $response->body()]);

        return response()->json([
            'message' => 'Node worker success but missing job_id',
            'body' => $response->body()
        ], 500);
    }

    // 5. Success: Create Database Record
    GenerationJob::create([
        'article_id' => $id,
        'job_id' => $jobId,
        'job_status' => 'processing'
    ]);

    return response()->json([
        'message' => 'Generation started',
        'job_id' => $jobId
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