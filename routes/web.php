<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserRegistrationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TeacherLessonController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\AdminNoticeController;
use App\Http\Controllers\TeacherNoticeController;
use App\Http\Controllers\StudentNoticeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentAttendanceController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Middleware\CheckRole;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard route that redirects based on user role
Route::get('/dashboard', function () {
    $user = Auth::user();
    $userRegistration = $user->registration;
    
    if ($userRegistration && $userRegistration->role) {
        $userRole = strtolower($userRegistration->role->role_name);
        
        if ($userRole === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($userRole === 'teacher') {
            return redirect()->route('teacher.dashboard');
        } elseif ($userRole === 'student') {
            return redirect()->route('student.dashboard');
        }
    }
    
    return redirect('/');
})->middleware(['auth', 'verified'])->name('dashboard');

// Manually apply the CheckRole middleware
Route::middleware(['auth', 'verified'])->group(function () {
    // Admin routes
    Route::prefix('admin')->middleware([CheckRole::class . ':admin'])->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');
        
        Route::get('/courses', function () {
            return Inertia::render('Admin/Courses');
        })->name('admin.courses');
        
        Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        
        // Attendance routes
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('admin.attendance');
        Route::get('/attendance/manual', [AttendanceController::class, 'manualAttendance'])->name('admin.attendance.manual');
        Route::get('/attendance/qr', [AttendanceController::class, 'qrAttendance'])->name('admin.attendance.qr');
        Route::get('/attendance/report', [AttendanceController::class, 'getAttendanceReport'])->name('admin.attendance.report');
        Route::get('/attendance/stats', [AttendanceController::class, 'getAttendanceStats'])->name('admin.attendance.stats');
        Route::put('/attendance/{attendance}', [AttendanceController::class, 'updateAttendance'])->name('admin.attendance.update');
        Route::delete('/attendance/{attendance}', [AttendanceController::class, 'deleteAttendance'])->name('admin.attendance.delete');
        
        // Legacy route - can be removed or redirected
        Route::get('/attendance/mark-attendance', function () {
            return Inertia::render('Admin/MarkAttendance');
        })->name('mark-attendance');
        
        Route::get('/payments', [PaymentController::class, 'adminIndex'])->name('admin.payments');
        Route::post('/payments/{payment}/verify', [PaymentController::class, 'verifyPayment'])->name('admin.payments.verify');
        Route::post('/payments/{payment}/reject', [PaymentController::class, 'rejectPayment'])->name('admin.payments.reject');
        Route::post('/attendance/process-payment', [PaymentController::class, 'processManualPayment'])->name('admin.attendance.process-payment');
        Route::get('/payments/student/{student_id}', [PaymentController::class, 'getStudentPaymentHistory'])->name('admin.payments.student');

        Route::get('/users', function () {
            return Inertia::render('Admin/Users');
        });
        
        Route::get('/notices', function () {
            return Inertia::render('Admin/Notices');
        });
        
        Route::get('/time-tables', function () {
            return Inertia::render('Admin/Timetable');
        });
        
        Route::get('/exams', function () {
            return Inertia::render('Admin/Exams');
        });
    });

    // Teacher routes
    Route::prefix('teacher')->middleware([CheckRole::class . ':teacher'])->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Teacher/Dashboard');
        })->name('teacher.dashboard');
        
        Route::get('/courses', function () {
            return Inertia::render('Teacher/Courses');
        })->name('teacher.courses');
        
        // New route to get teacher's courses
        Route::get('/courses/list', [CourseController::class, 'teacherCourses'])->name('teacher.courses.list');
        
        Route::get('/courses/{course_id}', function ($course_id) {
            $course = \App\Models\Course::where('course_id', $course_id)->firstOrFail();
            return Inertia::render('Teacher/TeacherLessons', [
                'course_id' => $course->course_id,
                'course_name' => $course->course_name,
                'grade' => $course->grade
            ]);
        })->name('teacher.lessons');
        
        Route::get('/lessons/create', function () {
            return Inertia::render('Teacher/CreateLesson');
        });
        
        Route::get('/lessons/edit/{id}', function () {
            return Inertia::render('Teacher/EditLesson');
        });
        
        Route::get('/attendance', function () {
            return Inertia::render('Teacher/Attendance');
        });
        
        Route::get('/exams', function () {
            return Inertia::render('Teacher/Exams');
        });
        
        Route::get('/notices', function () {
            return Inertia::render('Teacher/Notices');
        });

        Route::get('/registered-grades', [CourseController::class, 'getTeacherGrades'])->name('teacher.grades');
        
        Route::get('/payments', function () {
            return Inertia::render('Teacher/Payments');
        });
        
        // Updated route for teacher timetables
        Route::get('/time-tables', [TimetableController::class, 'teacherView'])->name('teacher.timetables');
    });

    // Student routes
    Route::prefix('student')->middleware([CheckRole::class . ':student'])->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Student/Dashboard');
        })->name('student.dashboard');
        
        Route::get('/courses', function () {
            return Inertia::render('Student/Courses');
        })->name('student.courses');
        
        // New route to get student's registered courses
        Route::get('/registered-courses', [CourseController::class, 'studentRegisteredCourses']);
        
        Route::get('/courses/{course_id}', function ($course_id) {
            $course = \App\Models\Course::where('course_id', $course_id)->firstOrFail();
            return Inertia::render('Student/StudentLessons', [
                'course_id' => $course->course_id,
                'course_name' => $course->course_name,
                'grade' => $course->grade
            ]);
        })->name('student.lessons');
        
        Route::get('/attendance', function () {
            return Inertia::render('Student/Attendance');
        });

        Route::get('/attendance', [StudentAttendanceController::class, 'index'])->name('student.attendance');
        Route::get('/attendance/report', [StudentAttendanceController::class, 'getAttendanceReport'])->name('student.attendance.report');
        Route::get('/attendance/stats', [StudentAttendanceController::class, 'getAttendanceStats'])->name('student.attendance.stats');
        Route::get('/getStudentCourses', [StudentAttendanceController::class, 'getStudentCourses'])->name('student.courses');
        
        Route::get('/exams', function () {
            return Inertia::render('Student/Exams');
        });
        
        Route::get('/notices', function () {
            return Inertia::render('Student/Notices');
        });
        Route::get('/registered-courses', [PaymentController::class, 'getRegisteredCourses'])->name('student.registered-courses');
        
        // Updated student payments routes with controller
        Route::get('/payments', [PaymentController::class, 'index'])->name('student.payments');
        Route::get('/bank-transfer', [PaymentController::class, 'bankTransfer'])->name('student.bank-transfer');
        Route::post('/payments', [PaymentController::class, 'store'])->name('student.payments.store');
        
        Route::get('/time-tables', [TimetableController::class, 'studentView'])->name('student.timetables');
    });
});

// Public routes
Route::get('/aboutus', function () {
    return Inertia::render('AboutUs');
})->name('aboutus');

// API routes for course management
Route::middleware(['auth'])->group(function () {
    Route::get('/courses/count', [CourseController::class, 'getCoursesCount']);
    Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::put('/courses/{id}', [CourseController::class, 'update'])->name('courses.update');
    Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');
    Route::get('/teachers-id/{id}', [CourseController::class, 'show']);
    
    Route::get('/study-materials', [TeacherLessonController::class, 'index']);
    Route::post('/study-materials', [TeacherLessonController::class, 'store']);
    Route::get('/study-materials/{id}', [TeacherLessonController::class, 'show']);
    Route::put('/study-materials/{id}', [TeacherLessonController::class, 'update']);
    Route::delete('/study-materials/{id}', [TeacherLessonController::class, 'destroy']);
    Route::patch('/study-materials/{id}/toggle-visibility', [TeacherLessonController::class, 'toggleVisibility']);
    
    Route::get('/users', [UsersController::class, 'index']);
    Route::get('/users/search', [UsersController::class, 'searchUsers']);
    
    Route::get('/admin/notices', [AdminNoticeController::class, 'index']);
    Route::post('/admin/notices', [AdminNoticeController::class, 'store']);
    Route::put('/admin/notices/{notice}', [AdminNoticeController::class, 'update'])->name('admin.notices.update');
    Route::delete('/admin/notices/{notice}', [AdminNoticeController::class, 'destroy']);
    
    Route::get('/teacher/notices', [TeacherNoticeController::class, 'index'])->name('teacher.notices');
    Route::post('/teacher/notices', [TeacherNoticeController::class, 'store'])->name('teacher.notices.store');
    Route::put('/teacher/notices/{notice}', [TeacherNoticeController::class, 'update'])->name('teacher.notices.update');
    Route::delete('/teacher/notices/{notice}', [TeacherNoticeController::class, 'destroy'])->name('teacher.notices.delete');

    Route::get('/student/notices', [StudentNoticeController::class, 'index'])->name('student.notices');
    // Route::get('/student/registered-courses', [StudentNoticeController::class, 'getRegisteredCourses'])->name('student.registered-courses');
    Route::get('/student/registered-grades', [StudentNoticeController::class, 'getRegisteredGrades']);

    Route::get('/admin/time-tables', [TimetableController::class, 'index']);
    Route::post('/admin/time-tables', [TimetableController::class, 'store']);
    Route::put('/admin/time-tables/{id}', [TimetableController::class, 'update']);
    Route::delete('/admin/time-tables/{id}', [TimetableController::class, 'destroy']);
    
    // API routes for attendance
    Route::get('/admin/students/{id}', [AttendanceController::class, 'getStudentData']);
    Route::post('/admin/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/admin/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::post('/admin/attendance/qr', [AttendanceController::class, 'markQRAttendance']);

    Route::get('/teachers/count', [DashboardController::class, 'getTeachersCount']);
    Route::get('/students/count', [DashboardController::class, 'getStudentsCount']);
    Route::get('/payments/total', [DashboardController::class, 'getTotalRevenue']);
    Route::get('/payments/monthly', [DashboardController::class, 'getMonthlyPayments']);
    Route::get('/payments/revenue-by-month', [DashboardController::class, 'getRevenueByMonth']);
    Route::get('/students/monthly-registrations', [DashboardController::class, 'getMonthlyRegistrations']);
    Route::get('/courses/distribution', [DashboardController::class, 'getCourseDistribution']);
});

// Profile management
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Authentication routes
Route::get('/register', function () {
    return Inertia::render('auth.register');
})->name('register');

Route::post('/register', [UserRegistrationController::class, 'register'])->name('register');

// Email verification routes
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

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware('auth')
    ->name('verification.send');

require __DIR__.'/auth.php';