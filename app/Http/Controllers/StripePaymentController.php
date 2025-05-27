<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Course;
use App\Models\Payment;
use App\Models\PaymentCourse;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use Log;

class StripePaymentController extends Controller
{
    public function __construct()
    {
        // Initialize Stripe with your secret key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function showStripePayment()
    {
        return Inertia::render('Student/StripePaymentPage');
    }

    /**
     * Create a PaymentIntent for Stripe
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'course_ids' => 'required|array',
            'course_ids.*' => 'string|exists:courses,course_id',
        ]);

        try {
            // Amount needs to be in cents for Stripe
            $amount = round($request->amount * 100);
            
            // Create a PaymentIntent with amount and currency
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'LKR',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'course_ids' => implode(',', $request->course_ids),
                    'user_id' => Auth::id()
                ],
                // More options can be added like receipt_email, etc.
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle successful payment and record it in database
     */
    public function recordPayment(Request $request)
    {
        $request->validate([
            'method' => 'required|string',
            'amount' => 'required|numeric',
            'course_ids' => 'required|array',
            'stripe_payment_id' => 'required|string'
        ]);

        try {
            // Get student ID from authenticated user
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();
            
            if (!$student) {
                return response()->json(['error' => 'Student profile not found'], 404);
            }

            // Create payment record
            // Store the stripe_payment_id in the proof_path field since there's no dedicated column
            $payment = new Payment([
                'student_id' => $student->student_id,
                'amount' => $request->amount,
                'method' => $request->method,
                'status' => 'Completed', // Auto-complete for Stripe payments
                'proof_path' => $request->stripe_payment_id, // Store Stripe ID in proof_path
            ]);
            
            $payment->save();

            // Create payment_course records for each course
            foreach ($request->course_ids as $courseId) {
                $course = Course::where('course_id', $courseId)->first();
                
                if ($course) {
                    PaymentCourse::create([
                        'payment_id' => $payment->payment_id,
                        'course_id' => $courseId,
                        'amount' => $course->monthly_fees,
                        'status' => 'Completed',
                        'month' => date('Y-m')
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'payment_id' => $payment->payment_id
            ]);
        } catch (\Exception $e) {
            Log::error('Payment recording error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to record payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
        
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            Log::error('Webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Webhook signature error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                // Extract course IDs and user ID from metadata
                $courseIds = explode(',', $paymentIntent->metadata->course_ids ?? '');
                $userId = $paymentIntent->metadata->user_id ?? null;
                
                if ($userId && !empty($courseIds)) {
                    $this->processSuccessfulPayment($paymentIntent, $userId, $courseIds);
                }
                break;
                
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                Log::info('Payment failed: ' . $paymentIntent->id);
                // You could notify the user or mark a pending payment as failed
                break;
                
            default:
                // Unexpected event type
                Log::info('Unhandled event type: ' . $event->type);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Process a successful Stripe payment
     */
    private function processSuccessfulPayment($paymentIntent, $userId, $courseIds)
    {
        try {
            $student = Student::where('user_id', $userId)->first();
            
            if (!$student) {
                Log::error('Student not found for user ID: ' . $userId);
                return;
            }
            
            // Calculate amount in actual currency (convert from cents)
            $amount = $paymentIntent->amount / 100;
            
            // Create payment record
            $payment = new Payment([
                'student_id' => $student->student_id,
                'amount' => $amount,
                'method' => 'Stripe',
                'status' => 'Completed',
                'proof_path' => $paymentIntent->id, // Store Stripe payment ID in proof_path
            ]);
            
            $payment->save();
            
            // Create payment_course records
            foreach ($courseIds as $courseId) {
                $course = Course::where('course_id', $courseId)->first();
                
                if ($course) {
                    PaymentCourse::create([
                        'payment_id' => $payment->payment_id,
                        'course_id' => $courseId,
                        'amount' => $course->monthly_fees,
                        'status' => 'Completed',
                        'month' => date('Y-m')
                    ]);
                }
            }
            
            Log::info('Payment recorded successfully: ' . $payment->payment_id);
        } catch (\Exception $e) {
            Log::error('Error processing successful payment: ' . $e->getMessage());
        }
    }
}