<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserRegistrationController; // Added this line to import the UserRegistrationController for handling the registration logic
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistrationController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/teacher/lessons', function () {
    return Inertia::render('Teachers/TeacherLessons'); 
})->name('admin.viewexams');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



// New route for user registration
Route::get('/register', function () {
    return Inertia::render('auth.register'); // Render the new registration form view
})->name('register');

Route::post('/register', [UserRegistrationController::class, 'register'])->name('register');




require __DIR__.'/auth.php';
