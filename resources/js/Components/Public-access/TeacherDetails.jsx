const TeacherDetails = ({ details, onViewTimetable }) => {
    return (
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4">Teacher Details</h2>
        
        {details && details.map((detail, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 last:border-b-0 transition-all duration-300 hover:bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500 font-medium sm:w-1/3">{detail.label}:</span>
            <span className="font-semibold text-gray-800 sm:w-2/3">{detail.value}</span>
          </div>
        ))}
        
        <button
          onClick={onViewTimetable}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 self-center"
        >
          View Timetable
        </button>
      </div>
    );
  };
  
  export default TeacherDetails;