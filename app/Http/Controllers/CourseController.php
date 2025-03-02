<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    public function store(Request $request)
{
    $validatedData = $request->validate([
        'subjectCode' => 'required|string|max:255',
        'subjectName' => 'required|string|max:255',
        'teacherId' => 'required|string|max:255',
        // 'teacherId' => 'nullable|integer|exists:teachers,tea_id',
        'grade' => 'required|string|max:10',
        'courseFee' => 'required|numeric',
        'courseDesc' => 'nullable|string',
    ]);

    $course = Course::create([
        'course_name' => $validatedData['subjectName'],
        'monthly_fees' => $validatedData['courseFee'],
        'course_desc' => $validatedData['courseDesc'],
        'teacher_id' => $validatedData['teacherId'],
    ]);

    return response()->json(['message' => 'Course created successfully!', 'course' => $course]);
}
    public function index()
    {
        $courses = Course::all();
        return response()->json($courses);
    }

    public function getCoursesCount()
    {
        $count = Course::count(); // Assuming you have a Course model
        return response()->json(['count' => $count]);
    }

}
