<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TimeTables;
use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    /**
     * Display the timetable.
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
        
        return redirect()->back()->with('success', 'Timetable entry updated successfully!');
    }
    
    /**
     * Delete a timetable entry.
     */
    public function destroy($id)
    {
        $timetable = TimeTables::findOrFail($id);
        $timetable->delete();
        
        return redirect()->back()->with('success', 'Timetable entry deleted successfully!');
    }
}