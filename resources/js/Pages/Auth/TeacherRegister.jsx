import React, { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { route } from "ziggy-js";
import axios from "axios";

export default function TeacherRegister() {
    const [currentStep, setCurrentStep] = useState(1);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableGrades, setAvailableGrades] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Fetch available courses for teacher registration
    useEffect(() => {
        const fetchAvailableCourses = async () => {
            setCoursesLoading(true);
            try {
                // Try the specific endpoint first
                const response = await axios.get("/teacher/available-courses");
                setAvailableCourses(response.data);
            } catch (error) {
                console.error("Error fetching available courses:", error);

                // Fallback to all courses endpoint
                try {
                    console.log("Trying fallback endpoint: /all-courses");
                    const fallbackResponse = await axios.get("/all-courses");
                    setAvailableCourses(fallbackResponse.data);
                    notifySuccess("Courses loaded successfully!");
                } catch (fallbackError) {
                    console.error(
                        "Error fetching fallback courses:",
                        fallbackError
                    );

                    // Try another common endpoint pattern
                    try {
                        console.log("Trying alternative endpoint: /courses");
                        const altResponse = await axios.get("/courses");
                        setAvailableCourses(altResponse.data);
                        notifySuccess("Courses loaded successfully!");
                    } catch (altError) {
                        console.error(
                            "Error fetching alternative courses:",
                            altError
                        );
                        notifyError(
                            "Failed to fetch courses. Please contact administrator."
                        );
                        setAvailableCourses([]);
                    }
                }
            } finally {
                setCoursesLoading(false);
            }
        };

        fetchAvailableCourses();
    }, []);

    const handleAddCourse = () => {
        if (selectedCourses.length) {
            // Add selected courses to the courses list
            setCourses([...courses, ...selectedCourses]);
            setSelectedCourses([]); // Clear selected courses
            notifySuccess("Courses successfully added!");
        } else {
            notifyError("Please select at least one course.");
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

    // Helper function for grade colors
    const getGradeColor = (grade) => {
        const gradeNum = parseInt(grade);
        if (gradeNum <= 5) return "bg-blue-100 text-blue-800";
        if (gradeNum <= 8) return "bg-green-100 text-green-800";
        if (gradeNum <= 11) return "bg-yellow-100 text-yellow-800";
        return "bg-purple-100 text-purple-800";
    };

    // Filter courses based on search term
    const filteredCourses = availableCourses.filter(
        (course) =>
            course.course_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            course.grade?.toString().includes(searchTerm)
    );

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

        if (courses.length === 0) {
            notifyError("Please add at least one course before registering.");
            return;
        }

        const temporaryPassword = generateTemporaryPassword();

        const finalData = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email.trim().toLowerCase(), // Ensure email is clean
            address: data.address,
            tel_no: data.tel_no,
            dob: data.dob,
            gender: data.gender,
            nic: data.nic,
            qualifications: data.qualifications,
            courses: courses.map((course) => course.course_id),
            name: `${data.first_name} ${data.last_name}`.trim(),
            password: temporaryPassword,
            password_confirmation: temporaryPassword,
            role: "teacher", // Explicitly specify role
        };

        console.log("Submitting data:", finalData); // Debug log
        console.log("Courses being submitted:", courses); // Debug log for courses

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                route("teacher.register"),
                finalData
            );

            if (response.data.status === "success") {
                notifySuccess(
                    "Teacher registered successfully! Verification email has been sent."
                );
                // notifySuccess(`Temporary password: ${temporaryPassword}`);

                // Clear form and reset state
                reset();
                setCourses([]);
                setCurrentStep(1);
            }
        } catch (error) {
            console.error("Registration error:", error);

            // Handle specific validation errors
            if (error.response?.status === 422) {
                const errorData = error.response.data;
                console.log("Validation errors:", errorData);

                if (errorData.errors) {
                    // Display specific field errors
                    Object.keys(errorData.errors).forEach((field) => {
                        const fieldErrors = errorData.errors[field];
                        fieldErrors.forEach((errorMsg) => {
                            notifyError(`${field}: ${errorMsg}`);
                        });
                    });
                } else {
                    notifyError(
                        errorData.message ||
                            "Validation failed. Please check your input."
                    );
                }
            } else if (error.response?.status === 400) {
                // Handle other types of errors
                const errorData = error.response.data;
                console.log("Error response:", errorData);
                notifyError(
                    errorData.message ||
                        "Registration failed. Please try again."
                );
            } else {
                notifyError(
                    error.response?.data?.message ||
                        "Registration failed. Please try again."
                );
            }
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
        const cleanEmail = value.trim().toLowerCase();
        if (validateEmail(cleanEmail)) {
            setData("email", cleanEmail);
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
            autoClose: 5000, // Longer duration for errors
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

                    {/* Enhanced Course Selection Section */}
                    <div className="space-y-6">
                        {/* Course Selection Section */}
                        <div>
                            <InputLabel
                                htmlFor="course"
                                value="📚 Add Course Modules"
                                className="mt-4 font-semibold"
                            />

                            {coursesLoading && (
                                <div className="text-center text-gray-500 py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                    Loading courses...
                                </div>
                            )}

                            {!coursesLoading &&
                                availableCourses.length === 0 && (
                                    <div className="text-center text-red-500 py-4 border border-red-200 rounded-lg bg-red-50">
                                        ⚠️ No courses available. Please contact
                                        the administrator.
                                    </div>
                                )}

                            {!coursesLoading && availableCourses.length > 0 && (
                                <>
                                    {/* Dropdown Container */}
                                    <div className="relative mt-1">
                                        <div
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:border-orange-300 transition-colors cursor-pointer"
                                            onClick={() =>
                                                setIsDropdownOpen(
                                                    !isDropdownOpen
                                                )
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-500">
                                                        ➕
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {selectedCourses.length >
                                                        0
                                                            ? `${selectedCourses.length} course(s) selected`
                                                            : "Select courses to add"}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-gray-400 transition-transform ${
                                                        isDropdownOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                >
                                                    ⬇️
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                                                {/* Search Bar */}
                                                <div className="p-3 border-b border-gray-100">
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 Search courses or grades..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Course List */}
                                                <div className="max-h-64 overflow-y-auto">
                                                    {filteredCourses.length ===
                                                    0 ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            {searchTerm
                                                                ? "No courses match your search"
                                                                : "No available courses"}
                                                        </div>
                                                    ) : (
                                                        filteredCourses.map(
                                                            (course) => (
                                                                <div
                                                                    key={
                                                                        course.course_id
                                                                    }
                                                                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                                        isCourseAdded(
                                                                            course.course_id
                                                                        )
                                                                            ? "opacity-50 cursor-not-allowed"
                                                                            : "cursor-pointer"
                                                                    }`}
                                                                >
                                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedCourses.some(
                                                                                (
                                                                                    c
                                                                                ) =>
                                                                                    c.course_id ===
                                                                                    course.course_id
                                                                            )}
                                                                            onChange={() =>
                                                                                handleCourseToggle(
                                                                                    course
                                                                                )
                                                                            }
                                                                            disabled={isCourseAdded(
                                                                                course.course_id
                                                                            )}
                                                                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-300"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="font-medium text-gray-900">
                                                                                        {
                                                                                            course.course_name
                                                                                        }
                                                                                    </span>
                                                                                    <span
                                                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(
                                                                                            course.grade
                                                                                        )}`}
                                                                                    >
                                                                                        Grade{" "}
                                                                                        {
                                                                                            course.grade
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center text-sm text-gray-600">
                                                                                    <span className="mr-1">
                                                                                        💰
                                                                                    </span>
                                                                                    Rs.{" "}
                                                                                    {course.monthly_fees ||
                                                                                        "N/A"}
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-sm text-gray-500 mt-1">
                                                                                Course
                                                                                ID:{" "}
                                                                                <span className="font-mono">
                                                                                    {course.course_id.split('_')[0]}
                                                                                </span>
                                                                                {isCourseAdded(
                                                                                    course.course_id
                                                                                ) && (
                                                                                    <span className="ml-2 text-orange-600 font-medium">
                                                                                        Already
                                                                                        Added
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            )
                                                        )
                                                    )}
                                                </div>

                                                {/* Add Button */}
                                                {selectedCourses.length > 0 && (
                                                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAddCourse();
                                                                setIsDropdownOpen(
                                                                    false
                                                                );
                                                                setSearchTerm(
                                                                    ""
                                                                );
                                                            }}
                                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                                        >
                                                            <span>➕</span>
                                                            <span>
                                                                Add{" "}
                                                                {
                                                                    selectedCourses.length
                                                                }{" "}
                                                                Course(s)
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Selected Courses Table */}
                        <div className="pt-6">
                            <InputLabel
                                value="🏆 Course Modules"
                                className="font-semibold"
                            />

                            <div className="mt-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {courses.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-6xl mb-3">📚</div>
                                        <p className="text-gray-500 font-medium">
                                            No courses added yet
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Select courses from the dropdown
                                            above to get started
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Course Details
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Grade
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Monthly Fee
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Teacher
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {courses.map(
                                                    (course, index) => (
                                                        <tr
                                                            key={
                                                                course.course_id
                                                            }
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {
                                                                            course.course_name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        ID:{" "}
                                                                        <span className="font-mono">
                                                                            {course.course_id.split('_')[0]}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(
                                                                        course.grade
                                                                    )}`}
                                                                >
                                                                    Grade{" "}
                                                                    {
                                                                        course.grade
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center text-gray-900 font-medium">
                                                                    <span className="mr-1">
                                                                        💰
                                                                    </span>
                                                                    Rs.{" "}
                                                                    {course.monthly_fees ||
                                                                        "N/A"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-600">
                                                                    {course.teacher_name || "No Teacher"}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveCourse(
                                                                            course.course_id
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    title="Remove course"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {courses.length === 0 && (
                                <p className="text-center text-red-500 text-sm mt-3 flex items-center justify-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Please add at least one course to proceed
                                    with registration.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-10 md:mb-5 mt-5"
                            disabled={loading || courses.length === 0}
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
