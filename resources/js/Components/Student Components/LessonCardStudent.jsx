import React from 'react';

const LessonCardStudent = ({ studyMaterial }) => {
  if (!studyMaterial) return null;

  return (
    <div className="p-4 bg-customCream rounded-lg shadow-md border border-gray-200 mt-4">
      <h1 className="text-customOrange font-semibold mb-2 text-2xl">{studyMaterial.material_title}</h1>
      
      {/* URL Link */}
      {studyMaterial.material_url && (
        <div className="flex gap-4 items-center mb-2 bg-blue-100 rounded-lg px-2">
          <div className="flex items-center justify-center w-10 h-14 text-blue-600 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          <a 
            href={studyMaterial.material_url} 
            className="text-blue-600 hover:text-blue-800 text-lg"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {studyMaterial.material_url_title || 'Link'}
          </a>
        </div>
      )}
      
      {/* File Download */}
      {studyMaterial.material_path && (
        <div className="flex gap-4 items-center bg-blue-100 rounded-lg px-2">
          <div className="flex items-center justify-center w-10 h-14 text-blue-600 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 text-lg"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/download-material/${studyMaterial.material_id}`;
              }}
            >
              {studyMaterial.original_filename || 'Download File'}
            </a>
          </div>
          <div className="ml-auto flex items-center justify-center w-10 h-10 text-blue-600 rounded">
            <a 
              href={`/download-material/${studyMaterial.material_id}`} 
              download
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
      {studyMaterial.material_desc && (
        <p className="text-gray-600 mt-3 text-md">{studyMaterial.material_desc}</p>
      )}
    </div>
  );
};

export default LessonCardStudent;