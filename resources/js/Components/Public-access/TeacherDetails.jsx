import React from 'react';

const TeacherDetails = ({ details }) => {
    return (
        <div className="flex flex-col gap-4 border-none rounded-lg  p-4 w-full max-w-lg">
            <h2 className="text-xl font-semibold md:pl-10">Other Details</h2>
            {details.map((detail, index) => (
                <div key={index} className="flex items-center">
                    <span className="text-gray-600 md:text-lg">{detail.label}:</span>
                    <span className="ml-2 font-medium md:text-lg">{detail.value}</span>
                </div>
            ))}
            <button className="xl:w-1/4 md:w-1/2 mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-3xl hover:bg-blue-600 ">
                Timetable
            </button>
        </div>
    );
};

export default TeacherDetails;
