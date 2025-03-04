import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

const CreateNotice = ({ onNoticeCreated }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [visibility, setVisibility] = useState([]);

  const handleVisibilityChange = (option) => {
    if (option === "All") {
      setVisibility((prev) =>
        prev.includes("All") ? [] : ["All", "Students", "Teachers"]
      );
    } else {
      setVisibility((prev) => {
        const newVisibility = prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option];
        return newVisibility.includes("Students") && newVisibility.includes("Teachers")
          ? ["All", ...newVisibility]
          : newVisibility.filter((item) => item !== "All");
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotice = {
      title,
      details,
      attachment: attachment ? attachment.name : "",
      visibility,
    };
    onNoticeCreated(newNotice);
    setTitle("");
    setDetails("");
    setAttachment(null);
    setVisibility([]);
  };

  return (
    <div className="p-6">
      <div className="border-b text-gray-600 text-sm font-medium pb-2 w-fit mb-4">
        Create Notice
      </div>
      <div className="p-6 bg-gray-200 rounded-xl">
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
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">
              <FaUpload /> Upload
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-start gap-4">
            <label className="w-1/4 text-gray-700">Visibility</label>
            <div className="w-1/4 flex flex-col gap-2 bg-gray-300 p-2 rounded-lg">
              {['All', 'Students', 'Teachers'].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={option}
                    checked={visibility.includes(option)}
                    onChange={() => handleVisibilityChange(option)}
                    className="w-4 h-4"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotice;