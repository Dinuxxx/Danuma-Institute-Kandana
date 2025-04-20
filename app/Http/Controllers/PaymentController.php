<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Payment;
use App\Models\Course;
use App\Models\StudentCourse;
use App\Models\PaymentCourse;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
 * Display the student payments page.
 */
public function index()
{
    $user = Auth::user();
    $student = Student::where('user_id', $user->id)->first();
    
    if (!$student) {
        return redirect()->route('student.dashboard')->with('error', 'Student profile not found');
    }
    
    // Calculate total due amount
    $dueAmount = $this->calculateDueAmount($student->student_id);
    
    // Get payment history with course information
    $payments = Payment::where('payments.student_id', $student->student_id)
        ->with(['paymentCourses' => function($query) {
            $query->join('courses', 'payments_courses.course_id', '=', 'courses.course_id')
                ->select('payments_courses.*', 'courses.course_name');
        }])
        ->orderBy('created_at', 'desc')
        ->get();
    
    // Get last payment amount
    $lastPayment = $payments->first() ? $payments->first()->amount : 0;
    
    return Inertia::render('Student/Payments', [
        'payments' => $payments,
        'dueAmount' => $dueAmount,
        'lastPayment' => $lastPayment
    ]);
}
    
    /**
     * Calculate total due amount for a student.
     */
    private function calculateDueAmount($studentId)
    {
        // Get all active courses for the student
        $studentCourses = StudentCourse::where('student_id', $studentId)
            ->where('status', 'active')
            ->get();
        
        // Get current month and year
        $currentMonth = Carbon::now()->format('F');
        $currentYear = Carbon::now()->year;
        
        // Calculate total monthly fees
        $totalMonthlyFees = 0;
        foreach ($studentCourses as $registration) {
            $course = Course::where('course_id', $registration->course_id)->first();
            if ($course) {
                $totalMonthlyFees += $course->monthly_fees;
            }
        }
        
        // Get total paid amount for the current month
        $paidAmount = Payment::where('student_id', $studentId)
            ->where('status', 'Completed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');
        
        // Calculate due amount
        $dueAmount = $totalMonthlyFees - $paidAmount;
        
        return max(0, $dueAmount); // Ensure due amount is not negative
    }
    
    /**
     * Get registered courses for a student.
     */
    /**
 * Get registered courses for a student.
 */
public function getRegisteredCourses(Request $request)
{
    $studentId = null;
    
    // Check if request is coming from admin with student_id parameter
    if ($request->has('student_id')) {
        $studentId = $request->student_id;
    } else {
        // Original flow - get student ID from auth user
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();
        
        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }
        
        $studentId = $student->student_id;
    }
    
    // Get student's active courses
    $registeredCourses = StudentCourse::where('student_id', $studentId)
        ->where('status', 'active')
        ->get();
        
    $courses = [];
    $totalDue = 0;
    
    foreach ($registeredCourses as $registration) {
        $course = Course::where('course_id', $registration->course_id)->first();
        if ($course) {
            // Calculate paid amount for this course this month
            $paidForCourse = Payment::join('payments_courses', 'payments.payment_id', '=', 'payments_courses.payment_id')
                ->where('payments.student_id', $studentId)
                ->where('payments.status', 'Completed')
                ->where('payments_courses.course_id', $course->course_id)
                ->whereMonth('payments.created_at', Carbon::now()->month)
                ->whereYear('payments.created_at', Carbon::now()->year)
                ->sum('payments_courses.amount');
            
            // Check if there's a pending payment for this course
            $pendingPayment = Payment::join('payments_courses', 'payments.payment_id', '=', 'payments_courses.payment_id')
                ->where('payments.student_id', $studentId)
                ->where('payments.status', 'Pending')
                ->where('payments_courses.course_id', $course->course_id)
                ->whereMonth('payments.created_at', Carbon::now()->month)
                ->whereYear('payments.created_at', Carbon::now()->year)
                ->exists();
            
            // Calculate due amount for this course
            $courseDue = max(0, $course->monthly_fees - $paidForCourse);
            
            $courses[] = [
                'course_id' => $course->course_id,
                'course_name' => $course->course_name,
                'grade' => $course->grade,
                'monthly_fees' => $courseDue, // Show only what is still due
                'has_pending_payment' => $pendingPayment // Flag to indicate pending payment
            ];
            
            $totalDue += $courseDue;
        }
    }
    
    return response()->json([
        'courses' => $courses,
        'totalDue' => $totalDue
    ]);
}
    
    /**
     * Process bank transfer payments.
     */
    // Add this to ensure the proof_path is stored correctly in the Payment model
public function bankTransfer()
{
    $bankDetails = [
        'bank_name' => 'Peoples Bank, Japura Branch',
        'account_name' => 'Daruma Institute',
        'account_number' => '001234567891234'
    ];
    
    return Inertia::render('Student/BankTransfer', [
        'bankDetails' => $bankDetails
    ]);
}

public function store(Request $request)
{
    $request->validate([
        'method' => 'required|string',
        'amount' => 'required|numeric|min:0',
        'course_ids' => 'nullable|array',
        'course_ids.*' => 'string|exists:courses,course_id',
        'proof_image' => 'required|file|max:2048|mimes:jpeg,png,jpg,pdf',
    ]);
    
    $user = Auth::user();
    $student = Student::where('user_id', $user->id)->first();
    
    if (!$student) {
        return response()->json(['message' => 'Student profile not found'], 404);
    }
    
    // Handle file upload
    $proofPath = null;
    if ($request->hasFile('proof_image')) {
        $proofPath = $request->file('proof_image')->store('payment_proofs', 'public');
    } else {
        return response()->json(['message' => 'Payment proof image is required'], 400);
    }
    
    // Create new payment record
    $payment = new Payment();
    $payment->method = $request->method;
    $payment->status = 'Pending'; // Initial status is pending until verified
    $payment->amount = $request->amount;
    $payment->student_id = $student->student_id;
    $payment->proof_path = $proofPath;
    $payment->save();
    
    // Create payment course record(s)
    if ($request->has('course_ids') && count($request->course_ids) > 0) {
        // Get the selected courses
        $selectedCourses = Course::whereIn('course_id', $request->course_ids)->get();
        
        // Calculate total fees of selected courses for proportional distribution
        $totalSelectedFees = $selectedCourses->sum('monthly_fees');
        
        // Create payment course records for each selected course
        foreach ($selectedCourses as $course) {
            // Calculate proportional amount for this course
            $proportion = $totalSelectedFees > 0 ? $course->monthly_fees / $totalSelectedFees : 0;
            $courseAmount = round($request->amount * $proportion, 2);
            
            $paymentCourse = new PaymentCourse();
            $paymentCourse->payment_id = $payment->payment_id;
            $paymentCourse->course_id = $course->course_id;
            $paymentCourse->month = Carbon::now()->format('F Y');
            $paymentCourse->amount = $courseAmount;
            $paymentCourse->status = 'Pending';
            $paymentCourse->save();
        }
    } else {
        // No specific courses selected - split among all courses (shouldn't happen with new UI)
        $studentCourses = StudentCourse::where('student_id', $student->student_id)
            ->where('status', 'active')
            ->get();
            
        $totalFees = 0;
        $coursesFees = [];
        
        // First calculate total fees to determine proportion
        foreach ($studentCourses as $registration) {
            $course = Course::where('course_id', $registration->course_id)->first();
            if ($course) {
                $totalFees += $course->monthly_fees;
                $coursesFees[$course->course_id] = $course->monthly_fees;
            }
        }
        
        // Then create payment course records with proportional amounts
        if ($totalFees > 0) {
            foreach ($coursesFees as $courseId => $fee) {
                $proportion = $fee / $totalFees;
                $courseAmount = round($request->amount * $proportion, 2);
                
                $paymentCourse = new PaymentCourse();
                $paymentCourse->payment_id = $payment->payment_id;
                $paymentCourse->course_id = $courseId;
                $paymentCourse->month = Carbon::now()->format('F Y');
                $paymentCourse->amount = $courseAmount;
                $paymentCourse->status = 'Pending';
                $paymentCourse->save();
            }
        }
    }
    
    return response()->json(['message' => 'Payment submitted successfully']);
}
    
    /**
     * Admin verification for payments - Approve payment
     */
    public function verifyPayment(Request $request, $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        $payment->status = 'Completed';
        $payment->verified_by = Auth::id();
        $payment->save();
        
        // Also update the status in payments_courses
        PaymentCourse::where('payment_id', $paymentId)
            ->update(['status' => 'Completed']);
        
        return redirect()->back()->with('success', 'Payment approved successfully');
    }
    
    /**
     * Admin rejection for payments - Reject payment
     */
    public function rejectPayment(Request $request, $paymentId)
  {
      $payment = Payment::findOrFail($paymentId);
      $payment->status = 'Rejected'; // Changed from 'Failed' to 'Rejected'
      // $payment->rejected_by = Auth::id();
      // $payment->rejection_reason = $request->input('reason', 'Payment rejected by administrator');
      $payment->save();
      
      // Also update the status in payments_courses
      PaymentCourse::where('payment_id', $paymentId)
          ->update(['status' => 'Rejected']);
      
      return redirect()->back()->with('success', 'Payment rejected successfully');
  }
    
    /**
     * Display admin payment management page
     */
    public function adminIndex()
    {
        $payments = Payment::with(['student.user'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Admin/Payments', [
            'payments' => $payments
        ]);
    }

    /**
     * Process manual cash payment by admin
     */
    public function processManualPayment(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,student_id',
            'amount' => 'required|numeric|min:0',
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,course_id',
            'method' => 'required|string'
        ]);
        
        // Create new payment record
        $payment = new Payment();
        $payment->method = $request->method;
        $payment->status = 'Completed'; // Direct cash payments are marked as completed immediately
        $payment->amount = $request->amount;
        $payment->student_id = $request->student_id;
        $payment->verified_by = Auth::id(); // Admin who processed the payment
        $payment->save();
        
        // Get the selected courses
        $selectedCourses = Course::whereIn('course_id', $request->course_ids)->get();
        
        // Calculate total fees of selected courses for proportional distribution
        $totalSelectedFees = $selectedCourses->sum('monthly_fees');
        
        // Create payment course records for each selected course
        foreach ($selectedCourses as $course) {
            // Calculate proportional amount for this course
            $proportion = $totalSelectedFees > 0 ? $course->monthly_fees / $totalSelectedFees : 0;
            $courseAmount = round($request->amount * $proportion, 2);
            
            $paymentCourse = new PaymentCourse();
            $paymentCourse->payment_id = $payment->payment_id;
            $paymentCourse->course_id = $course->course_id;
            $paymentCourse->month = Carbon::now()->format('F Y');
            $paymentCourse->amount = $courseAmount;
            $paymentCourse->status = 'Completed';
            $paymentCourse->save();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully',
            'payment_id' => $payment->payment_id
        ]);
    }

    public function getStudentData($id)
    {
        $student = Student::where('student_id', $id)
            ->orWhere('first_name', 'like', "%{$id}%")
            ->orWhere('last_name', 'like', "%{$id}%")
            ->first();
        
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }
        
        // Get courses for this student
        $courses = StudentCourse::where('student_id', $student->student_id)
            ->where('status', 'active')
            ->join('courses', 'student_courses.course_id', '=', 'courses.course_id')
            ->select('courses.*')
            ->get();
        
        return response()->json([
            'student' => $student,
            'courses' => $courses
        ]);
    }

    public function getStudentPaymentHistory($studentId)
    {
        // Get payment history with course information
        $payments = Payment::where('payments.student_id', $studentId)
            ->with(['paymentCourses' => function($query) {
                $query->join('courses', 'payments_courses.course_id', '=', 'courses.course_id')
                    ->select('payments_courses.*', 'courses.course_name');
            }])
            ->where('status', 'Completed')  // Only show completed payments
            ->orderBy('created_at', 'desc')
            ->limit(5)  // Limit to most recent 5 payments
            ->get();
        
        return response()->json([
            'payments' => $payments
        ]);
    }
}