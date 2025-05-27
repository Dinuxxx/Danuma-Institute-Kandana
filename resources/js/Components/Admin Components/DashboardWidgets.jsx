import React from "react";

export default function DashboardWidgets({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((widget, index) => (
        <div
          key={index}
          className={`${widget.bgColor} rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-1`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">{widget.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{widget.value}</p>
            </div>
            <div className="text-4xl opacity-80">{widget.icon}</div>
          </div>
          
          {/* Growth indicator with real data */}
          {widget.growth !== undefined && (
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium flex items-center ${
                  widget.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={widget.growth >= 0
                      ? "M5 10l7-7m0 0l7 7m-7-7v18"
                      : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    }
                  ></path>
                </svg>
                {Math.abs(widget.growth).toFixed(1)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">vs last month</span>
            </div>
          )}
          
          {/* Progress bar for visual representation */}
          {widget.title !== "Revenue" && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    widget.title === "Teachers" ? "bg-blue-500" :
                    widget.title === "Students" ? "bg-green-500" : 
                    widget.title === "Courses" ? "bg-purple-500" : "bg-yellow-500"
                  }`} 
                  style={{ width: `${Math.min(100, Math.max(10, Math.abs(widget.growth) + 40))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}