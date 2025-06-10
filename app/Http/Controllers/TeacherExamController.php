<?php

namespace App\Http\Controllers;

use App\Models\Exams;
use App\Models\Course;
use App\Models\Student;
use App\Models\ExamMarks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;

class TeacherExamController extends Controller
{
    /**
     * Display a listing of teacher's exams.
     */
    public function index()
    {
        try {
            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                return redirect()->route('dashboard')->with('error', 'Teacher profile not found.');
            }

            // Get all exams for courses taught by this teacher
            $exams = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->with(['course', 'marks.student.user'])->get();

            // Format exams data for frontend
            $formattedExams = $exams->map(function ($exam) {
                $topStudents = $exam->marks()
                    ->with('student.user')
                    ->orderBy('marks', 'desc')
                    ->take(3)
                    ->get();

                return [
                    'id' => $exam->exam_id,
                    'name' => $exam->exam_name,
                    'course' => $exam->course->course_name,
                    'level' => 'Grade ' . $exam->course->grade,
                    'date' => $exam->exam_date,
                    'totalStudents' => $exam->marks()->count(),
                    'studentAvatars' => $topStudents->map(function ($mark) {
                        return 'https://ui-avatars.com/api/?name=' . urlencode($mark->student->user->name) . '&background=random';
                    })->toArray()
                ];
            });

            return Inertia::render('Teacher/Exams', [
                'exams' => $formattedExams
            ]);
        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@index: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('error', 'Unable to load exams.');
        }
    }

    /**
     * Store a newly created exam.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Exam creation request received', [
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                Log::error('Teacher profile not found for user: ' . Auth::id());
                return response()->json(['error' => 'Teacher profile not found.'], 403);
            }

            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'grade' => 'required|string|max:50',
                'date' => 'required|date|after_or_equal:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }

            // Extract numeric grade from "Grade X" format
            $gradeInput = $request->grade;
            $gradeNumber = str_replace('Grade ', '', $gradeInput);

            // Find a course for this teacher and grade
            $course = Course::where('teacher_id', $teacher->tea_id)
                           ->where('grade', $gradeNumber)
                           ->first();

            if (!$course) {
                return response()->json([
                    'error' => 'No course found for the selected grade. Please ensure you have a course assigned for Grade ' . $gradeNumber
                ], 404);
            }

            // Create the exam
            $examData = [
                'exam_name' => $request->name,
                'course_id' => $course->course_id,
                'exam_date' => $request->date,
                'status' => 'active'
            ];

            $exam = Exams::create($examData);

            // Return the formatted exam data
            $formattedExam = [
                'id' => $exam->exam_id,
                'name' => $exam->exam_name,
                'course' => $course->course_name,
                'level' => 'Grade ' . $course->grade,
                'date' => $exam->exam_date,
                'totalStudents' => 0,
                'studentAvatars' => []
            ];

            return response()->json([
                'success' => true,
                'message' => 'Exam created successfully!',
                'exam' => $formattedExam
            ], 201);

        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@store: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to create exam. Please try again.'
            ], 500);
        }
    }

    /**
     * Get teacher's registered grades for dropdown
     */
    public function getTeacherGrades()
    {
        try {
            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                return response()->json(['error' => 'Teacher profile not found.'], 403);
            }

            // Get unique grades from courses taught by this teacher
            $grades = Course::where('teacher_id', $teacher->tea_id)
                           ->distinct()
                           ->pluck('grade')
                           ->map(function ($grade) {
                               return "Grade $grade";
                           })
                           ->toArray();

            return response()->json([
                'grades' => $grades
            ]);
        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@getTeacherGrades: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch grades.'], 500);
        }
    }

    /**
     * Display the specified exam.
     */
    public function show($id)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->with(['course', 'marks.student.user'])
              ->findOrFail($id);

            return response()->json([
                'exam' => $exam
            ]);
        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@show: ' . $e->getMessage());
            return response()->json(['error' => 'Exam not found.'], 404);
        }
    }

    /**
     * Update the specified exam.
     */
    public function update(Request $request, $id)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'date' => 'required|date|after_or_equal:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }

            $exam->update([
                'exam_name' => $request->name,
                'exam_date' => $request->date
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully!',
                'exam' => $exam
            ]);

        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@update: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update exam. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove the specified exam.
     */
    public function destroy($id)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->findOrFail($id);

            // Delete related exam marks first
            $exam->marks()->delete();
            
            // Delete the exam
            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully!'
            ]);

        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@destroy: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete exam. Please try again.'
            ], 500);
        }
    }

    /**
     * Get students for a specific exam with their marks
     */
    public function getExamStudents($examId)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                return response()->json(['error' => 'Teacher profile not found.'], 403);
            }

            // Get exam and verify it belongs to this teacher
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->with('course')->findOrFail($examId);

            // Get all students registered for this course with user registration details
            $students = $exam->course->students()
                ->with(['user.registration', 'examMarks' => function($query) use ($examId) {
                    $query->where('exam_id', $examId);
                }])
                ->wherePivot('status', 'active')
                ->get();

            // Format student data
            $formattedStudents = $students->map(function ($student) use ($examId) {
                $examMark = $student->examMarks->first();
                $marks = $examMark ? $examMark->marks : null;
                $grade = $marks !== null ? $this->calculateGrade($marks) : null;
                
                return [
                    'student_id' => $student->student_id, // Keep for internal operations
                    'registration_id' => $student->user->registration->registration_id ?? 'N/A',
                    'student_name' => $student->user->name,
                    'marks' => $marks,
                    'grade' => $grade,
                    'rank' => null
                ];
            });

            // Calculate ranks
            $rankedStudents = $this->calculateRanks($formattedStudents->toArray());

            return response()->json([
                'success' => true,
                'exam' => [
                    'id' => $exam->exam_id,
                    'name' => $exam->exam_name,
                    'course' => $exam->course->course_name,
                    'date' => $exam->exam_date,
                    'level' => 'Grade ' . $exam->course->grade
                ],
                'students' => $rankedStudents
            ]);

        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@getExamStudents: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch exam students.'], 500);
        }
    }

    /**
     * Save or update exam marks for a student
     */
    public function saveExamMarks(Request $request, $examId)
{
    try {
        // Enhanced logging for debugging
        Log::info('saveExamMarks called', [
            'exam_id' => $examId,
            'request_data' => $request->all(),
            'user_id' => Auth::id()
        ]);

        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            Log::error('Teacher profile not found', ['user_id' => Auth::id()]);
            return response()->json(['error' => 'Teacher profile not found.'], 403);
        }

        Log::info('Teacher found', ['teacher_id' => $teacher->tea_id]);

        // Verify exam belongs to this teacher
        $exam = Exams::whereHas('course', function ($query) use ($teacher) {
            $query->where('teacher_id', $teacher->tea_id);
        })->findOrFail($examId);

        Log::info('Exam found', ['exam_id' => $exam->exam_id, 'exam_name' => $exam->exam_name]);

        // Fixed validation - student_id should be integer, not string
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|integer|exists:students,student_id',
            'marks' => 'required|numeric|min:0|max:100'
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        Log::info('Validation passed');

        // Fixed: Verify student is registered for this course with proper table prefixes
        $student = Student::whereHas('courses', function($query) use ($exam) {
            $query->where('courses.course_id', $exam->course_id)  // Specify table prefix
                ->where('student_courses.status', 'active'); // Specify table prefix for pivot
        })->where('student_id', $request->student_id)->first();

        if (!$student) {
            Log::error('Student not found or not registered for course', [
                'student_id' => $request->student_id,
                'course_id' => $exam->course_id
            ]);
            return response()->json(['error' => 'Student not found or not registered for this course.'], 404);
        }

        Log::info('Student found', ['student_id' => $student->student_id, 'student_name' => $student->user->name]);

        // Create or update exam marks
        $examMark = ExamMarks::updateOrCreate(
            [
                'exam_id' => $examId,
                'student_id' => $request->student_id
            ],
            [
                'marks' => $request->marks
            ]
        );

        Log::info('Exam marks saved', ['exam_mark_id' => $examMark->row_id ?? 'new']);

        // Calculate grade
        $grade = $this->calculateGrade($request->marks);

        return response()->json([
            'success' => true,
            'message' => 'Marks saved successfully!',
            'data' => [
                'student_id' => $request->student_id,
                'student_name' => $student->user->name,
                'marks' => (float) $request->marks,
                'grade' => $grade
            ]
        ]);

    } catch (Exception $e) {
        Log::error('Error in TeacherExamController@saveExamMarks: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'exam_id' => $examId,
            'request_data' => $request->all()
        ]);
        return response()->json(['error' => 'Failed to save marks: ' . $e->getMessage()], 500);
    }
}

    /**
     * Delete exam marks for a student
     */
    public function deleteExamMarks(Request $request, $examId)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                return response()->json(['error' => 'Teacher profile not found.'], 403);
            }

            // Verify exam belongs to this teacher
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->findOrFail($examId);

            // Validate request
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,student_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find and delete the exam mark
            $examMark = ExamMarks::where('exam_id', $examId)
                                ->where('student_id', $request->student_id)
                                ->first();

            if ($examMark) {
                $examMark->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Marks deleted successfully!'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No marks found to delete.'
            ], 404);

        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@deleteExamMarks: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete marks.'], 500);
        }
    }

    /**
     * Calculate grade based on marks
     */
    private function calculateGrade($marks)
    {
        if ($marks >= 85) return 'A+';
        if ($marks >= 75) return 'A';
        if ($marks >= 60) return 'B';
        if ($marks >= 50) return 'C';
        if ($marks >= 35) return 'S';
        return 'W';
    }

    /**
     * Calculate ranks for students based on marks
     */
    private function calculateRanks($students)
    {
        // Separate students with and without marks
        $studentsWithMarks = array_filter($students, function($student) {
            return $student['marks'] !== null;
        });
        
        $studentsWithoutMarks = array_filter($students, function($student) {
            return $student['marks'] === null;
        });

        // Sort students with marks by marks (descending)
        usort($studentsWithMarks, function($a, $b) {
            return $b['marks'] - $a['marks'];
        });

        // Assign ranks
        $currentRank = 1;
        $previousMarks = null;
        $studentsWithSameMarks = 0;

        foreach ($studentsWithMarks as $index => &$student) {
            if ($previousMarks !== null && $student['marks'] < $previousMarks) {
                $currentRank += $studentsWithSameMarks;
                $studentsWithSameMarks = 1;
            } else {
                $studentsWithSameMarks++;
            }
            
            $student['rank'] = $currentRank;
            $previousMarks = $student['marks'];
        }

        // Students without marks don't get ranks
        foreach ($studentsWithoutMarks as &$student) {
            $student['rank'] = null;
        }

        // Combine and sort by student_id for consistent display
        $allStudents = array_merge($studentsWithMarks, $studentsWithoutMarks);
        usort($allStudents, function($a, $b) {
            return strcmp($a['student_id'], $b['student_id']);
        });

        return $allStudents;
    }

    /**
     * Display the exam marks management page
     */
    public function showExamMarks($examId)
    {
        try {
            $teacher = Auth::user()->teacher;
            
            if (!$teacher) {
                return redirect()->route('dashboard')->with('error', 'Teacher profile not found.');
            }

            // Get exam and verify it belongs to this teacher
            $exam = Exams::whereHas('course', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->tea_id);
            })->with('course')->findOrFail($examId);

            return Inertia::render('Teacher/ExamMarks', [
                'exam' => [
                    'id' => $exam->exam_id,
                    'name' => $exam->exam_name,
                    'course' => $exam->course->course_name,
                    'date' => $exam->exam_date,
                    'level' => 'Grade ' . $exam->course->grade
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error in TeacherExamController@showExamMarks: ' . $e->getMessage());
            return redirect()->route('teacher.dashboard')->with('error', 'Exam not found or access denied.');
        }
    }
}