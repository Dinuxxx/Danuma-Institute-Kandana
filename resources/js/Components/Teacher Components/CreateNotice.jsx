import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';

const CreateNotice = ({ onNoticeCreated }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [visibilityOptions, setVisibilityOptions] = useState([]);
  const [selectedVisibility, setSelectedVisibility] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch visibility options
  useEffect(() => {
    // Fetch visibility options based on teacher's registered grades
    const fetchGrades = async () => {
        try {
            const response = await axios.get('/teacher/registered-grades');
            const options = response.data.grades;
            setVisibilityOptions(options);
            setSelectedVisibility(['All Students']); // Default selection
        } catch (error) {
            console.error('Error fetching grades:', error);
            // Fallback to default grades
            setVisibilityOptions(['All Students']);
            setSelectedVisibility(['All Students']);
        }
    };
    
    fetchGrades();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('details', details);
    
    // Convert selected visibility to expected format
    selectedVisibility.forEach(item => {
      formData.append('visibility[]', item);
    });
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    try {
      await axios.post('/teacher/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form
      setTitle("");
      setDetails("");
      setAttachment(null);
      setSelectedVisibility(['All Students']);
      
      // Notify parent component to refresh the list
      if (onNoticeCreated) {
        onNoticeCreated();
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      setError(error.response?.data?.message || "Failed to create notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = (e) => {
    const value = e.target.value;
    
    // If "All Students" is selected, clear other selections
    if (value === 'All Students') {
      setSelectedVisibility(['All Students']);
      return;
    }
    
    // If another option is selected, remove "All Students" from selection
    let updatedSelection = [...selectedVisibility];
    
    if (updatedSelection.includes(value)) {
      // Remove from selection if already selected
      updatedSelection = updatedSelection.filter(item => item !== value);
    } else {
      // Add to selection
      updatedSelection.push(value);
      // Remove "All Students" if it's in the selection
      updatedSelection = updatedSelection.filter(item => item !== 'All Students');
    }
    
    // If nothing is selected, default to "All Students"
    if (updatedSelection.length === 0) {
      updatedSelection = ['All Students'];
    }
    
    setSelectedVisibility(updatedSelection);
  };

  return (
    <div className="p-6">
      <div className="border-b text-gray-600 text-sm font-medium pb-2 w-fit mb-4">
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
            <label className="w-1/4 text-gray-700 pt-2">Visibility</label>
            <div className="w-3/4">
              <div className="grid grid-cols-3 gap-2">
                {visibilityOptions.map(option => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`visibility-${option}`}
                      value={option}
                      checked={selectedVisibility.includes(option)}
                      onChange={handleVisibilityChange}
                      className="mr-2"
                    />
                    <label htmlFor={`visibility-${option}`}>{option}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 transition shadow-sm"
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotice;