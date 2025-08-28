import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateLesson = () => {
  const { url } = usePage();
  
  // Extract course_id from URL query parameter
  const getQueryParam = (name) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(name);
  };
  
  const courseIdFromUrl = getQueryParam('course_id');

  const [formData, setFormData] = useState({
    title1: "",
    title2: "",
    file: null,
    link: "",
    course_id: courseIdFromUrl || "", // Use the course_id from URL or empty string as fallback
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [originalFileName, setOriginalFileName] = useState("");
  const MAX_CHARS = 1000;

  const notifySuccess = (message) =>
      toast.success(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressClassName: "bg-green-500",
          className: "border border-green-600 rounded-lg shadow-md",
          style: { backgroundColor: "#ebfeee" },
      });

  const notifyError = (message) =>
      toast.error(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressClassName: "bg-red-500",
          className: "border border-red-600 rounded-lg shadow-md",
          style: { backgroundColor: "#fcf0f0" },
      });

  // Update course_id when URL parameter changes
  useEffect(() => {
    if (courseIdFromUrl) {
      setFormData(prev => ({ ...prev, course_id: courseIdFromUrl }));
    }
  }, [courseIdFromUrl]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update character count for textarea
    if (name === "title2") {
      setCharCount(value.length);
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setFormData((prev) => ({ ...prev, file }));
      setFileSelected(true);
      setOriginalFileName(file.name);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setFileSelected(true);
      setOriginalFileName(file.name);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, file: null }));
    setFileSelected(false);
    setOriginalFileName("");
    document.getElementById("fileInput").value = "";
  };

  const removeLink = () => {
    setFormData((prev) => ({ ...prev, link: "" }));
  };

  const openFileDialog = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      // Map form fields to API expected fields
      data.append("material_title", formData.title1);
      data.append("material_desc", formData.title2);
      data.append("course_id", formData.course_id);
      
      // Determine material type based on what's provided
      if (formData.file && formData.link) {
        data.append("material_type", "both");
        data.append("material_path", formData.file);
        data.append("material_url", formData.link);
        data.append("material_url_title", "Link"); // Default link title
      } else if (formData.file) {
        data.append("material_type", "file");
        data.append("material_path", formData.file);
      } else if (formData.link) {
        data.append("material_type", "link");
        data.append("material_url", formData.link);
        data.append("material_url_title", "Link"); // Default link title
      } else {
        alert("Please provide either a file or a link");
        setIsSubmitting(false);
        return;
      }
      
      // Include original filename metadata
      if (formData.file && originalFileName) {
        data.append("original_filename", originalFileName);
      }
      
      // Set visibility to 1 (integer) instead of true (boolean/string)
      data.append("is_visible", 1);

      const response = await axios.post("/study-materials", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // console.log("Success:", response.data);
      // alert("Lesson created successfully!");
      
      // Reset form
      setFormData({
        title1: "",
        title2: "",
        file: null,
        link: "",
        course_id: formData.course_id, // Keep the same course ID
      });
      
      // Reset file input element and selected state
      document.getElementById("fileInput").value = "";
      setFileSelected(false);
      setCharCount(0);
      setOriginalFileName("");
      notifySuccess("Lesson created successfully!");
      setTimeout(() => {
        window.location.href = `/teacher/courses/${formData.course_id}`;
      }, 1500);
      
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Unknown error";
      notifyError("Failed to create lesson");
      alert("Failed to create lesson: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col justify-center items-center md:mt-8 bg-white p-4">
        <div className="w-full max-w-4xl bg-customCream shadow-md rounded-lg px-10 py-10">
          <div className="mb-6 flex justify-end">
            {formData.course_id && (
              <p className="text-gray-600">Course ID: {formData.course_id}</p>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 mb-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Study Material Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title1"
                  value={formData.title1}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Study Material Description
                </label>
                <div className="relative">
                  <textarea
                    name="title2"
                    value={formData.title2}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn in this lesson..."
                    rows="4"
                    maxLength={MAX_CHARS}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 bg-white bg-opacity-90 resize-none animate-pulse focus:animate-none"
                    style={{
                      backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.5))"
                    }}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {charCount}/{MAX_CHARS}
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Upload Document (PDF, DOC, PPT, etc.)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center cursor-pointer transition ${
                  dragActive ? "border-blue-600 bg-blue-50" : "border-blue-400 bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-12 text-customOrange"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                
                {fileSelected ? (
                  <div className="flex flex-col items-center mt-2">
                    <div className="flex items-center bg-white px-4 py-2 rounded-full shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-800 mr-2">{originalFileName}</span>
                      <button 
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg mb-2">Choose a file or drag & drop it here</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                      className="px-4 py-2 bg-white border border-blue-400 text-gray-600 rounded-lg shadow hover:bg-slate-200"
                    >
                      Browse File
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Link Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Add External Resource Link</label>
              <div className="flex">
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                {formData.link ? (
                  <button
                    type="button"
                    className="px-4 py-2 bg-white rounded-r-lg shadow border border-l-0 text-red-500 hover:text-red-700"
                    onClick={removeLink}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 bg-white rounded-r-lg shadow border border-l-0 text-blue-500"
                  >
                    🔗
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You can add both a file and a link, or just one of them
              </p>
            </div>

            <div className="flex justify-end items-center">
              <div className="flex gap-4">
                <a 
                  href={`/teacher/courses/${formData.course_id}`}
                  className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-400 h-10"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.course_id || (!formData.file && !formData.link)}
                  className={`px-6 py-2 ${
                    isSubmitting || !formData.course_id || (!formData.file && !formData.link) 
                      ? "bg-gray-400" 
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white font-semibold rounded-lg shadow h-10`}
                >
                  {isSubmitting ? "Creating..." : "Create Lesson"}
                </button>
              </div>
            </div>
            
            {/* Hidden input field for course_id */}
            <input 
              type="hidden" 
              name="course_id" 
              value={formData.course_id} 
            />
          </form>
        </div>
      </div>
      <ToastContainer />
    </AuthenticatedLayout>
  );
};

export default CreateLesson;