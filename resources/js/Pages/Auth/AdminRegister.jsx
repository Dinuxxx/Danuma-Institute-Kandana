import React, { useState } from "react";
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

export default function AdminRegister() {
    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        tel_no: "",
        dob: "",
        gender: "",
        nic: "",
        salary: "",
        name: "",
        password: "",
        password_confirmation: "",
    });

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

        const temporaryPassword = generateTemporaryPassword();

        const finalData = {
            // User table data
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email.trim().toLowerCase(), // Ensure email is clean
            name: `${data.first_name} ${data.last_name}`.trim(),
            password: temporaryPassword,
            password_confirmation: temporaryPassword,
            role: "admin", // Explicitly specify role as admin

            // User_registrations table data
            address: data.address,
            tel_no: data.tel_no,
            dob: data.dob,
            gender: data.gender,

            // Admins table data
            nic: data.nic,
            salary: parseFloat(data.salary) || 0,
        };

        console.log("Submitting admin data:", finalData); // Debug log

        setLoading(true);

        try {
            const response = await axios.post(
                route("admin.register"),
                finalData
            );

            if (response.data.status === "success") {
                notifySuccess(
                    "Admin registered successfully! Verification email has been sent."
                );
                notifySuccess(`Temporary password: ${temporaryPassword}`);

                // Clear form and reset state
                reset();
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

    const validateSalary = (salary) =>
        /^\d*\.?\d*$/.test(salary) || salary === "";
    const handleSalaryChange = (value) => {
        if (validateSalary(value)) {
            setData("salary", value);
            if (errors.salary) delete errors.salary;
        } else {
            setData("salary", value);
            errors.salary = "Please enter a valid salary amount.";
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
            <Head title="Admin Registration" />
            <div className="relative mb-8 md:mb-20 h-1 bg-black w-full"></div>

            <form onSubmit={handleSubmit} className="space-y-2 px-[10%]">
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
                    <InputError message={errors.first_name} className="mt-2" />
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
                    <InputError message={errors.last_name} className="mt-2" />
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
                    <InputLabel htmlFor="salary" value="Salary (Rs.)" />
                    <TextInput
                        id="salary"
                        name="salary"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.salary}
                        className="mt-1 block w-full"
                        onChange={(e) => handleSalaryChange(e.target.value)}
                        placeholder="Enter monthly salary"
                        required
                    />
                    <InputError message={errors.salary} className="mt-2" />
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
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Submit"}
                    </PrimaryButton>
                </div>
            </form>

            <ToastContainer />
        </GuestLayout>
    );
}
