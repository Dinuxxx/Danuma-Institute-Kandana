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
                <span>Danuma Institute Kandana</span>
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
        <p>&copy; {{ date('Y')}} Danuma Institute Kandana. All rights reserved.</p>
    </footer>

</body>
</html>