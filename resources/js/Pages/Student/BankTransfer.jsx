import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const BankTransfer = ({ auth, bankDetails }) => {
  const [formData, setFormData] = useState({
    method: 'Bank Transfer',
    amount: '',
    selectedCourses: [],
    proof_image: null
  });
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch registered courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/student/registered-courses');
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update form data
      setFormData({
        ...formData,
        proof_image: file
      });

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Handle checkbox change
  const handleCourseCheckboxChange = (courseId, monthlyFees) => {
    // Create a copy of the current selectedCourses array
    let updatedSelectedCourses = [...formData.selectedCourses];
    
    // Check if course is already selected
    const courseIndex = updatedSelectedCourses.findIndex(c => c.id === courseId);
    
    if (courseIndex >= 0) {
      // If already selected, remove it
      updatedSelectedCourses.splice(courseIndex, 1);
    } else {
      // Otherwise add it
      updatedSelectedCourses.push({ id: courseId, fee: monthlyFees });
    }
    
    // Calculate total amount
    const totalAmount = updatedSelectedCourses.reduce((sum, course) => sum + parseFloat(course.fee), 0);
    
    // Update form data
    setFormData({
      ...formData,
      selectedCourses: updatedSelectedCourses,
      amount: totalAmount.toFixed(2)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please select at least one course to pay for');
      setLoading(false);
      return;
    }

    if (!formData.proof_image) {
      setError('Please upload proof of payment');
      setLoading(false);
      return;
    }

    // Create form data for file upload
    const submitData = new FormData();
    submitData.append('method', formData.method);
    submitData.append('amount', formData.amount);
    
    // Add each selected course ID
    formData.selectedCourses.forEach(course => {
      submitData.append('course_ids[]', course.id);
    });
    
    submitData.append('proof_image', formData.proof_image);
    
    try {
      // Send payment data to server
      const response = await axios.post('/student/payments', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Payment submitted successfully');
      // Reset form
      setFormData({
        method: 'Bank Transfer',
        amount: '',
        selectedCourses: [],
        proof_image: null
      });
      setPreviewUrl(null);
      
      // Redirect to payments page after 2 seconds
      setTimeout(() => {
        window.location.href = '/student/payments';
      }, 2000);
      
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  // Check if a course is selected
  const isCourseSelected = (courseId) => {
    return formData.selectedCourses.some(course => course.id === courseId);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Bank Transfer</h2>}
    >
      <Head title="Bank Transfer" />
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              {/* Bank Details Section */}
              <div className="mb-10 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Bank Account Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded shadow-sm">
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">{bankDetails.bank_name}</p>
                  </div>
                  <div className="p-4 bg-white rounded shadow-sm">
                    <p className="text-sm text-gray-500">Account Name</p>
                    <p className="font-medium">{bankDetails.account_name}</p>
                  </div>
                  <div className="p-4 bg-white rounded shadow-sm">
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">{bankDetails.account_number}</p>
                  </div>
                </div>
              </div>
              
              {/* Form Section */}
              <h3 className="text-xl font-semibold mb-6">Submit Payment Details</h3>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Courses to Pay
                  </label>
                  
                  {courses.length === 0 ? (
                    <p className="text-gray-500">No courses available for payment</p>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {courses.map((course) => {
                        const isFullyPaid = parseFloat(course.monthly_fees) === 0;
                        const hasPendingPayment = course.has_pending_payment;
                        const isDisabled = isFullyPaid || hasPendingPayment;
                        
                        return (
                          <div key={course.course_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`course-${course.course_id}`}
                              checked={isCourseSelected(course.course_id)}
                              onChange={() => handleCourseCheckboxChange(course.course_id, course.monthly_fees)}
                              disabled={isDisabled}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label 
                              htmlFor={`course-${course.course_id}`} 
                              className={`ml-3 block ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
                            >
                              {course.course_name} - Rs.{parseFloat(course.monthly_fees).toFixed(2)}
                              {isFullyPaid && <span className="ml-2 text-green-600 text-sm font-medium">(Paid)</span>}
                              {hasPendingPayment && <span className="ml-2 text-orange-500 text-sm font-medium">(Payment Pending)</span>}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Payment Amount (Rs.)
                  </label>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Amount is automatically calculated based on selected courses
                  </p>
                </div>
                
                {/* File Upload */}
                <div>
                  <label htmlFor="proof_image" className="block text-sm font-medium text-gray-700">
                    Upload Payment Proof
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="proof_image"
                      name="proof_image"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Please upload a screenshot or photo of your bank transfer receipt (JPEG, PNG, or PDF)
                  </p>
                </div>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <div className="mt-1 border rounded-md overflow-hidden max-w-md">
                      <img 
                        src={previewUrl} 
                        alt="Payment proof preview" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || formData.selectedCourses.length === 0}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default BankTransfer;