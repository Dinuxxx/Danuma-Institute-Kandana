import React, { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
//import route from "ziggy-js"; // Import the Ziggy route helper
import { route } from "ziggy-js"; // Correctly import Ziggy's route helper
import axios from "axios";

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [currentStep, setCurrentStep] = useState(1); // State to track current step
    const [courses, setCourses] = useState([]); // State for managing added courses
    const [courseInput, setCourseInput] = useState(""); // Course search input
    const [grade, setGrade] = useState(""); // Selected grade
    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        parentFirstName: "",
        parentSecondName: "",
        parentPhoneNumber: "",
        relationshipToStudent: "",
    });

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentStep((prev) => prev + 1); // Move to the next step
    };

    const handleAddCourse = () => {
        if (courseInput && grade) {
            setCourses([
                ...courses,
                { id: Date.now(), name: courseInput, grade },
            ]);
            setCourseInput("");
            setGrade("");
        }
    };

    const handleRemoveCourse = (id) => {
        setCourses(courses.filter((course) => course.id !== id));
    };

    /*const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = { ...data, courses };
        console.log("Final Registration Data:", finalData); // Replace with `post` for backend submission
        post(route("register.store"), {
            data: finalData,
            onFinish: () => reset(),
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
                            value={data.firstName}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("firstName", e.target.value)
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
                            value={data.lastName}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("lastName", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.last_mame}
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
                            onChange={(e) => setData("email", e.target.value)}
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
                            value={data.phoneNumber}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("phoneNumber", e.target.value)
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
                            onChange={(e) =>
                                setData("parentFirstName", e.target.value)
                            }
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
                            onChange={(e) =>
                                setData("parentSecondName", e.target.value)
                            }
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
                            onChange={(e) =>
                                setData("parentPhoneNumber", e.target.value)
                            }
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
                        <PrimaryButton
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 md:w-[40%] w-[50%] justify-center rounded-xl py-2 md:mt-20 md:mb-5 mt-5"
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
                        <TextInput
                            id="grade"
                            name="grade"
                            value={grade}
                            className="mt-1 block w-full"
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="Grade"
                        />
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
                        <div className="mt-2 overflow-x-auto rounded-3xl shadow-[1px_1px_5px_#3d3d3df7,_1px_1px_5px_#afb0b0f7] bg-white">
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
                                                    🗑️
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
        </GuestLayout>
    );
}
