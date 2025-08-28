<?php
protected $routeMiddleware = [
    // ...existing middlewares...
    'role' => \App\Http\Middleware\CheckRole::class,
];