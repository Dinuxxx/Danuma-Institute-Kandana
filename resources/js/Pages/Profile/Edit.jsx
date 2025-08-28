import React, { useState, useEffect, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import Message from "@/Components/Message";
import AdminProfile from "./Partials/AdminProfile";
import TeacherProfile from "./Partials/TeacherProfile";
import StudentProfile from "./Partials/StudentProfile";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Edit({
    auth,
    user,
    userRegistration,
    userRole,
    roleSpecificData,
    flash,
}) {
    // Check if userRegistration exists, if not provide default values
    const registration = userRegistration || {};

    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(
        registration.image
            ? `/storage/profiles/${registration.image}`
            : "/images/default-avatar-svg.svg"
    );

    const { data, setData, patch, errors, processing, reset } = useForm({
        // Only include fields that should be editable
        image: null,
        ...(userRole === "student"
            ? {
                  parent_info: roleSpecificData?.parent
                      ? {
                            first_name:
                                roleSpecificData.parent.parent_first_name || "",
                            last_name:
                                roleSpecificData.parent.parent_last_name || "",
                            tel_no:
                                roleSpecificData.parent.parent_phone_number ||
                                "",
                            relationship_type:
                                roleSpecificData.parent.relationship_type || "",
                        }
                      : {},
              }
            : {}),
    });

    function getRoleSpecificFormData(role, roleData) {
        if (!roleData) return {};

        switch (role) {
            case "admin":
                return {
                    nic: roleData.nic || "",
                };
            case "teacher":
                return {
                    nic: roleData.nic || "",
                    qualifications: roleData.qualifications || "",
                };
            case "student":
                return {
                    grade: roleData.grade || "",
                    parent_info: roleData.parent
                        ? {
                              first_name:
                                  roleData.parent.parent_first_name || "",
                              last_name: roleData.parent.parent_last_name || "",
                              tel_no: roleData.parent.parent_phone_number || "",
                              relationship_type:
                                  roleData.parent.relationship_type || "",
                          }
                        : {},
                };
            default:
                return {};
        }
    }

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageError = () => {
        setImagePreview("/images/default-avatar-svg.svg");
        toast.error("Failed to load profile image");
    };

    /*const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"), {
            onSuccess: () => {
                setData("image", null);
                toast.success("Profile updated successfully");
            },
            onError: (errors) => {
                toast.error("Failed to update profile");
                console.error(errors);
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };*/

    const submit = (e) => {
        e.preventDefault();

        // Create FormData object
        const formData = new FormData();

        // Add image if exists
        if (data.image) {
            formData.append("image", data.image);
        }

        // Add parent/guardian info if user is student
        if (userRole === "student" && data.parent_info) {
            formData.append(
                "parent_info[first_name]",
                data.parent_info.first_name
            );
            formData.append(
                "parent_info[last_name]",
                data.parent_info.last_name
            );
            formData.append("parent_info[tel_no]", data.parent_info.tel_no);
            formData.append(
                "parent_info[relationship_type]",
                data.parent_info.relationship_type
            );
        }

        patch(route("profile.update"), formData, {
            onSuccess: () => {
                setData("image", null);
                toast.success("Profile updated successfully");
            },
            onError: (errors) => {
                toast.error("Failed to update profile");
                console.error(errors);
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const renderRoleSpecificForm = () => {
        switch (userRole) {
            case "admin":
                return (
                    <AdminProfile
                        data={data}
                        setData={setData}
                        errors={errors}
                        roleSpecificData={roleSpecificData}
                    />
                );
            case "teacher":
                return (
                    <TeacherProfile
                        data={data}
                        setData={setData}
                        errors={errors}
                        roleSpecificData={roleSpecificData}
                    />
                );
            case "student":
                return (
                    <StudentProfile
                        data={data}
                        setData={setData}
                        errors={errors}
                        roleSpecificData={roleSpecificData}
                    />
                );
            default:
                return null;
        }
    };

    // Info message for users without role-specific data
    const renderInfoMessage = () => {
        if (!userRegistration || !userRegistration.role) {
            return (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-blue-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Your profile is incomplete. Please contact an
                                administrator to complete your registration.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash.message && <Message message={flash.message} />}
                    {renderInfoMessage()}

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">
                                    Profile Information
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    View your profile information and update
                                    profile picture
                                    {userRole === "student"
                                        ? " and guardian information."
                                        : "."}
                                </p>
                            </header>

                            <form
                                onSubmit={submit}
                                className="mt-6 space-y-6"
                                encType="multipart/form-data"
                            >
                                {/* Profile Image Section - Keep as is */}
                                <div className="flex justify-center mb-8">
                                    <div
                                        className="relative rounded-full overflow-hidden cursor-pointer group"
                                        onClick={handleImageClick}
                                    >
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-40 h-40 object-cover rounded-full border-4 border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium">
                                                Change Photo
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="image"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* Profile Information - Read Only */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel
                                                htmlFor="title"
                                                value="Title"
                                            />
                                            <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                                                {registration.title || "N/A"}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="first_name"
                                                value="First Name"
                                            />
                                            <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                                                {registration.first_name ||
                                                    "N/A"}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="last_name"
                                                value="Last Name"
                                            />
                                            <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                                                {registration.last_name ||
                                                    "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel
                                                htmlFor="email"
                                                value="Email"
                                            />
                                            <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                                                {user.email || "N/A"}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="tel_no"
                                                value="Phone Number"
                                            />
                                            <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                                                {registration.tel_no || "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="address"
                                            value="Address"
                                        />
                                        <div className="mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md min-h-[5rem]">
                                            {registration.address || "N/A"}
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information - Only editable for students */}
                                {userRole === "student" && (
                                    <div className="mt-8 pt-8 border-t">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Guardian Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel
                                                    htmlFor="parent_first_name"
                                                    value="Guardian First Name"
                                                />
                                                <TextInput
                                                    id="parent_first_name"
                                                    className="mt-1 block w-full"
                                                    value={
                                                        data.parent_info
                                                            ?.first_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData("parent_info", {
                                                            ...data.parent_info,
                                                            first_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            "parent_info.first_name"
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="parent_last_name"
                                                    value="Guardian Last Name"
                                                />
                                                <TextInput
                                                    id="parent_last_name"
                                                    className="mt-1 block w-full"
                                                    value={
                                                        data.parent_info
                                                            ?.last_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData("parent_info", {
                                                            ...data.parent_info,
                                                            last_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            "parent_info.last_name"
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="parent_tel_no"
                                                    value="Guardian Phone Number"
                                                />
                                                <TextInput
                                                    id="parent_tel_no"
                                                    type="tel"
                                                    className="mt-1 block w-full"
                                                    value={
                                                        data.parent_info
                                                            ?.tel_no || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData("parent_info", {
                                                            ...data.parent_info,
                                                            tel_no: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            "parent_info.tel_no"
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="relationship_type"
                                                    value="Relationship Type"
                                                />
                                                <SelectInput
                                                    id="relationship_type"
                                                    className="mt-1 block w-full"
                                                    value={
                                                        data.parent_info
                                                            ?.relationship_type ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setData("parent_info", {
                                                            ...data.parent_info,
                                                            relationship_type:
                                                                e.target.value,
                                                        })
                                                    }
                                                    options={[
                                                        {
                                                            value: "",
                                                            label: "Select Relationship",
                                                        },
                                                        {
                                                            value: "father",
                                                            label: "Father",
                                                        },
                                                        {
                                                            value: "mother",
                                                            label: "Mother",
                                                        },
                                                        {
                                                            value: "guardian",
                                                            label: "Legal Guardian",
                                                        },
                                                    ]}
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            "parent_info.relationship_type"
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        {processing
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Role-specific form - Only for students, teachers, and admins */}
                    {userRole !== "super_admin" && (
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                            <section>
                                <header>
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Additional Information
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Provide any additional information
                                        required for your role.
                                    </p>
                                </header>

                                {renderRoleSpecificForm()}

                                {/* Submit Button - Always at the end */}
                                <div className="flex justify-end">
                                    <PrimaryButton
                                        className="mt-4"
                                        processing={processing}
                                    >
                                        Save Changes
                                    </PrimaryButton>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
