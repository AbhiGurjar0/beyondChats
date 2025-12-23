<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <h1>Home</h1>
    </p>
    @foreach ($articles as $article)
        <a href="/articles/{{ $article->id }}">
            <div>
                <h2>{{ $article->title }}</h2>
                <p>{{ $article->content }}</p>
                <p>{{ $article->source_url }}</p>
                <p>{{ $article->is_generated ? 'Generated' : 'Scraped' }}</p>
            </div>
        </a>
    @endforeach
    </p>

</body>

</html>