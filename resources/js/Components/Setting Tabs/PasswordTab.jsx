import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function PasswordTab({ onSuccess }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        patch("/profile/password", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Password updated successfully");
                reset();
                if (typeof onSuccess === "function") {
                    onSuccess();
                }
            },
            onError: (errors) => {
                if (errors.current_password) {
                    toast.error(errors.current_password);
                } else {
                    toast.error("Failed to update password");
                }
            },
        });
    };

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Password validation states
    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        matching: false,
        different: true,
    });

    // Validate password as user types
    useEffect(() => {
        const currentPassword = data.current_password;
        const newPassword = data.password;
        const passwordConfirm = data.password_confirmation;

        setValidations({
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[@$!%*?&]/.test(newPassword),
            matching: newPassword === passwordConfirm && newPassword !== "",
            different:
                currentPassword === "" ||
                newPassword === "" ||
                currentPassword !== newPassword,
        });
    }, [data.current_password, data.password, data.password_confirmation]);

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    /*// Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch('/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password updated successfully');
                reset();
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            },
            onError: () => {
                toast.error(errors.error || 'Failed to update password');
            }
        });
    };*/

    // Helper function to determine text color based on validation status
    const getValidationColor = (isValid) => {
        return isValid ? "text-green-500" : "text-gray-500";
    };

    // Check if all password requirements are met
    const allRequirementsMet = Object.values(validations).every(Boolean);

    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {errors.general && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {errors.general}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="current_password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Current Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type={
                                        showPassword.current
                                            ? "text"
                                            : "password"
                                    }
                                    name="current_password"
                                    id="current_password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            "current_password",
                                            e.target.value
                                        )
                                    }
                                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    onClick={() =>
                                        togglePasswordVisibility("current")
                                    }
                                >
                                    {showPassword.current ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.current_password && (
                                <div className="text-red-500 text-xs mt-1">
                                    {errors.current_password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type={
                                        showPassword.new ? "text" : "password"
                                    }
                                    name="password"
                                    id="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    onClick={() =>
                                        togglePasswordVisibility("new")
                                    }
                                >
                                    {showPassword.new ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="text-red-500 text-xs mt-1">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type={
                                        showPassword.confirm
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    onClick={() =>
                                        togglePasswordVisibility("confirm")
                                    }
                                >
                                    {showPassword.confirm ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-2">
                                Password requirements:
                            </p>
                            <ul className="space-y-1 pl-5">
                                <li
                                    className={getValidationColor(
                                        validations.length
                                    )}
                                >
                                    {validations.length ? "✓" : "○"} Minimum 8
                                    characters
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.uppercase
                                    )}
                                >
                                    {validations.uppercase ? "✓" : "○"} At least
                                    one uppercase letter
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.lowercase
                                    )}
                                >
                                    {validations.lowercase ? "✓" : "○"} At least
                                    one lowercase letter
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.number
                                    )}
                                >
                                    {validations.number ? "✓" : "○"} At least
                                    one number
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.special
                                    )}
                                >
                                    {validations.special ? "✓" : "○"} At least
                                    one special character (@$!%*?&)
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.matching
                                    )}
                                >
                                    {validations.matching ? "✓" : "○"} Passwords
                                    match
                                </li>
                                <li
                                    className={getValidationColor(
                                        validations.different
                                    )}
                                >
                                    {validations.different ? "✓" : "○"} New
                                    password is different from current
                                </li>
                            </ul>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={processing || !allRequirementsMet}
                                className={`inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                    allRequirementsMet
                                        ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        : "bg-indigo-300 cursor-not-allowed"
                                }`}
                            >
                                {processing ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
