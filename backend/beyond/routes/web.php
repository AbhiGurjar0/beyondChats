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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Models\Article;

// Helper function to extract robust details
function scrapeArticleDetails($url)
{
    try {
        $response = Http::timeout(30)->get($url);
        
        if ($response->failed()) return null;

        $html = $response->body();

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);

        $imageQuery = $xpath->query('//meta[@property="og:image"]/@content');
        $image = $imageQuery->length > 0 ? $imageQuery->item(0)->value : null;

        // Get Publish Date
        $dateQuery = $xpath->query('//meta[@property="article:published_time"]/@content');
        $date = $dateQuery->length > 0 ? $dateQuery->item(0)->value : null;

        // Get Description / Excerpt
        $descQuery = $xpath->query('//meta[@property="og:description"]/@content');
        $excerpt = $descQuery->length > 0 ? $descQuery->item(0)->value : null;

        $queries = [
            "//div[contains(@class, 'entry-content')]",
            "//div[contains(@class, 'post-content')]",
            "//article",
            "//div[@id='content']"
        ];

        $contentNode = null;
        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes->length > 0) {
                $contentNode = $nodes->item(0);
                break;
            }
        }

        $content = '';
        if ($contentNode) {
            foreach ($xpath->query('.//script|.//style', $contentNode) as $remove) {
                $remove->parentNode->removeChild($remove);
            }
            
            // Clean whitespace
            $content = trim(preg_replace('/\s+/', ' ', $contentNode->textContent));
        }

        return [
            'content' => $content,
            'image_url' => $image,
            'published_at' => $date,
            'excerpt' => $excerpt
        ];

    } catch (\Exception $e) {
        return null;
    }
}

Route::get('/scrape', function () {
    $page = request('page', 13); 
    $response = Http::get("https://beyondchats.com/blogs/page/{$page}");
    $html = $response->body();

    $dom = new \DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new \DOMXPath($dom);

    // Target links inside standard H2/H3 headers for blogs
    $nodes = $xpath->query("//h2//a[contains(@href, '/blogs/')] | //h3//a[contains(@href, '/blogs/')]");

    // Fallback if H2/H3 fails
    if ($nodes->length === 0) {
         $nodes = $xpath->query("//div[contains(@class, 'post')]//a[contains(@href, '/blogs/')]");
    }

    $saved = 0;

    foreach ($nodes as $node) {
        $url = $node->getAttribute('href');

        if (!str_starts_with($url, 'http')) {
            $url = 'https://beyondchats.com' . $url;
        }

        // Duplicate check
        if (Article::where('source_url', $url)->exists()) continue;

        // Fetch detailed data
        $details = scrapeArticleDetails($url);

        // If scraping failed (empty content), skip saving
        if (!$details || empty($details['content'])) continue;

        Article::create([
            'title' => trim($node->textContent),
            'source_url' => $url, 
            'content' => $details['content'],
            'is_generated' => false,
           
        ]);

        $saved++;
        if ($saved === 5) break;
    }

    return response()->json([
        'message' => "Scraped Page {$page}",
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
    if (!$article) {
        return response()->json([
            'message' => 'Article not found'
        ], 404);
    }

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
            'status' => 'processing', // Keep waiting
        ]);
    }

    if ($job->job_status !== 'completed') {
        return response()->json([
            'status' => 'processing', // Still waiting
        ]);
    }

    return response()->json([
        'status' => 'completed',
        'enhanced_article_id' => $job->enhanced_article_id, // This will now have a value
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