<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Article;
use App\Models\GenerationJob as GenerationJob;
use Illuminate\Support\Facades\Artisan;

Route::get('/force-migrate', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return "<h1>Migrations completed successfully!</h1><pre>" . Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        return "<h1>Error</h1><pre>" . $e->getMessage() . "</pre>";
    }
});
function scrapeArticleContent($url)
{
    $response = Http::get($url);
    $html = $response->body();

    $dom = new \DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new \DOMXPath($dom);

    // 🔥 MAIN CONTENT TARGET
    $contentNode = $xpath->query("//div[@id='content']")->item(0);

    if (!$contentNode) {
        return '';
    }

    // Clean text
    $content = trim(preg_replace('/\s+/', ' ', $contentNode->textContent));

    return $content;
}
Route::get('/scrape', function () {

    $response = Http::get('https://beyondchats.com/blogs/page/13');
    $html = $response->body();

    $dom = new \DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new \DOMXPath($dom);
    $nodes = $xpath->query("//a[contains(@href, '/blogs/')]");


    $articles = [];
    $saved = 0;

    foreach ($nodes as $node) {

        $url = $node->getAttribute('href');

        if (!str_starts_with($url, 'http')) {
            $url = 'https://beyondchats.com' . $url;
        }
        if (Article::where('source_url', $url)->exists())
            continue;
        Article::create([
            'title' => trim($node->textContent),
            'url' => $url,
            'content' => scrapeArticleContent($url),
            'is_generated' => false,
        ]);

        $saved++;

        if ($saved === 5)
            break;
    }

    return response()->json([
        'message' => 'Scraping completed',
        'articles_saved' => $saved
    ]);
});

Route::get('/', function () {
    return view('welcome');
});
Route::get('/articles', function () {
    $articles = Article::all();

    return response()->json(
        $articles->map(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'content' => $article->content,
                'is_generated' => $article->is_generated,
                'parent_id' => $article->parent_id,
                'created_at' => $article->created_at,
                'updated_at' => $article->updated_at,
            ];
        })
    );
});
Route::get('/articles/{id}', function ($id) {
    $article = Article::find($id);
    return response()->json([
        'id' => $article->id,
        'title' => $article->title,
        'content' => $article->content,
        'is_generated' => $article->is_generated,
        'parent_id' => $article->parent_id,
        'created_at' => $article->created_at,
        'updated_at' => $article->updated_at,
    ]);
});
Route::get('/job-status/{jobId}', function ($jobId) {

    $job = GenerationJob::where('job_id', $jobId)->first();

    if (!$job) {
        return response()->json([
            'status' => 'processing',
        ]);
    }

    return response()->json([
        'status' => 'completed',
        'enhanced_article_id' => $job->enhanced_article_id,
    ]);
});

Route::delete('/articles/{id}', function ($id) {
    $article = Article::find($id);
    if (!$article) {
        return response()->json([
            'message' => 'Article not found'
        ], 404);
    }

    $article->delete();

    return response()->json([
        'message' => 'Article deleted successfully'
    ]);
});