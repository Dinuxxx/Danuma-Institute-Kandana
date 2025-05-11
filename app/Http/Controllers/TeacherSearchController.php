<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\TimeTables;

class TeacherSearchController extends Controller
{
    /**
     * Search for teachers based on course name and/or grade
     * This endpoint is accessible without authentication for public access
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $courseName = $request->input('courseName');
        $grade = $request->input('grade');
        
        $query = Course::query();
        
        // Apply filters if provided
        if ($courseName) {
            $query->where('course_name', 'LIKE', "%{$courseName}%");
        }
        
        if ($grade && $grade !== 'Select grade') {
            // Extract just the number from "Grade X" format or handle A/L
            if ($grade === 'Grade A/L') {
                $query->where('grade', 'A/L');
            } else {
                $gradeNumber = preg_replace('/[^0-9]/', '', $grade);
                $query->where('grade', $gradeNumber);
            }
        }
        
        // Get courses matching the criteria
        $courses = $query->get();
        
        // If no courses found, return empty result
        if ($courses->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching courses found',
            ]);
        }
        
        // Get teacher IDs from matching courses
        $teacherIds = $courses->pluck('teacher_id')->unique()->filter()->values();
        
        // If no teachers assigned to these courses
        if ($teacherIds->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No teachers assigned to matching courses',
            ]);
        }
        
        // Get teacher details
        $teachers = Teacher::with('user')->whereIn('tea_id', $teacherIds)->get();
        
        // Format teacher data for response
        $teacherData = $teachers->map(function ($teacher) use ($courses) {
            $teacherCourses = $courses->where('teacher_id', $teacher->tea_id);
            
            // Get first and last names with better fallbacks
            $firstName = $teacher->user->first_name ?? '';
            $lastName = $teacher->user->last_name ?? '';
            
            // If we have registration info, also try to get name from there
            if (empty($firstName) && empty($lastName) && $teacher->user->registration) {
                $firstName = $teacher->user->registration->first_name ?? '';
                $lastName = $teacher->user->registration->last_name ?? '';
            }
            
            // Use the user's name field if first_name and last_name are empty
            $fullName = trim($firstName . ' ' . $lastName);
            if (empty(trim($fullName)) && isset($teacher->user->name)) {
                $fullName = $teacher->user->name;
            }
            
            // If still empty, provide a meaningful placeholder
            if (empty(trim($fullName))) {
                $fullName = 'Teacher ' . $teacher->tea_id;
            }
            
            // Get timetable data for teacher courses
            $courseIds = $teacherCourses->pluck('course_id')->toArray();
            $timetables = TimeTables::whereIn('course_id', $courseIds)
                ->with('course')
                ->get()
                ->map(function ($timetable) {
                    // Format time without seconds
                    $startTime = date('H:i', strtotime($timetable->start_time));
                    $endTime = date('H:i', strtotime($timetable->end_time));
                    
                    return [
                        'Subject Code' => $timetable->course->course_id,
                        'Subject Name' => $timetable->course->course_name,
                        'Grade' => $timetable->course->grade,
                        'Day' => $timetable->day_of_week,
                        'Start Time' => $startTime,
                        'End Time' => $endTime,
                    ];
                });
            
            return [
                'name' => $fullName,
                'image' => $teacher->user->registration ? $teacher->user->registration->image : null,
                'details' => [
                    ['label' => 'Email', 'value' => $teacher->user->email],
                    ['label' => 'Phone', 'value' => $teacher->user->registration ? $teacher->user->registration->tel_no : 'N/A'],
                    ['label' => 'Qualifications', 'value' => $teacher->qualifications ?? 'N/A'],
                    ['label' => 'Subjects', 'value' => $teacherCourses->pluck('course_name')->unique()->join(', ')],
                    ['label' => 'Grades', 'value' => $teacherCourses->pluck('grade')->unique()->sort()->join(', ')],
                ],
                'courses' => $teacherCourses->map(function ($course) {
                    return [
                        'id' => $course->course_id,
                        'name' => $course->course_name,
                        'grade' => $course->grade,
                    ];
                }),
                'timetable' => $timetables,
            ];
        });
        
        return response()->json([
            'success' => true,
            'teachers' => $teacherData,
        ]);
    }
}