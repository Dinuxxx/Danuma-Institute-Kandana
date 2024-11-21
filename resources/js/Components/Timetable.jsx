import React from "react";
import PropTypes from "prop-types";

const Timetable = ({ columns, data, onBack }) => {
  return (
    <div className="p-4 max-w-6xl mx-auto mt-[-80px]">
      {onBack && (
        <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-3xl hover:bg-blue-600 lg:w-[100px] md:w-[80px] w-[80px] font-semibold"
          onClick={onBack}
        >
          Back
        </button>
      </div>
      )}
      <div className="overflow-x-auto rounded-tl-2xl rounded-tr-2xl">
        <table className="min-w-full border-collapse border border-gray-300 ">
          <thead>
            <tr className="bg-[#FC9C02] text-white text-left ">
              {columns.map((col, index) => (
                <th key={index} className="border border-gray-300 px-4 lg:py-3 md:py-3 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-[#FEF8F7]" : "bg-[#EBE5E5]"}>
                  {columns.map((col, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} className="border border-gray-300 px-4 py-2">
                      {row[col] || "--"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border border-gray-300 px-4 py-2 text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Timetable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  onBack: PropTypes.func,
};

export default Timetable;
