<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Article Details</h1>
    <div>
        <h2>{{ $articles->title }}</h2>
        <p>{{ $articles->content }}</p>
        <p>{{ $articles->source_url }}</p>
        <p>{{ $articles->is_generated ? 'Generated' : 'Scraped' }}</p>
    </div>
    
</body>
</html>