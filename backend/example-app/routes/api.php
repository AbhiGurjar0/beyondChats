<?php

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::post('/articles/{id}/generate', function ($id) {

    $article = Article::find($id);
    if (!$article) {
        return response()->json([
            'message' => 'Article not found'
        ], 404);
    }

    $response = Http::timeout(30)->post(
        'http://127.0.0.1:4000/generate',
        ['article_id' => $id]
    );

    if (!$response->successful()) {
        return response()->json([
            'message' => 'Node worker failed',
            'status' => $response->status(),
            'body' => $response->body()
        ], 500);
    }

    return response()->json([
        'message' => 'Generation triggered successfully',
        'status'=> $response->status(),
        'worker_response' => $response->json(),
        'enhanced_article_id' => $response->json('enhanced_article_id')

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