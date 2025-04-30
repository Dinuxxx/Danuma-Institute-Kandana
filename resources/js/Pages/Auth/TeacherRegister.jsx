import React, { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { route } from "ziggy-js";
import axios from "axios";

export default function TeacherRegister() {
    const [currentStep, setCurrentStep] = useState(1);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableGrades, setAvailableGrades] = useState([]);
    const [activeGradeFilter, setActiveGradeFilter] = useState("all");

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        tel_no: "",
        dob: "",
        gender: "",
        nic: "",
        qualifications: "",
        courses: [],
        name: "",
        password: "",
        password_confirmation: "",
    });

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentStep((prev) => prev + 1);
    };

    // Fetch available grades when component mounts
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get("/get-grades");
                setAvailableGrades(response.data);
            } catch (error) {
                console.error("Error fetching grades:", error);
            }
        };

        fetchGrades();
    }, []);

    // Fetch all available courses when component mounts
    useEffect(() => {
        const fetchAllCourses = async () => {
            try {
                const response = await axios.get("/all-courses");
                setAvailableCourses(response.data);
                setFilteredCourses(response.data);
            } catch (error) {
                console.error("Error fetching all courses:", error);
                notifyError("Failed to fetch available courses.");
            }
        };

        fetchAllCourses();
    }, []);

    // Filter courses based on search term and grade filter
    useEffect(() => {
        let filtered = availableCourses;

        // Apply grade filter if not 'all'
        if (activeGradeFilter !== "all") {
            filtered = filtered.filter(
                (course) => course.grade === activeGradeFilter
            );
        }

        // Apply search term if present
        if (searchTerm) {
            filtered = filtered.filter(
                (course) =>
                    course.course_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    course.subject
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    course.course_id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    }, [searchTerm, activeGradeFilter, availableCourses]);

    /*const handleAddCourse = () => {
        if (selectedCourses.length) {
            // Add selected courses to the courses list
            setCourses([...courses, ...selectedCourses]);
            setSelectedCourses([]); // Clear selected courses
            notifySuccess("Courses successfully added!");
        } else {
            notifyError("Please select at least one course.");
        }
    };*/

    const handleAddCourse = (course) => {
        // Check if course is already added
        if (!courses.some((c) => c.course_id === course.course_id)) {
            setCourses([...courses, course]);
            // Also update the selected_courses array in the form data
            setData("selected_courses", [
                ...data.selected_courses,
                course.course_id,
            ]);
            notifySuccess(`${course.course_name} added successfully!`);
        } else {
            notifyError("This course is already added.");
        }
    };

    const handleRemoveCourse = (courseId) => {
        const removedCourse = courses.find(
            (course) => course.course_id === courseId
        );
        setCourses(courses.filter((course) => course.course_id !== courseId));

        if (removedCourse) {
            notifySuccess(`${removedCourse.course_name} removed successfully.`);
        }
    };

    // Handle course selection/deselection
    const handleCourseToggle = (course) => {
        setSelectedCourses((prevSelected) => {
            // Check if course is already selected
            const isAlreadySelected = prevSelected.some(
                (c) => c.course_id === course.course_id
            );

            if (isAlreadySelected) {
                // Remove course if it's already selected
                return prevSelected.filter(
                    (c) => c.course_id !== course.course_id
                );
            } else {
                // Add course if it's not already selected
                return [...prevSelected, course];
            }
        });
    };

    // Check if course is already added to the final courses list
    const isCourseAdded = (courseId) =>
        courses.some((c) => c.course_id === courseId);

    // Generate a temporary password
    const generateTemporaryPassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";

        // Ensure at least one of each type of character
        const requiredChars = [
            charset.match(/[a-z]/)[0],
            charset.match(/[A-Z]/)[0],
            charset.match(/[0-9]/)[0],
            charset.match(/[!@#$%^&*()]/)[0],
        ];

        password += requiredChars.join("");

        // Fill the rest of the password
        for (let i = password.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        // Shuffle the password
        return password
            .split("")
            .sort(() => 0.5 - Math.random())
            .join("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Concatenate first_name and last_name to create the 'name' field
        const name = `${data.first_name} ${data.last_name}`.trim();

        // Generate a temporary password
        const generatedPassword = generateTemporaryPassword();

        // Pass course IDs instead of entire course objects
        /*const coursesToSubmit = courses.map((course) => course.course_id);*/

        const finalData = {
            ...data,
            user_type: "teacher", // Explicitly setting the user type
            courses: coursesToSubmit,
            name,
            password: generatedPassword,
            password_confirmation: generatedPassword,
        };

        setLoading(true);
        setError(null);

        try {
            console.log("Final Data being sent:", finalData);

            const response = await axios.post(
                route("teacher.register"),
                finalData
            );
            console.log("Teacher registration successful", response.data);
            reset();
            setCourses([]);
            setCurrentStep(1);
            notifySuccess("Teacher registered successfully!");
        } catch (error) {
            setError(error.message);
            console.error("Registration error:", error);
            notifyError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Validation helpers
    const validateName = (name) =>
        /^[A-Za-z][A-Za-z\s-]*$/.test(name) || name === "";
    const handleNameChange = (fieldName, value) => {
        if (validateName(value)) {
            setData(fieldName, value);
            if (errors[fieldName]) delete errors[fieldName];
        } else {
            setData(fieldName, value);
            errors[fieldName] = "Name can only contain letters.";
        }
    };

    const validateEmail = (email) =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ||
        email === "";
    const handleEmailChange = (value) => {
        if (validateEmail(value)) {
            setData("email", value);
            if (errors.email) delete errors.email;
        } else {
            setData("email", value);
            errors.email = "Please enter a valid email address.";
        }
    };

    const validatePhoneNumber = (phoneNumber) =>
        /^0\d{9}$/.test(phoneNumber) || phoneNumber === "";
    const handlePhoneNumberChange = (value) => {
        if (validatePhoneNumber(value)) {
            setData("tel_no", value);
            if (errors.tel_no) delete errors.tel_no;
        } else {
            setData("tel_no", value);
            errors.tel_no = "Invalid phone number.";
        }
    };

    const validateNIC = (nic) =>
        /^(\d{9}[vVxX]|\d{12})$/.test(nic) || nic === "";
    const handleNICChange = (value) => {
        if (validateNIC(value)) {
            setData("nic", value);
            if (errors.nic) delete errors.nic;
        } else {
            setData("nic", value);
            errors.nic =
                "Invalid NIC number. Must be 9 digits + V/X or 12 digits.";
        }
    };

    // Grade filter buttons
    const renderGradeFilterButtons = () => {
        const gradeButtons = [
            { label: "All", value: "all" },
            ...(availableGrades?.map((grade) => ({
                label: `Grade ${grade.grade}`,
                value: grade.grade,
            })) || []),
        ];

        return (
            <div className="flex flex-wrap gap-2 mb-3">
                {gradeButtons.map((button) => (
                    <button
                        key={button.value}
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                            activeGradeFilter === button.value
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setActiveGradeFilter(button.value)}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        );
    };

    // Toast notifications
    const notifySuccess = (message) =>
        toast.success(message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progressClassName: "bg-green-500",
            className: "border border-green-600 rounded-lg shadow-md",
            style: { backgroundColor: "#ebfeee" },
        });

    const notifyError = (message) =>
        toast.error(message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progressClassName: "bg-red-500",
            className: "border border-red-600 rounded-lg shadow-md",
            style: { backgroundColor: "#fcf0f0" },
        });

    return (
        <GuestLayout>
            <Head title="Teacher Registration" />
            <div className="relative mb-8 md:mb-20 h-1 bg-black w-full"></div>

            {currentStep === 1 && (
                <form onSubmit={handleNext} className="space-y-2 px-[10%]">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handleNameChange("first_name", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.first_name}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handleNameChange("last_name", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.last_name}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => handleEmailChange(e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="address" value="Address" />
                        <TextInput
                            id="address"
                            name="address"
                            value={data.address}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("address", e.target.value)}
                            required
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="tel_no" value="Phone Number" />
                        <TextInput
                            id="tel_no"
                            name="tel_no"
                            value={data.tel_no}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handlePhoneNumberChange(e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.tel_no} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="dob" value="Date of Birth" />
                        <TextInput
                            id="dob"
                            type="date"
                            name="dob"
                            value={data.dob}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("dob", e.target.value)}
                            required
                        />
                        <InputError message={errors.dob} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Gender" />
                        <div className="mt-1 flex items-center space-x-4 md:pl-10">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    checked={data.gender === "Male"}
                                    onChange={(e) =>
                                        setData("gender", e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Male
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    checked={data.gender === "Female"}
                                    onChange={(e) =>
                                        setData("gender", e.target.value)
                                    }
                                    className="mr-2"
                                />
                                Female
                            </label>
                        </div>
                        <InputError message={errors.gender} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-10 mt-5"
                            disabled={processing}
                        >
                            Next
                        </PrimaryButton>
                    </div>
                </form>
            )}

            {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-3 px-[10%]">
                    <div>
                        <InputLabel htmlFor="nic" value="NIC Number" />
                        <TextInput
                            id="nic"
                            name="nic"
                            value={data.nic}
                            className="mt-1 block w-full"
                            onChange={(e) => handleNICChange(e.target.value)}
                            required
                        />
                        <InputError message={errors.nic} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="qualifications"
                            value="Highest Qualification"
                        />
                        <TextInput
                            id="qualifications"
                            name="qualifications"
                            value={data.qualifications}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("qualifications", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.qualifications}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="course"
                            value="Add Course Modules"
                            className="mt-4"
                        />

                        {/* Search input */}
                        <div className="flex mb-2">
                            <TextInput
                                type="text"
                                placeholder="Search courses by name, subject or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Grade filter buttons */}
                        {renderGradeFilterButtons()}

                        {/* Course selection dropdown/list */}
                        <div className="border rounded-md p-2 max-h-60 overflow-y-auto bg-white">
                            {filteredCourses.length === 0 ? (
                                <p className="text-gray-500">
                                    No courses found
                                </p>
                            ) : (
                                filteredCourses.map((course) => (
                                    <div
                                        key={course.course_id}
                                        className="flex items-center justify-between p-2 border-b hover:bg-gray-50"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {course.course_name}
                                            </span>
                                            <span className="text-gray-600 ml-2">
                                                - {course.subject}
                                            </span>
                                            <div className="text-sm text-gray-500">
                                                ID: {course.course_id} | Grade:{" "}
                                                {course.grade} | Fee: $
                                                {course.monthly_fees}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`px-3 py-1 rounded-md text-white text-sm ${
                                                courses.some(
                                                    (c) =>
                                                        c.course_id ===
                                                        course.course_id
                                                )
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-green-500 hover:bg-green-600"
                                            }`}
                                            onClick={() =>
                                                handleAddCourse(course)
                                            }
                                            disabled={courses.some(
                                                (c) =>
                                                    c.course_id ===
                                                    course.course_id
                                            )}
                                        >
                                            {courses.some(
                                                (c) =>
                                                    c.course_id ===
                                                    course.course_id
                                            )
                                                ? "Added"
                                                : "Add"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <InputLabel value="Selected Course Modules" />
                        <div className="mt-2 overflow-x-auto rounded-3xl shadow-[1px_1px_5px_#3d3d3df7,1px_1px_5px#afb0b0f7] bg-white">
                            <table className="min-w-full table-auto border-collapse w-full bg-white rounded-3xl">
                                <thead>
                                    <tr>
                                        <th className="p-2">Course ID</th>
                                        <th className="p-2">Course name</th>
                                        <th className="p-2">Grade</th>
                                        <th className="p-2">Option</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="border-t p-2 text-center text-gray-500"
                                            >
                                                No courses added yet
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((course) => (
                                            <tr key={course.course_id}>
                                                <td className="border-t p-2">
                                                    {course.course_id}
                                                </td>
                                                <td className="border-t p-2">
                                                    {course.course_name}
                                                </td>
                                                <td className="border-t p-2">
                                                    {course.grade}
                                                </td>
                                                <td className="border-t p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveCourse(
                                                                course.course_id
                                                            )
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        🗑
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-10 md:mb-5 mt-5"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </PrimaryButton>
                    </div>
                </form>
            )}

            <ToastContainer />
        </GuestLayout>
    );
}
