import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import StripePayment from '@/Components/Student Components/StripePayment';
import axios from 'axios';

const StripePaymentPage = ({ auth }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(route('student.registered-courses'));
      
      // Filter courses to only include those with pending payments or no payment status
      const validCourses = response.data.courses.filter(course => 
        !course.has_pending_payment || course.payment_status !== 'Completed'
      );
      
      setCourses(validCourses);
      
      // Calculate total due from valid courses
      const calculatedTotal = validCourses.reduce(
        (sum, course) => sum + parseFloat(course.monthly_fees), 
        0
      );
      
      setTotalDue(calculatedTotal);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (successMessage) => {
    setMessage(successMessage || 'Payment successful!');
    // Reload courses to update payment status
    fetchCourses();
    
    // Redirect after a delay to allow the user to see the success message
    setTimeout(() => {
      router.visit(route('student.payments'));
    }, 2000);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage || 'Payment failed. Please try again.');
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stripe Payment</h2>}
    >
      <Head title="Stripe Payment" />
      <div className="pb-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 space-y-8">
              {/* Header Section */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-blue-600">Pay with Stripe</h1>
                <p className="text-gray-600">Securely pay your course fees online</p>
              </div>

              {/* Message Alerts */}
              {message && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                  <p>{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <p>{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Loading payment information...</span>
                </div>
              ) : (
                <>
                  {/* If no courses or all paid for */}
                  {courses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lg text-gray-600">You don't have any pending payments at this time.</p>
                      <button
                        onClick={() => router.visit(route('student.payments'))}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Return to Payments
                      </button>
                    </div>
                  ) : (
                    /* Stripe Payment Component */
                    <div className="mt-6">
                      <StripePayment
                        courses={courses}
                        totalDue={totalDue}
                        onSuccess={handleSuccess}
                        onError={handleError}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Back Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => router.visit(route('student.payments'))}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back to Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default StripePaymentPage;