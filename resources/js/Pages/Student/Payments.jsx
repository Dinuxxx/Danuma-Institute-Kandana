import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';

const Payments = ({ auth, payments = [], dueAmount = 0, lastPayment = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const initiatePayhere = () => {
    // Payhere payment initiation logic would go here
    alert('Initiating Payhere payment gateway');
    // You would typically redirect to Payhere or open their widget here
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  // Sort table data
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPayments = () => {
    if (!payments.length) return [];
    
    const sortablePayments = [...payments];
    sortablePayments.sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortablePayments;
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortConfig.key !== column) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Get payment status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to display course names from payment_courses
  const getCoursesForPayment = (payment) => {
    if (payment.payment_courses && payment.payment_courses.length > 0) {
      return payment.payment_courses.map(pc => pc.course_name || 'Unknown Course').join(', ');
    } else {
      return "All Courses";
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payments</h2>}
    >
      <Head title="Payments" />
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Notification or flash message */}
          {auth.flash?.success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{auth.flash.success}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-8 text-gray-900">
              {/* Payment Info Section - Increased spacing between items */}
              <div className="flex flex-col md:flex-row justify-center space-x-0 md:space-x-40 mb-10 text-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg text-indigo-600 font-medium">Due Amount</h3>
                  <p className="text-4xl font-bold text-gray-800">Rs.{formatCurrency(dueAmount)}</p>
                  <p className="text-sm text-gray-500 mt-2">Monthly total based on registered courses</p>
                </div>
                <div>
                  <h3 className="text-lg text-indigo-600 font-medium">Last Payment</h3>
                  <p className="text-4xl font-bold text-gray-800">Rs.{formatCurrency(lastPayment)}</p>
                  <p className="text-sm text-gray-500 mt-2">Most recent payment made</p>
                </div>
              </div>
              
              {/* Payment Buttons - Increased gap and added vibrant colors */}
              <div className="flex flex-col md:flex-row gap-16 mb-12 justify-center">
                <button 
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-12 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200 shadow-sm"
                  onClick={() => router.visit(route('student.bank-transfer'))}
                >
                  <span className="inline-block w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  Bank Transfer
                </button>
                <button 
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-12 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200 shadow-sm"
                  onClick={initiatePayhere}
                >
                  <span className="inline-block w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </span>
                  Payhere
                </button>
              </div>
              
              {/* Payment History Section with Updated Table Headers */}
              <div>
                <h3 className="text-xl text-center mb-6 text-indigo-700 font-semibold">Payment History</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                  <table className="min-w-full bg-white">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium cursor-pointer" onClick={() => requestSort('method')}>
                          Method
                          <button className="ml-1 inline-block text-indigo-400">
                            {renderSortIndicator('method')}
                          </button>
                        </th>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium cursor-pointer" onClick={() => requestSort('course_name')}>
                          Course
                          <button className="ml-1 inline-block text-indigo-400">
                            {renderSortIndicator('course_name')}
                          </button>
                        </th>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium cursor-pointer" onClick={() => requestSort('amount')}>
                          Amount
                          <button className="ml-1 inline-block text-indigo-400">
                            {renderSortIndicator('amount')}
                          </button>
                        </th>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium cursor-pointer" onClick={() => requestSort('created_at')}>
                          Date
                          <button className="ml-1 inline-block text-indigo-400">
                            {renderSortIndicator('created_at')}
                          </button>
                        </th>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium cursor-pointer" onClick={() => requestSort('status')}>
                          Status
                          <button className="ml-1 inline-block text-indigo-400">
                            {renderSortIndicator('status')}
                          </button>
                        </th>
                        <th className="border-b p-4 text-left text-indigo-600 font-medium">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedPayments().length > 0 ? (
                        getSortedPayments().map((payment, index) => (
                          <tr key={index} className="border-b hover:bg-indigo-50 transition-colors duration-150">
                            <td className="p-4 text-gray-700">{payment.method || "Bank Transfer"}</td>
                            <td className="p-4 text-gray-700">
                              {getCoursesForPayment(payment)}
                            </td>
                            <td className="p-4 text-gray-700">Rs.{formatCurrency(payment.amount)}</td>
                            <td className="p-4 text-gray-700">{new Date(payment.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                getStatusBadgeColor(payment.status)
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {payment.proof_path && (
                                <a 
                                  href={`/storage/${payment.proof_path}`} 
                                  target="_blank"
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-500">No payment records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Payments;