import React, { useState, useEffect } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { route } from "ziggy-js"; // Correctly import Ziggy's route helper
import axios from "axios";

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1);

    const [courses, setCourses] = useState([]);
    const [grade, setGrade] = useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = useState(null);

    //  State for available courses based on grade selection
    const [availableGrades, setAvailableGrades] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    //const [courseInput, setCourseInput] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        tel_no: "",
        dob: "",
        gender: "",
        parent_first_name: "",
        parent_last_name: "",
        parent_phone_number: "",
        relationship_to_student: "",
        grade: grade,
        grade: "",
        courses: [],
        name: "", // Add name field
        password: "", // Add password field
        password_confirmation: "", // Add password confirmation field
    });

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentStep((prev) => prev + 1);
    };

    // useEffect to fetch grades when component mounts
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get("/get-grades");
                setAvailableGrades(response.data); // Add this state variable: const [availableGrades, setAvailableGrades] = useState([]);
            } catch (error) {
                console.error("Error fetching grades:", error);
            }
        };

        fetchGrades();
    }, []);

    // NEW: Fetch courses when grade changes
    useEffect(() => {
        if (!grade) {
            setAvailableCourses([]);
            return;
        }

        const fetchCourses = async () => {
            try {
                // Call to your backend API to get courses for selected grade
                const response = await axios.get(`/courses-by-grade/${grade}`);
                setAvailableCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
                notifyError("Failed to fetch courses for this grade.");
                setAvailableCourses([]);
            }
        };

        fetchCourses();
    }, [grade]);

    const handleAddCourse = () => {
        if (selectedCourses.length && grade) {
            // Add selected courses to the courses list
            setCourses([...courses, ...selectedCourses]);
            setSelectedCourses([]); // Clear selected courses
            notifySuccess("Courses successfully added!");
        } else {
            notifyError("Please select at least one course.");
        }
    };

    /* if (courseInput.length && grade) {
            // Add each selected course separately
            const newCourses = courseInput.map((course) => ({
                id: Date.now() + Math.random(), // Unique ID for each course
                name: course,
                grade,
            }));

            setCourses([...courses, ...newCourses]);
            setCourseInput([]);
            notifySuccess("Courses successfully added!");
        } else {
            notifyError("Please provide both course and grade.");
        }
    }; */

    const handleRemoveCourse = (courseId) => {
        const removedCourse = courses.find(
            (course) => course.course_id === courseId
        );
        setCourses(courses.filter((course) => course.course_id !== courseId));

        if (removedCourse) {
            notifySuccess(`${removedCourse.course_name} removed successfully.`);
        }
    };

    /*const handleCourseChange = (course) => {
        if (courseInput.includes(course)) {
            setCourseInput(courseInput.filter((item) => item !== course));
        } else {
            setCourseInput([...courseInput, course]);
        }
    };*/

    // MODIFIED: Handle course selection/deselection
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

    const isGradeDisabled = courses.length > 0;

    /*// Helper function to check if course is already added
    const isCourseAdded = (course) => courses.some((c) => c.name === course);*/

    // MODIFIED: Check if course is already added to the final courses list
    const isCourseAdded = (courseId) =>
        courses.some((c) => c.course_id === courseId);

    // Add a utility function to generate a temporary password
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

        // Update the form data with generated name and password
        setData((prevData) => ({
            ...prevData,
            name,
            password: generatedPassword,
            password_confirmation: generatedPassword, // Add password confirmation
        }));

        // MODIFIED: Pass course IDs instead of entire course objects
        const coursesToSubmit = courses.map((course) => course.course_id);

        const finalData = {
            ...data,
            courses: coursesToSubmit, // Send only course IDs
            grade: grade,
            name, // Add the concatenated name
            password: generatedPassword, // Add the generated
            password_confirmation: generatedPassword, // Add password confirmation
        };

        setLoading(true); // Set loading state to true
        setError(null); // Clear any previous errors

        try {
            console.log("Final Data being sent:", finalData);

            const response = await axios.post(route("register"), finalData);
            console.log("Registration successful", response.data);
            reset(); // Reset form fields
            setCourses([]); // Clear selected courses
            setGrade(""); // Reset grade
            setCurrentStep(1); // Return to first step
            notifySuccess("Student registered successfully!");
        } catch (error) {
            setError(error.message); // Set the error message
            console.error("Registration error:", error);
            notifyError("Registration failed. Please try again.");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

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
    const handlePhoneNumberChange = (fieldName, value) => {
        if (validatePhoneNumber(value)) {
            setData(fieldName, value);
            if (errors[fieldName]) delete errors[fieldName];
        } else {
            setData(fieldName, value);
            errors[fieldName] = "Invalid phone number.";
        }
    };

    const validateGrade = (grade) =>
        /^(?:[6-9]|10|11|A\/L)$/i.test(grade) || grade === "";
    const handleGradeChange = (value) => {
        if (validateGrade(value)) {
            setGrade(value);
            if (errors.grade) delete errors.grade;
        } else {
            setGrade(value);
            errors.grade = "Grade must be between 6-11 or 'A/L'.";
        }
    };

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
            <Head title="Register" />
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
                                handlePhoneNumberChange(
                                    "tel_no",
                                    e.target.value
                                )
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
                            value={data.dateOfBirth}
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
                <form onSubmit={handleNext} className="space-y-3 px-[10%]">
                    {/* Second Part of the Form */}
                    <div>
                        <InputLabel
                            htmlFor="parent_first_name"
                            value="Parent First Name"
                        />
                        <TextInput
                            id="parent_first_name"
                            name="parent_first_name"
                            value={data.parent_first_name}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handleNameChange(
                                    "parent_first_name",
                                    e.target.value
                                )
                            }
                            required
                        />
                        <InputError
                            message={errors.parent_first_name}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="parent_last_name"
                            value="Parent Second Name"
                        />
                        <TextInput
                            id="parent_last_name"
                            name="parent_last_name"
                            value={data.parent_last_name}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handleNameChange(
                                    "parent_last_name",
                                    e.target.value
                                )
                            }
                            required
                        />
                        <InputError
                            message={errors.parent_last_name}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="parent_phone_number"
                            value="Parent Phone Number"
                        />
                        <TextInput
                            id="parent_phone_number"
                            name="parent_phone_number"
                            value={data.parent_phone_number}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                handlePhoneNumberChange(
                                    "parent_phone_number",
                                    e.target.value
                                )
                            }
                            required
                        />
                        <InputError
                            message={errors.parent_phone_number}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="relationship_to_student"
                            value="Relationship to Student"
                        />
                        <TextInput
                            id="relationship_to_student"
                            name="relationship_to_student"
                            value={data.relationship_to_student}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData(
                                    "relationship_to_student",
                                    e.target.value
                                )
                            }
                            required
                        />
                        <InputError
                            message={errors.relationship_to_student}
                            className="mt-2"
                        />
                    </div>
                    <div className="flex justify-center ">
                        <PrimaryButton
                            type="submit"
                            className="bg-orange-500 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-20 md:mb-5 mt-5"
                        >
                            Next
                        </PrimaryButton>
                    </div>
                </form>
            )}

            {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4 px-[8%]">
                    {/* Third Part of the Form */}
                    <div>
                        <InputLabel htmlFor="grade" value="Grade" />
                        <select
                            id="grade"
                            name="grade"
                            value={grade}
                            className={`mt-1 block w-full border rounded-md p-2 ${
                                isGradeDisabled
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={isGradeDisabled}
                            required
                        >
                            <option value="" disabled>
                                Select Grade
                            </option>
                            {availableGrades.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>

                        <InputLabel
                            htmlFor="course"
                            value="Add a Course"
                            className="md:mt-2"
                        />
                        <div className="flex space-x-2">
                            <div className="w-full">
                                {/* MODIFIED: Display courses from database instead of hardcoded values */}
                                <div className="border rounded-md p-2">
                                    {availableCourses.length === 0 &&
                                        !grade && (
                                            <p className="text-gray-500">
                                                Please select a grade first
                                            </p>
                                        )}
                                    {availableCourses.length === 0 && grade && (
                                        <p className="text-gray-500">
                                            No courses available for this grade
                                        </p>
                                    )}
                                    {availableCourses.map((course) => (
                                        <div
                                            key={course.course_id}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                id={course.course_id}
                                                checked={selectedCourses.some(
                                                    (c) =>
                                                        c.course_id ===
                                                        course.course_id
                                                )}
                                                onChange={() =>
                                                    handleCourseToggle(course)
                                                }
                                                disabled={isCourseAdded(
                                                    course.course_id
                                                )}
                                                className={`${
                                                    isCourseAdded(
                                                        course.course_id
                                                    )
                                                        ? "cursor-not-allowed opacity-50"
                                                        : ""
                                                }`}
                                            />
                                            <label
                                                htmlFor={course.course_id}
                                                className={`ml-2 ${
                                                    isCourseAdded(
                                                        course.course_id
                                                    )
                                                        ? "text-gray-400"
                                                        : ""
                                                }`}
                                            >
                                                {course.course_name} (
                                                {course.course_id})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="bg-gray-400 hover:bg-gray-500 text-black font-semibold rounded-md px-8 py-2"
                                onClick={handleAddCourse}
                                disabled={
                                    !grade || selectedCourses.length === 0
                                }
                            >
                                Add
                            </button>
                        </div>

                        <div className="pt-10">
                            <InputLabel value="Added Courses" />
                            <div className="mt-2 overflow-x-auto rounded-3xl shadow-[1px_1px_5px_#3d3d3df7,1px_1px_5px#afb0b0f7] bg-white">
                                <table className="min-w-full table-auto border-collapse w-full bg-white rounded-3xl">
                                    <thead>
                                        <tr>
                                            <th className="p-2">Course ID</th>
                                            <th className="p-2">Course Name</th>
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
