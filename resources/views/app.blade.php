<!-- <!-- 
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>-->

        <!-- Fonts -->
        <!--<link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />-->

        <!-- Scripts -->
        <!--@routes
        @viteReactRefresh 
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>  
-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danuma Institute Kandana - Student Management System</title>
    <!--<link rel="stylesheet" href="{{ asset('css/app.css') }}">-->
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">
                <img src="{{asset('images/logo.png')}}"alt="Danuma Logo">
                <span>Danum Institute Kandana</span>
            </div>
            <nav>
                <ul>
                    <li><a href="{{route('home')}}">Home</a></li>
                    <li><a href="{{route('about')}}">About</a></li>
                    <li><a href="{{route('faq')}}">FAQ</a></li>
                    <li><a href="{{route('contact')}}">Contact Us</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <footer>
        <p>&copy; {{ date('Y')}} Danuma INstitute Kandana. All rights reserved.</p>
    </footer>

</body>
</html> -->