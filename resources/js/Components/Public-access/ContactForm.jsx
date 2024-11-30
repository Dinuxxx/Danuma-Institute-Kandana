import React from 'react';

const ContactForm = () => {
  return (
    <div className="p-6 bg-white rounded-lg max-w-lg lg:mx-auto md:w-1/2">
      <form>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter Name"
            className="w-full lg:w-2/3  border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full lg:w-2/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="tel"
            placeholder="Telephone"
            className="w-full lg:w-2/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-8">
          <textarea
            placeholder="Enter message"
            rows="4"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-1/3 md:w-3/5 lg:w-1/3 bg-blue-500 text-white py-[11px] lg:py-[9px] px-4 font-bold text-sm md:text-md lg:text-lg rounded-3xl hover:bg-blue-600 shadow-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
