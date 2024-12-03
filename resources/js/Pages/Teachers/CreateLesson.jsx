import React from "react";

const CreateLesson = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white p-4">
      <div className="w-full max-w-4xl bg-customCream shadow-md rounded-lg px-24 py-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Create Lesson
        </h1>
        <form>
          
          <div className="grid gap-16 mb-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="title1"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Study Material Title
              </label>
              <input
                type="text"
                id="title1"
                placeholder="Enter title"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="title2"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Study Material Title
              </label>
              <input
                type="text"
                id="title2"
                placeholder="Enter title"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600">
              Upload Study Material
            </label>
            <div className="flex flex-col items-center gap-4 border-2 border-dashed border-blue-400 rounded-lg p-24 bg-blue-50">

                <svg xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="size-20 text-customOrange">
                    <path strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" 
                    />
                </svg>

              <p className="text-xl mb-2">
                Choose a file or drag & drop it here
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-white border border-blue-400 text-gray-600 rounded-lg shadow hover:bg-slate-200 "
              >
                Browse File
              </button>
            </div>
          </div>

          <div className="flex justify-between place-items-end">
            <div className="flex flex-col">
                <label
                    htmlFor="link"
                    className="block text-sm font-medium text-gray-600 mb-2"
                >
                    Link
                </label>

                <div className="flex">
                    <input
                        type="url"
                        id="link"
                        placeholder="Enter link"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        type="button"
                        className="px-4 py-2 bg-white text-white rounded-r-lg shadow hover:bg-blue-600 border border-l-0"
                    >
                        🔗
                    </button>
                </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 h-10"
            >
              Create Lesson
            </button>
          </div>
        </form>
      </div>
      <div className="">
        <button className="bg-customPeach p-4 rounded-full absolute bottom-4 right-4 flex justify-end items-end">
            <svg xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="size-7">
            <path strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15.75 19.5 8.25 12l7.5-7.5" 
            />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default CreateLesson;
