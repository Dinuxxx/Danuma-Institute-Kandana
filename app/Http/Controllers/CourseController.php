<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    public function store(Request $request)
{
    $validatedData = $request->validate([
        'subjectCode' => 'required|string|max:255|unique:courses,course_id',
        'subjectName' => 'required|string|max:255',
        'teacherId' => 'required|string|max:255',
        // 'teacherId' => 'nullable|integer|exists:teachers,tea_id',
        'grade' => 'required|string|max:10',
        'courseFee' => 'required|numeric',
        'courseDesc' => 'nullable|string',
    ]);

    $existingCourse = Course::where('course_name', $validatedData['subjectName'])
        ->where('grade', $validatedData['grade'])
        ->exists();

    if ($existingCourse) {
        return response()->json([
            'errors' => [
                'subjectName' => 'This subject name and grade combination already exists.',
                'grade' => 'This subject name and grade combination already exists.'
                ]
        ], 422);
    }

    $course = Course::create([
        'course_id' => $validatedData['subjectCode'],
        'course_name' => $validatedData['subjectName'],
        'monthly_fees' => $validatedData['courseFee'],
        'course_desc' => $validatedData['courseDesc'],
        'teacher_id' => $validatedData['teacherId'],
        'grade' => $validatedData['grade'],
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


    public function edit($id)
    {
        $course = Course::findOrFail($id);
        return inertia('Admin/EditCourse', [
            'course' => $course
        ]);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $validatedData = $request->validate([
            'subjectCode' => 'required|string|max:255',
            'subjectName' => 'required|string|max:255',
            'teacherId' => 'required|string|max:255',
            'grade' => 'required|string|max:10',
            'courseFee' => 'required|numeric',
            'courseDesc' => 'nullable|string',
        ]);

        $course->update([
            'course_id' => $validatedData['subjectCode'],
            'course_name' => $validatedData['subjectName'],
            'monthly_fees' => $validatedData['courseFee'],
            'course_desc' => $validatedData['courseDesc'],
            'teacher_id' => $validatedData['teacherId'],
            'grade' => $validatedData['grade'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Course updated successfully']);
        }
        
        return redirect()->route('admin.courses')
            ->with('message', 'Course updated successfully');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        
        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }
        
        return Redirect::route('admin.courses');
    }

}
