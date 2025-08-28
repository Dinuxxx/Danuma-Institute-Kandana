import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateNotice = ({ onNoticeCreated }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [visibility, setVisibility] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVisibilityChange = (option) => {
    // Toggle the selected option (add or remove)
    setVisibility(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (visibility.length === 0) {
      setError("Please select at least one visibility option");
      setLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('details', details);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    // Add each visibility item separately
    visibility.forEach(item => {
      formData.append('visibility[]', item);
    });
    
    try {
      await axios.post('/admin/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form
      setTitle("");
      setDetails("");
      setAttachment(null);
      setVisibility([]);
      
      // Notify parent component to refresh the list
      if (onNoticeCreated) {
        onNoticeCreated();
      }
      notifySuccess("Notice created successfully!");
    } catch (error) {
      console.error('Error creating notice:', error);
      setError(error.response?.data?.message || "Failed to create notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="border-b text-orange-500 text-sm font-medium pb-2 w-fit mb-4">
        Create Notice
      </div>
      <div className="p-6 bg-gray-200 rounded-xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:px-36">
          <div className="flex items-center gap-4">
            <label className="w-1/4 text-gray-700">Notice Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-3/4 p-2 border rounded bg-white"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-1/4 text-gray-700">Notice Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-3/4 p-2 border rounded bg-white"
              rows="2"
              required
            ></textarea>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-1/4 text-gray-700">Attachment</label>
            <div className="flex items-center">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition">
                <FaUpload /> Upload
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {attachment && (
                <span className="ml-2 text-sm text-gray-600">{attachment.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <label className="w-1/4 text-gray-700">Visibility</label>
            <div className="w-3/4 flex flex-col gap-2 bg-white p-3 rounded-lg shadow-sm">
              {['Students', 'Teachers'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    value={option}
                    checked={visibility.includes(option)}
                    onChange={() => handleVisibilityChange(option)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="text-white bg-blue-600 font-bold p-2 rounded-md flex items-center justify-center px-2 py-2"
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateNotice;