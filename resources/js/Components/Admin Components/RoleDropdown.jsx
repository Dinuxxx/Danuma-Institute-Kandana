import { useState } from "react";
import { Link } from "@inertiajs/react";

function RoleDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("ADD new User");

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (role) => {
        setSelected(role);
        setIsOpen(false);
    };

    // Define proper routes for each user type
    const roleRoutes = {
        Admin: "admin/register",
        Teacher: "teacher/register",
        Student: "student/register",
    };

    return (
        <div className="relative inline-block w-48">
            <button
                onClick={toggleDropdown}
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex justify-between items-center"
            >
                {selected}
                <span
                    className={`transform transition-transform ${
                        isOpen ? "rotate-180" : "rotate-0"
                    }`}
                >
                    ⏷
                </span>
            </button>
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg mt-1">
                    {["Admin", "Teacher", "Student"].map((option) => (
                        <li
                            key={option}
                            //onClick={() => handleSelect(option)}
                            className="px-4 hover:bg-blue-200 cursor-pointer hover:font-bold"
                        >
                            <Link
                                href={roleRoutes[option]}
                                className="w-full block py-2 px-4 hover:bg-blue-200 cursor-pointer"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default RoleDropdown;
