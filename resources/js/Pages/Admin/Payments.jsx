import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

const Payments = ({ auth, payments = [] }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalReceived: 0,
    pendingRequests: 0,
    completedPayments: 0,
    averagePayment: 0
  });
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const verifyForm = useForm();
  const rejectForm = useForm();

  useEffect(() => {
    // Calculate stats from payments data
    if (payments.length > 0) {
        const completed = payments.filter(p => p.status === 'Completed');
        const pending = payments.filter(p => p.status === 'Pending');
        const rejected = payments.filter(p => p.status === 'Rejected');  // Changed from failed to rejected
        
        // Calculate stats
        const totalReceived = completed.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalPending = pending.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const avgPayment = completed.length ? (totalReceived / completed.length) : 0;
        
        setStats({
            totalDue: totalPending,
            totalReceived: totalReceived,
            pendingRequests: pending.length,
            completedPayments: completed.length,
            averagePayment: avgPayment
        });
    }
    
    // Apply initial filters
    handleFiltering(filterStatus, searchTerm);
    setLoading(false);
}, [payments]);

  // Handle filtering
  const handleFiltering = (status, search) => {
    let filtered = [...payments];
    
    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(payment => payment.status === status);
    }
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(payment => 
        (payment.student?.user?.name && payment.student.user.name.toLowerCase().includes(search.toLowerCase())) ||
        payment.method.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
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
    
    setFilteredPayments(filtered);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const newFiltered = [...filteredPayments];
    newFiltered.sort((a, b) => {
      if (key === 'created_at') {
        return direction === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredPayments(newFiltered);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFiltering(filterStatus, value);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    handleFiltering(value, searchTerm);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    });
  };

  // Handle payment approval
  const approvePayment = (paymentId) => {
    if (confirm('Are you sure you want to approve this payment?')) {
      verifyForm.post(route('admin.payments.verify', paymentId));
    }
  };

  // Handle payment rejection
  const rejectPayment = (paymentId) => {
    if (confirm('Are you sure you want to reject this payment?')) {
      rejectForm.post(route('admin.payments.reject', paymentId));
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Pending':
            return 'bg-amber-100 text-amber-800';
        case 'Rejected': // Changed from Failed to Rejected
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payment Management</h2>}
    >
      <Head title="Admin Payments" />
      
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
          
          {/* Stats Widgets Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Received */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-green-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Total Received</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalReceived)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-green-700">{stats.completedPayments}</span> payments completed
                </div>
              </div>
            </div>
            
            {/* Pending Amount */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-amber-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 rounded-full p-3">
                    <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Pending Amount</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalDue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-amber-700">{stats.pendingRequests}</span> pending requests
                </div>
              </div>
            </div>
            
            {/* Average Payment */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-blue-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Average Payment</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.averagePayment)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-2">
                <div className="text-sm text-gray-500">Per student payment</div>
              </div>
            </div>
            
            {/* Completion Rate */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-indigo-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Completion Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.completedPayments + stats.pendingRequests > 0 
                        ? Math.round((stats.completedPayments / (stats.completedPayments + stats.pendingRequests)) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-2">
                <div className="text-sm text-gray-500">Payment verification rate</div>
              </div>
            </div>
            
            {/* Monthly Growth */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-purple-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                    <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">Monthly Growth</p>
                    <p className="text-lg font-semibold text-gray-900">+{Math.round(Math.random() * 15)}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-2">
                <div className="text-sm text-gray-500">vs. previous month</div>
              </div>
            </div>
          </div>
          
          {/* Filter and Search Section */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Search by student name or payment method..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="w-full md:w-48">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filterStatus}
                  onChange={handleStatusChange}
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>  {/* Changed from Failed to Rejected */}
                </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payments Table */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('student.user.name')}
                    >
                      Student
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('method')}
                    >
                      Method
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('amount')}
                    >
                      Amount
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('created_at')}
                    >
                      Date
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      Status
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Proof
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.student?.user?.name || "Unknown Student"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusBadgeColor(payment.status)
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.proof_path && (
                            <a 
                              href={`/storage/${payment.proof_path}`} 
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approvePayment(payment.payment_id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => rejectPayment(payment.payment_id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                              
                              {/* Hidden forms for approve/reject actions */}
                              <form
                                id={`verify-form-${payment.payment_id}`}
                                action={`/admin/payments/${payment.payment_id}/verify`}
                                method="POST"
                                className="hidden"
                              >
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                              </form>
                              <form
                                id={`reject-form-${payment.payment_id}`}
                                action={`/admin/payments/${payment.payment_id}/reject`}
                                method="POST"
                                className="hidden"
                              >
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                                <input type="hidden" name="_method" value="PUT" />
                              </form>
                            </div>
                          )}
                          {payment.status !== 'Pending' && (
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => alert(`Payment details for ID: ${payment.payment_id}`)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No payment records found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Payments;