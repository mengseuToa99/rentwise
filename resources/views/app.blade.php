<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel + React App</title>
    @viteReactRefresh 
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
   
</head>
<body>
    <div id="app"></div> <!-- React app will be mounted here -->
</body>
</html>

<script>
    window.__WS_TOKEN__ = '{{ csrf_token() }}';
</script>