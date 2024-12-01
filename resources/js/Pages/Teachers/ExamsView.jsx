import Exams from '@/Components/Teacher Components/Exams';
import React, { useState } from 'react'

const ExamsView = () => {
  const [activeTab, setActiveTab] = useState('exams');

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
        <div className='flex gap-4 relative w-1/4'>
            {["Exams", "Student Performance"].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-lg w-1/2 ${
                activeTab === tab ? "text-blue-500 font-semibold" : "text-gray-500"
                }`}
            >
                {tab}
            </button>
            ))}
            <div
                className={`absolute bottom-0 h-1 bg-blue-500 transition-all duration-300`}
                style={{
                    width: "50%",
                    transform: activeTab === "Exams" ? "translateX(0%)" : "translateX(100%)",
                }}
            />
        </div>
        
        {activeTab === "Exams" ? (
            <div>
                <Exams/>
            </div>
        ) : (
            <div>
                
            </div>
        )
        }
    </div>
  )
}

export default ExamsView
