import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe outside of component render so it's only loaded once
const stripePromise = loadStripe('pk_test_51RKALuGastNPoXVfwdEtvnWoloelAR7nLdrN9Su0JhptIE75u0EWnFqONHX3HSl9ekVpo7T2QzJX44uHodQ9N5ef00W6nTfmD8');

// Stripe Form Component
const CheckoutForm = ({ courses, totalDue, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Initialize with all courses selected
    setSelectedCourses(courses.map(course => course.course_id));
    setTotalAmount(totalDue);
  }, [courses, totalDue]);

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });

    // Update total amount based on selected courses
    const selectedTotal = courses
      .filter(course => {
        if (courseId === course.course_id) {
          return !selectedCourses.includes(courseId);
        }
        return selectedCourses.includes(course.course_id);
      })
      .reduce((sum, course) => sum + parseFloat(course.monthly_fees), 0);
    
    setTotalAmount(selectedTotal);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    if (selectedCourses.length === 0) {
      setErrorMessage('Please select at least one course');
      return;
    }
  
    setLoading(true);
    setErrorMessage(null);
  
    try {
      // Create payment intent on the server
      const response = await axios.post('/create-payment-intent', {
        amount: totalAmount,
        course_ids: selectedCourses
      });
      
      if (!response.data || !response.data.clientSecret) {
        throw new Error('Invalid response from server');
      }
  
      const clientSecret = response.data.clientSecret;
  
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
  
      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Send payment confirmation to your backend
        const paymentResponse = await axios.post(route('student.payments.stripe.record'), {
          method: 'Stripe',
          amount: totalAmount,
          course_ids: selectedCourses,
          stripe_payment_id: paymentIntent.id
        });
        
        onSuccess(paymentResponse.data.message);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        // Display server-returned error
        const errorMessage = err.response.data.error;
        setErrorMessage(errorMessage);
        onError(errorMessage);
      } else {
        // Generic error
        setErrorMessage('Payment processing failed. Please try again or contact support.');
        onError('Payment processing failed. ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  const nextStep = () => {
    if (selectedCourses.length === 0) {
      setErrorMessage('Please select at least one course');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: step === 1 ? '50%' : '100%' }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 mb-6">
        <span className={step === 1 ? "font-bold text-indigo-600" : ""}>Select Courses</span>
        <span className={step === 2 ? "font-bold text-indigo-600" : ""}>Payment Details</span>
      </div>

      {step === 1 ? (
        // Step 1: Course Selection
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Your Courses</h3>
            <p className="text-sm text-indigo-600">Select the courses you want to pay for:</p>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto px-2 py-4">
            {courses.map((course) => (
              <div key={course.course_id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  id={`course-${course.course_id}`}
                  checked={selectedCourses.includes(course.course_id)}
                  onChange={() => handleCourseSelection(course.course_id)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={course.has_pending_payment}
                />
                <div className="ml-3 flex-1">
                  <label htmlFor={`course-${course.course_id}`} className="block text-sm font-medium text-gray-700">
                    {course.course_name}
                  </label>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">Monthly fee</span>
                    <span className="text-sm font-semibold text-indigo-700">Rs.{parseFloat(course.monthly_fees).toFixed(2)}</span>
                  </div>
                  {course.has_pending_payment && 
                    <span className="inline-block mt-1 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      Pending Payment
                    </span>
                  }
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Selected Courses: <span className="font-semibold">{selectedCourses.length}</span></p>
              <p className="text-lg font-medium text-gray-800">Total: <span className="text-indigo-600">Rs.{totalAmount.toFixed(2)}</span></p>
            </div>
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              Continue
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Step 2: Payment Form
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Payment Details</h3>
            <p className="text-sm text-indigo-600">Enter your card information to complete payment</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Summary</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {courses.filter(course => selectedCourses.includes(course.course_id)).map((course) => (
                  <div key={course.course_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{course.course_name}</span>
                    <span className="font-medium">Rs.{parseFloat(course.monthly_fees).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-indigo-700">Rs.{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
              <div className="p-3 border border-gray-200 rounded bg-white">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              <p className="mt-2 text-xs text-gray-500">Your payment information is securely processed by Stripe.</p>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className={`inline-flex items-center px-6 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
                loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Pay Rs.{totalAmount.toFixed(2)}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Main Stripe Payment Component
const StripePayment = ({ courses, totalDue, onSuccess, onError }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          courses={courses} 
          totalDue={totalDue} 
          onSuccess={onSuccess} 
          onError={onError}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;