import React from 'react'

const DashboardWidgets = ({ data }) => {
  const colors = ["bg-red-500", "bg-purple-500", "bg-green-500", "bg-yellow-500"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 ">
      {data.map((item, index) => (
        <div
          key={index}
          className={`${colors[index]} text-white p-4 rounded-lg shadow-md flex flex-col justify-between`}
        >
          <div className="text-2xl font-medium">{item.title}</div>
          <div className="text-5xl font-bold mt-2 text-right">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardWidgets