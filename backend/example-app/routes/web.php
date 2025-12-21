<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Article;






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

    $response = Http::get('https://beyondchats.com/blogs?page=5');
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
    return view('home', compact('articles'));
});
Route::get('/articles/{id}', function ($id) {
    $articles = Article::find($id);
    return view('article', compact('articles'));
});





