<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TimeTables;
use App\Models\Course;
use App\Models\StudentCourse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class TimetableController extends Controller
{
    /**
     * Display the admin timetable.
     */
    public function index(): Response
    {
        $timetables = TimeTables::with('course')->get();
        $courses = Course::all();
        
        return Inertia::render('Admin/Timetable', [
            'timetables' => $timetables,
            'courses' => $courses
        ]);
    }
    
    /**
     * Display the student's timetable.
     */
    public function studentView(): Response
    {
        // Get the current user's ID
        $userId = Auth::id();
        
        // Get the student record for this user
        $student = \App\Models\Student::where('user_id', $userId)->first();
        
        if (!$student) {
            // Handle case where user is not a student
            return Inertia::render('Student/TimeTables', [
                'timetables' => [],
                'courses' => []
            ]);
        }
        
        // Get courses the student is enrolled in using the correct student_id
        $enrolledCourseIds = StudentCourse::where('student_id', $student->student_id)
            ->pluck('course_id')
            ->toArray();
        
        // Get timetable entries for enrolled courses
        $timetables = TimeTables::whereIn('course_id', $enrolledCourseIds)->get();
        
        // Get course details for the enrolled courses
        $courses = Course::whereIn('course_id', $enrolledCourseIds)->get();
        
        return Inertia::render('Student/TimeTables', [
            'timetables' => $timetables,
            'courses' => $courses
        ]);
    }
    
    /**
     * Store a new timetable entry.
     */
    public function store(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_id' => 'required|exists:courses,course_id',
            'classroom_no' => 'nullable|string|max:50'
        ]);
        
        TimeTables::create($request->all());
        
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Timetable entry added successfully!',
            ]);
        }
        
        return redirect()->back()->with('success', 'Timetable entry added successfully!');
    }
    
    /**
     * Update a timetable entry.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'day_of_week' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'course_id' => 'required|exists:courses,course_id',
            'classroom_no' => 'nullable|string|max:50'
        ]);
        
        $timetable = TimeTables::findOrFail($id);
        $timetable->update($request->all());
        
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Timetable entry updated successfully!'
            ]);
        }
        
        return redirect()->back()->with('success', 'Timetable entry updated successfully!');
    }
    
    /**
     * Delete a timetable entry.
     */
    public function destroy($id)
    {
        $timetable = TimeTables::findOrFail($id);
        $timetable->delete();
        
        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Timetable entry deleted successfully!'
            ]);
        }
        
        return redirect()->back()->with('success', 'Timetable entry deleted successfully!');
    }
}