<?php

namespace App\Http\Controllers;

use App\Models\Exams;
use App\Models\ExamMarks;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Exception;

class StudentExamController extends Controller
{
    /**
     * Display a listing of student's exams with marks.
     */
    public function index()
    {
        try {
            $student = Auth::user()->student;
            
            if (!$student) {
                return redirect()->route('dashboard')->with('error', 'Student profile not found.');
            }

            // Get all exams for courses the student is registered for
            $examMarks = ExamMarks::where('student_id', $student->student_id)
                ->with(['exam.course'])
                ->get();

            // Get all exams from courses student is registered for (including those without marks)
            $allExams = Exams::whereHas('course.students', function($query) use ($student) {
                $query->where('students.student_id', $student->student_id)
                      ->where('student_courses.status', 'active');
            })->with(['course'])
            ->get();

            // Format exams data for frontend
            $formattedExams = $allExams->map(function ($exam) use ($examMarks, $student) {
                $examMark = $examMarks->firstWhere('exam_id', $exam->exam_id);
                $marks = $examMark ? $examMark->marks : null;

                // Calculate rank if student has marks
                $rank = null;
                if ($marks !== null) {
                    $rank = $this->calculateStudentRank($exam->exam_id, $student->student_id, $marks);
                }

                return [
                    'id' => $exam->exam_id,
                    'exam_name' => $exam->exam_name,
                    'course_name' => $exam->course->course_name,
                    'date' => $exam->exam_date,
                    'marks' => $marks,
                    'grade' => $marks !== null ? $this->calculateGrade($marks) : null,
                    'rank' => $rank
                ];
            });

            return Inertia::render('Student/Exams', [
                'exams' => $formattedExams->values()
            ]);
        } catch (Exception $e) {
            Log::error('Error in StudentExamController@index: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('error', 'Unable to load exams.');
        }
    }

    /**
     * Get student's exam data for API calls
     */
    public function getStudentExams()
    {
        try {
            $student = Auth::user()->student;
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found.'], 403);
            }

            // Get all exams for courses the student is registered for
            $examMarks = ExamMarks::where('student_id', $student->student_id)
                ->with(['exam.course'])
                ->get();

            // Get all exams from courses student is registered for (including those without marks)
            $allExams = Exams::whereHas('course.students', function($query) use ($student) {
                $query->where('students.student_id', $student->student_id)
                      ->where('student_courses.status', 'active');
            })->with(['course'])
            ->get();

            // Format exams data for frontend
            $formattedExams = $allExams->map(function ($exam) use ($examMarks, $student) {
                $examMark = $examMarks->firstWhere('exam_id', $exam->exam_id);
                $marks = $examMark ? $examMark->marks : null;

                // Calculate rank if student has marks
                $rank = null;
                if ($marks !== null) {
                    $rank = $this->calculateStudentRank($exam->exam_id, $student->student_id, $marks);
                }

                return [
                    'id' => $exam->exam_id,
                    'exam_name' => $exam->exam_name,
                    'course_name' => $exam->course->course_name,
                    'date' => $exam->exam_date,
                    'marks' => $marks,
                    'grade' => $marks !== null ? $this->calculateGrade($marks) : null,
                    'rank' => $rank
                ];
            });

            return response()->json([
                'success' => true,
                'exams' => $formattedExams->values()
            ]);
        } catch (Exception $e) {
            Log::error('Error in StudentExamController@getStudentExams: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch exams.'], 500);
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
     * Calculate student's rank for a specific exam
     */
    private function calculateStudentRank($examId, $studentId, $studentMarks)
    {
        try {
            // Get all marks for this exam ordered by marks descending
            $allMarks = ExamMarks::where('exam_id', $examId)
                ->orderBy('marks', 'desc')
                ->get();

            $rank = 1;
            $previousMarks = null;
            $studentsWithSameRank = 0;

            foreach ($allMarks as $mark) {
                if ($previousMarks !== null && $mark->marks < $previousMarks) {
                    $rank += $studentsWithSameRank;
                    $studentsWithSameRank = 1;
                } else {
                    $studentsWithSameRank++;
                }

                if ($mark->student_id == $studentId) {
                    return $rank;
                }

                $previousMarks = $mark->marks;
            }

            return null; // Student not found in rankings
        } catch (Exception $e) {
            Log::error('Error calculating student rank: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get exam statistics for the student
     */
    public function getExamStatistics()
    {
        try {
            $student = Auth::user()->student;
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found.'], 403);
            }

            $examMarks = ExamMarks::where('student_id', $student->student_id)->get();
            
            $totalExams = $examMarks->count();
            $averageMarks = $totalExams > 0 ? $examMarks->avg('marks') : 0;
            $highestMarks = $totalExams > 0 ? $examMarks->max('marks') : 0;
            $lowestMarks = $totalExams > 0 ? $examMarks->min('marks') : 0;

            // Grade distribution
            $gradeDistribution = $examMarks->map(function($mark) {
                return $this->calculateGrade($mark->marks);
            })->countBy()->toArray();

            return response()->json([
                'success' => true,
                'statistics' => [
                    'total_exams' => $totalExams,
                    'average_marks' => round($averageMarks, 2),
                    'highest_marks' => $highestMarks,
                    'lowest_marks' => $lowestMarks,
                    'grade_distribution' => $gradeDistribution
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error in StudentExamController@getExamStatistics: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch statistics.'], 500);
        }
    }
}