import React from 'react';

const TeacherCard = ({ name, image }) => {
    return (
        <div className="flex flex-col items-center border rounded-lg p-4 border-none w-full max-w-sm items-center justify-center text-center">
            <div className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <svg
                        className="w-16 h-16 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                    </svg>
                )}
            </div>
            <p className="mt-4 text-xl font-semibold">{name}</p>
            <hr className="w-full border-black mt-2" />
        </div>
    );
};

export default TeacherCard;
