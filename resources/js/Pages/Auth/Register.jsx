import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import route from "ziggy-js"; // Import the Ziggy route helper
import { route } from "ziggy-js"; // Correctly import Ziggy's route helper
import axios from "axios";

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1); 
    const [courses, setCourses] = useState([]); 
    const [courseInput, setCourseInput] = useState('');
    const [grade, setGrade] = useState(''); 
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        tel_no: "",
        dateOfBirth: "",
        gender: "",
        parentFirstName: "",
        parentSecondName: "",
        parentPhoneNumber: "",
        relationshipToStudent: "",
    });

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentStep((prev) => prev + 1);
    };

    const handleCourseChange = (e) => setCourseInput(e.target.value);

    const handleAddCourse = () => {
        if (courseInput && grade) {
            setCourses([...courses, { id: Date.now(), name: courseInput, grade }]);
            setCourseInput('');
            setGrade('');
            notifySuccess("Course successfully added!");
        } else {
            notifyError("Please provide both course and grade.");
        }
    };

    const handleRemoveCourse = (id) => {
        setCourses(courses.filter((course) => course.id !== id));
        notifySuccess("Course removed successfully.");
    };

    /*const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = { ...data, courses };

        console.log('Final Registration Data:', finalData); // Replace with post for backend submission
        post(route('register'), {

            data: finalData,
            onFinish: () => {
                reset();
                toast.success("Registration successful!", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
            },
        });
    };*/
  
    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalData = { ...data, courses };
        setLoading(true); // Set loading state to true
        setError(null); // Clear any previous errors

        try {
            const response = await axios.post(route("register"), finalData);
            console.log("Registration successful", response.data);
            reset(); // Reset form fields
        } catch (error) {
            setError(error.message); // Set the error message
            console.error("Registration error:", error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const validateName = (name) => /^[A-Za-z][A-Za-z\s-]*$/.test(name) || name === "";
    const handleNameChange = (fieldName, value) => {
        if (validateName(value)) {
            setData(fieldName, value);
            if (errors[fieldName]) delete errors[fieldName];
        } else {
            setData(fieldName, value);
            errors[fieldName] = "Name can only contain letters.";
        }
    };

    const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) || email === "";
    const handleEmailChange = (value) => {
        if (validateEmail(value)) {
            setData('email', value);
            if (errors.email) delete errors.email;
        } else {
            setData('email', value);
            errors.email = "Please enter a valid email address.";
        }
    };

    const validatePhoneNumber = (phoneNumber) => /^0\d{9}$/.test(phoneNumber) || phoneNumber === "";
    const handlePhoneNumberChange = (fieldName, value) => {
        if (validatePhoneNumber(value)) {
            setData(fieldName, value);
            if (errors[fieldName]) delete errors[fieldName];
        } else {
            setData(fieldName, value);
            errors[fieldName] = "Invalid phone number.";
        }
    };

    const validateGrade = (grade) => /^(?:[6-9]|10|11|A\/L)$/i.test(grade) || grade === "";
    const handleGradeChange = (value) => {
        if (validateGrade(value)) {
            setGrade(value);
            if (errors.grade) delete errors.grade;
        } else {
            setGrade(value);
            errors.grade = "Grade must be between 6-11 or 'A/L'.";
        }
    };

    const notifySuccess = (message) => toast.success(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progressClassName: "bg-green-500",
        className: "border border-green-600 rounded-lg shadow-md",
        style: { backgroundColor: '#ebfeee' },
    });

    const notifyError = (message) => toast.error(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progressClassName: "bg-red-500",
        className: "border border-red-600 rounded-lg shadow-md",
        style: { backgroundColor: '#fcf0f0' },
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
                            onChange={(e) => handleNameChange('first_name', e.target.value)}
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
                            onChange={(e) => handleNameChange('last_name', e.target.value)}
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
                            onChange={(e) => handlePhoneNumberChange('tel_no', e.target.value)}
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
                            onChange={(e) =>
                                setData("dateOfBirth", e.target.value)
                            }
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
                            htmlFor="parentFirstName"
                            value="Parent First Name"
                        />
                        <TextInput
                            id="parentFirstName"
                            name="parentFirstName"
                            value={data.parentFirstName}
                            className="mt-1 block w-full"
                            onChange={(e) => handleNameChange('parentFirstName', e.target.value)}
                            required
                        />
                        <InputError
                            message={errors.parentFirstName}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="parentSecondName"
                            value="Parent Second Name"
                        />
                        <TextInput
                            id="parentSecondName"
                            name="parentSecondName"
                            value={data.parentSecondName}
                            className="mt-1 block w-full"
                            onChange={(e) => handleNameChange('parentSecondName', e.target.value)}
                            required
                        />
                        <InputError
                            message={errors.parentSecondName}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="parentPhoneNumber"
                            value="Parent Phone Number"
                        />
                        <TextInput
                            id="parentPhoneNumber"
                            name="parentPhoneNumber"
                            value={data.parentPhoneNumber}
                            className="mt-1 block w-full"
                            onChange={(e) => handlePhoneNumberChange('parentPhoneNumber', e.target.value)}
                            required
                        />
                        <InputError
                            message={errors.parentPhoneNumber}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="relationshipToStudent"
                            value="Relationship to Student"
                        />
                        <TextInput
                            id="relationshipToStudent"
                            name="relationshipToStudent"
                            value={data.relationshipToStudent}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("relationshipToStudent", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.relationshipToStudent}
                            className="mt-2"
                        />
                    </div>
                    <div className="flex justify-center ">
                        <PrimaryButton type="submit" className="bg-orange-500 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-20 md:mb-5 mt-5">
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
                        <TextInput
                            id="grade"
                            name="grade"
                            value={grade}
                            className="mt-1 block w-full"
                            onChange={(e) => handleGradeChange(e.target.value)}
                            placeholder="Grade"
                        />
                        <InputError message={errors.grade} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="course" value="Add a Course" />
                        <div className="flex space-x-2">
                            <TextInput
                                id="course"
                                name="course"
                                value={courseInput}
                                className="mt-1 block w-full"
                                onChange={(e) => setCourseInput(e.target.value)}
                                placeholder="Search course"
                            />
                            <button
                                type="button"
                                className="bg-gray-400 hover:bg-gray-500 text-black font-semibold rounded-md px-8 py-2"
                                onClick={handleAddCourse}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    <div className="pt-10 ">
                        <InputLabel value="Added Courses" />
                        <div className='mt-2 overflow-x-auto rounded-3xl shadow-[1px_1px_5px_#3d3d3df7,1px_1px_5px#afb0b0f7] bg-white'>
                            <table className="min-w-full table-auto border-collapse w-full bg-white rounded-3xl">
                                <thead>
                                    <tr>
                                        <th className=" p-2">Course ID</th>
                                        <th className=" p-2">Course Name</th>
                                        <th className=" p-2">Grade</th>
                                        <th className=" p-2">Option</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course.id}>
                                            <td className="border-t p-2">
                                                {course.id}
                                            </td>
                                            <td className="border-t p-2">
                                                {course.name}
                                            </td>
                                            <td className="border-t p-2">
                                                {course.grade}
                                            </td>
                                            <td className="border-t p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveCourse(
                                                            course.id
                                                        )
                                                    }
                                                    className="text-red-500"
                                                >
                                                    🗑
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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