<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserRegistrationController; // Added this line to import the UserRegistrationController for handling the registration logic
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;

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



Route::get('/aboutus', function () {
    return Inertia::render('AboutUs'); 
})->name('admin.viewexams');



Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/courses/count', [CourseController::class, 'getCoursesCount']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/admin/courses', function () {
    return Inertia::render('Admin/Courses');
});

Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');

Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit');
Route::put('/courses/{id}', [CourseController::class, 'update'])->name('courses.update');
Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');

Route::get('/admin/attendance', function () {
    return Inertia::render('Admin/Attendance');
});

Route::get('/admin/attendance/mark-attendance', function () {
    return Inertia::render('Admin/MarkAttendance');
})->name('mark-attendance');

Route::get('/admin/payments', function () {
    return Inertia::render('Admin/Payments');
});
Route::get('/admin/users', function () {
    return Inertia::render('Admin/Users');
});
Route::get('/admin/notices', function () {
    return Inertia::render('Admin/Notices');
});
Route::get('/admin/time-tables', function () {
    return Inertia::render('Admin/Timetable');
});
Route::get('/admin/exams', function () {
    return Inertia::render('Admin/Exams');
});


// New route for user registration
Route::get('/register', function () {
    return Inertia::render('auth.register'); // Render the new registration form view
})->name('register');

Route::post('/register', [UserRegistrationController::class, 'register'])->name('register');


// Email verification notice
Route::get('/email/verify', [EmailVerificationPromptController::class, '__invoke'])
    ->middleware('auth')
    ->name('verification.notice');

// Email verification handler (this is already handled by Laravel)
Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->middleware(['auth', 'signed'])
    ->name('verification.verify');

// Resend verification email
Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware('auth')
    ->name('verification.send');

require __DIR__.'/auth.php';
