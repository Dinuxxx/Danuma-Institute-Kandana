<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserRegistrationController; // Added this line to import the UserRegistrationController for handling the registration logic
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TeacherLessonController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// teacher routes

Route::get('/teacher/dashboard', function () {
    return Inertia::render('Teacher/Dashboard'); 
})->name('admin.viewexams');

Route::get('/teacher/courses', function () {
    return Inertia::render('Teacher/Courses'); 
})->name('admin.viewexams');

Route::get('/teacher/courses/{course_id}', function ($course_id) {
    $course = \App\Models\Course::where('course_id', $course_id)->firstOrFail();
    return Inertia::render('Teacher/TeacherLessons', [
        'course_id' => $course->course_id,
        'course_name' => $course->course_name,
        'grade' => $course->grade
    ]);
})->name('teacher.lessons');

Route::get('/teacher/lessons/create', function () {
    return Inertia::render('Teacher/CreateLesson'); 
})->name('admin.viewexams');

Route::get('/teacher/lessons/edit/{id}', function ($id) {
    return Inertia::render('Teacher/EditLesson');
});

Route::get('/study-materials', [TeacherLessonController::class, 'index']);
Route::post('/study-materials', [TeacherLessonController::class, 'store']);
Route::get('/study-materials/{id}', [TeacherLessonController::class, 'show']);
Route::put('/study-materials/{id}', [TeacherLessonController::class, 'update']);
Route::delete('/study-materials/{id}', [TeacherLessonController::class, 'destroy']);
Route::patch('/study-materials/{id}/toggle-visibility', [TeacherLessonController::class, 'toggleVisibility']);

Route::get('/teacher/attendance', function () {
    return Inertia::render('Teacher/Attendance'); 
})->name('admin.viewexams');

Route::get('/teacher/exams', function () {
    return Inertia::render('Teacher/Exams'); 
})->name('admin.viewexams');

Route::get('/teacher/notices', function () {
    return Inertia::render('Teacher/Notices'); 
})->name('admin.viewexams');

Route::get('/teacher/payments', function () {
    return Inertia::render('Teacher/Payments'); 
})->name('admin.viewexams');

Route::get('/teacher/time-tables', function () {
    return Inertia::render('Teacher/TimeTables'); 
})->name('admin.viewexams');


// student routes

Route::get('/student/dashboard', function () {
    return Inertia::render('Student/Dashboard'); 
})->name('admin.viewexams');

Route::get('/student/courses', function () {
    return Inertia::render('Student/Courses'); 
})->name('admin.viewexams');

Route::get('/student/courses/{course_id}', function ($course_id) {
    $course = \App\Models\Course::where('course_id', $course_id)->firstOrFail();
    return Inertia::render('Student/StudentLessons', [
        'course_id' => $course->course_id,
        'course_name' => $course->course_name,
        'grade' => $course->grade
    ]);
})->name('teacher.lessons');

Route::get('/student/attendance', function () {
    return Inertia::render('Student/Attendance'); 
})->name('admin.viewexams');

Route::get('/student/exams', function () {
    return Inertia::render('Student/Exams'); 
})->name('admin.viewexams');

Route::get('/student/notices', function () {
    return Inertia::render('Student/Notices'); 
})->name('admin.viewexams');

Route::get('/student/payments', function () {
    return Inertia::render('Student/Payments'); 
})->name('admin.viewexams');

Route::get('/student/time-tables', function () {
    return Inertia::render('Student/TimeTables'); 
})->name('admin.viewexams');

Route::get('/aboutus', function () {
    return Inertia::render('AboutUs'); 
})->name('admin.viewexams');


// Admin routes

Route::get('/admin/dashboard', function () {
    return Inertia::render('Admin/Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/courses/count', [CourseController::class, 'getCoursesCount']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/admin/courses', function () {
    return Inertia::render('Admin/Courses');
})->name('admin.courses');

Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');

Route::get('/admin/courses/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit');
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
Route::get('/admin/time-tables', [TimetableController::class, 'index']);
Route::post('/admin/time-tables', [TimetableController::class, 'store']);
Route::put('/admin/time-tables/{id}', [TimetableController::class, 'update']);
Route::delete('/admin/time-tables/{id}', [TimetableController::class, 'destroy']);

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

    // In routes/web.php
Route::middleware('auth')->get('/verification-status', function (Request $request) {
    return response()->json([
        'verified' => $request->user()->hasVerifiedEmail()
    ]);
});

// Email verification handler (this is already handled by Laravel)
Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])
    ->middleware(['auth', 'signed'])
    ->name('verification.verify');

// Resend verification email
Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware('auth')
    ->name('verification.send');

require __DIR__.'/auth.php';
