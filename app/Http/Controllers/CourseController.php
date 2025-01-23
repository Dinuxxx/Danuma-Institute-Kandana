<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function edit($id)
    {
        // Fetch course details based on $id (hardcoded for now)
        $course = [
            'id' => $id,
            'title' => "FM1478 - Maths",
            'instructor' => "Dr. Samdamali",
            'description' => "This is a mathematics course.",
        ];

        return inertia('Admin/EditCourses', ['course' => $course]);
    }
}
