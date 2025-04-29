import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsX, BsPencilSquare, BsCheck2 } from "react-icons/bs";
import { FaUserTie, FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";

const UserEditModal = ({ userId, onClose, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    tel_no: "",
    address: "",
    email: "",
    role: ""
  });
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (id) => {
    setLoading(true);
    try {
      // Fetch basic user information
      const response = await axios.get(`/admin/users/${id}`);
      setUser(response.data.user);
      
      // Set form data from response
      setFormData({
        title: response.data.user.title || "",
        first_name: response.data.user.first_name || "",
        last_name: response.data.user.last_name || "",
        gender: response.data.user.gender || "",
        dob: response.data.user.dob || "",
        tel_no: response.data.user.tel_no || "",
        address: response.data.user.address || "",
        email: response.data.user.email || "",
        role: response.data.user.role || ""
      });

      // Fetch role-specific data
      const role = response.data.user.role;
      if (role === "admin") {
        const adminData = await axios.get(`/admin/users/${id}/admin-details`);
        setRoleSpecificData(adminData.data);
      } else if (role === "teacher") {
        const teacherData = await axios.get(`/admin/users/${id}/teacher-details`);
        setRoleSpecificData(teacherData.data);
      } else if (role === "student") {
        const studentData = await axios.get(`/admin/users/${id}/student-details`);
        setRoleSpecificData(studentData.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put(`/admin/users/${userId}`, formData);
      setSaving(false);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setSaving(false);
    }
  };

  // Function to render role-specific content
  const renderRoleSpecificContent = () => {
    if (!user || !roleSpecificData) return null;

    switch (user.role) {
      case "admin":
        return (
          <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
            <div className="flex items-center mb-4">
              <FaUserTie className="text-blue-600 text-3xl mr-3" />
              <h3 className="text-xl font-semibold text-blue-800">Admin Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">NIC</label>
                <p className="font-medium">{roleSpecificData.nic || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Salary</label>
                <p className="font-medium">${roleSpecificData.salary || "0"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Administrative Access</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {roleSpecificData.modules?.map((module, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {module.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case "teacher":
        return (
          <div className="bg-green-50 p-6 rounded-lg shadow-inner">
            <div className="flex items-center mb-4">
              <FaChalkboardTeacher className="text-green-600 text-3xl mr-3" />
              <h3 className="text-xl font-semibold text-green-800">Teacher Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">NIC</label>
                <p className="font-medium">{roleSpecificData.nic || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Salary</label>
                <p className="font-medium">${roleSpecificData.salary || "0"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Qualifications</label>
                <p className="font-medium">{roleSpecificData.qualifications || "Not provided"}</p>
              </div>
              
              {roleSpecificData.courses && roleSpecificData.courses.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Courses</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {roleSpecificData.courses.map((course, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-700">{course.course_name}</h4>
                        <p className="text-sm text-gray-600">Grade {course.grade} - {course.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case "student":
        return (
          <div className="bg-purple-50 p-6 rounded-lg shadow-inner">
            <div className="flex items-center mb-4">
              <FaGraduationCap className="text-purple-600 text-3xl mr-3" />
              <h3 className="text-xl font-semibold text-purple-800">Student Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Grade</label>
                <p className="font-medium">{roleSpecificData.grade || "Not assigned"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">QR ID</label>
                <p className="font-medium">{roleSpecificData.QR_id || "Not assigned"}</p>
              </div>
              
              {roleSpecificData.parent && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Parent Information</label>
                  <div className="bg-white p-3 rounded-lg border border-purple-200 mt-1">
                    <p className="font-medium">{roleSpecificData.parent.parent_first_name} {roleSpecificData.parent.parent_last_name}</p>
                    <p className="text-sm text-gray-600">{roleSpecificData.parent.relationship_type}</p>
                    <p className="text-sm text-gray-600">{roleSpecificData.parent.parent_phone_number}</p>
                  </div>
                </div>
              )}
              
              {roleSpecificData.courses && roleSpecificData.courses.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Enrolled Courses</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {roleSpecificData.courses.map((course, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-700">{course.course_name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">{course.subject}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            course.pivot.status === 'active' ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.pivot.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return <div className="p-4 bg-gray-50 rounded">No role-specific information available</div>;
    }
  };

  const getRoleIcon = () => {
    if (!user) return null;
    
    switch (user.role) {
      case "admin":
        return <FaUserTie className="text-blue-600" />;
      case "teacher":
        return <FaChalkboardTeacher className="text-green-600" />;
      case "student":
        return <FaGraduationCap className="text-purple-600" />;
      default:
        return <BsPencilSquare className="text-gray-600" />;
    }
  };

  const getRoleColor = () => {
    if (!user) return "bg-gray-100";
    
    switch (user.role) {
      case "admin":
        return "bg-blue-600";
      case "teacher":
        return "bg-green-600";
      case "student":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all scale-100 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all scale-100 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className={`${getRoleColor()} h-16 md:h-24`}></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <BsX className="text-gray-700 text-xl" />
          </button>
          
          <div className="flex px-6 -mt-8 md:-mt-12 items-end pb-4">
            <div className={`${getRoleColor()} text-white rounded-full p-4 shadow-lg mr-4`}>
              <div className="text-3xl">
                {getRoleIcon()}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || "User Details"}</h2>
              <p className="text-gray-600 capitalize">{user?.role || "User"}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 border-b">
          <div className="flex space-x-6">
            <button
              className={`py-3 px-1 font-medium ${
                activeTab === "personal" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("personal")}
            >
              Personal Information
            </button>
            <button
              className={`py-3 px-1 font-medium ${
                activeTab === "role" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("role")}
            >
              Role Details
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {activeTab === "personal" ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="tel_no"
                    value={formData.tel_no}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </form>
          ) : (
            renderRoleSpecificContent()
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {activeTab === "personal" && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <BsCheck2 className="mr-1" /> Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;