<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\ContactController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

 Route::get('/', function () {
     return Inertia::render('Welcome', [
         'canLogin' => Route::has('login'),
         'canRegister' => Route::has('register'),
         'laravelVersion' => Application::VERSION,
         'phpVersion' => PHP_VERSION,
     ]);
 });

Route::get('/home', [HomeController::class, 'index'])->name('home');

Route::get('/about', [AboutController::class, 'index'])->name('about');

Route::get('/faq', [FaqController::class, 'index'])->name('faq');

Route::get('/contact', [ContactController::class, 'index'])->name('contact');




Route::get('/student/coursedetails', function () {
    return Inertia::render('Students/StudentCourses'); 
})->name('student.coursedetails');


Route::get('/teacher/coursedetails', function () {
    return Inertia::render('Teachers/TeacherCourses'); 
})->name('teacher.coursedetails');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';


