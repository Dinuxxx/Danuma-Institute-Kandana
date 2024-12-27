import React, { useState } from "react";

const DatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date(); // Current date
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (day) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const renderDays = () => {
    const emptyDays = Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...emptyDays, ...days].map((day, index) => {
      const isToday =
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

      const isSelected =
        selectedDate &&
        day === selectedDate.getDate() &&
        currentMonth.getMonth() === selectedDate.getMonth() &&
        currentMonth.getFullYear() === selectedDate.getFullYear();

      return (
        <div
          key={index}
          className={`flex items-center justify-center rounded-full cursor-pointer md:w-30 h-10
            ${
              isToday
                ? "border-2 border-orange-500 bg-orange-500 text-white font-bold" // Highlight current date
                : ""
            }
            ${
              isSelected
                ? "border-2 border-orange-500 text-orange-500" // Light highlight for selected date
                : "text-gray-700 "
            }`}
          onClick={() => day && handleDateSelect(day)}
        >
          {day || ""}
        </div>
      );
    });
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 w-[90%] mx-[5%] pt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="text-gray-600 hover:text-gray-800 text-lg font-bold"
        >
          &lt;
        </button>
        <div className="text-xl font-semibold text-gray-800">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {currentMonth.getFullYear()}
        </div>
        <button
          onClick={handleNextMonth}
          className="text-gray-600 hover:text-gray-800 text-lg font-bold"
        >
          &gt;
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-gray-500 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  );
};

export default DatePicker;
