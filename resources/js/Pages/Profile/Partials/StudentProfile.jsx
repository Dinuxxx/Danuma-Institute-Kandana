import React from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";

export default function StudentProfile({
    data,
    setData,
    errors,
    roleSpecificData,
}) {
    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            {/* Student-specific Section with Creative UI */}
            <div className="mt-10">
                <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Academic Information
                    </h3>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                            <span className="text-xl font-bold">
                                {data.grade}
                            </span>
                        </div>
                        <div>
                            <h4 className="font-medium">Current Grade</h4>
                            <p className="text-sm text-gray-600">
                                Academic Year {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Information Card with Creative UI - Keep this section */}
            <div className="mt-10">
                <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Parent/Guardian Information
                    </h3>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel
                                htmlFor="parent_first_name"
                                value="First Name"
                            />
                            <TextInput
                                id="parent_first_name"
                                className="mt-1 block w-full"
                                value={data.parent_info?.first_name || ""}
                                onChange={(e) =>
                                    setData("parent_info", {
                                        ...data.parent_info,
                                        first_name: e.target.value,
                                    })
                                }
                            />
                            <InputError
                                message={errors["parent_info.first_name"]}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="parent_last_name"
                                value="Last Name"
                            />
                            <TextInput
                                id="parent_last_name"
                                className="mt-1 block w-full"
                                value={data.parent_info?.last_name || ""}
                                onChange={(e) =>
                                    setData("parent_info", {
                                        ...data.parent_info,
                                        last_name: e.target.value,
                                    })
                                }
                            />
                            <InputError
                                message={errors["parent_info.last_name"]}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="parent_tel_no"
                                value="Phone Number"
                            />
                            <TextInput
                                id="parent_tel_no"
                                className="mt-1 block w-full"
                                value={data.parent_info?.tel_no || ""}
                                onChange={(e) =>
                                    setData("parent_info", {
                                        ...data.parent_info,
                                        tel_no: e.target.value,
                                    })
                                }
                            />
                            <InputError
                                message={errors["parent_info.tel_no"]}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="parent_relationship"
                                value="Relationship"
                            />
                            <SelectInput
                                id="parent_relationship"
                                className="mt-1 block w-full"
                                value={
                                    data.parent_info?.relationship_type || ""
                                }
                                onChange={(e) =>
                                    setData("parent_info", {
                                        ...data.parent_info,
                                        relationship_type: e.target.value,
                                    })
                                }
                                options={[
                                    { value: "", label: "Select Relationship" },
                                    { value: "Father", label: "Father" },
                                    { value: "Mother", label: "Mother" },
                                    { value: "Guardian", label: "Guardian" },
                                    { value: "Other", label: "Other" },
                                ]}
                            />
                            <InputError
                                message={
                                    errors["parent_info.relationship_type"]
                                }
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Card with Creative UI */}
            {roleSpecificData?.courses &&
                roleSpecificData.courses.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-purple-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Enrolled Courses
                            </h3>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <div className="grid grid-cols-1 gap-4">
                                {roleSpecificData.courses.map((course) => (
                                    <div
                                        key={course.course_id}
                                        className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                                    course.status === "Active"
                                                        ? "bg-green-100"
                                                        : "bg-red-100"
                                                }`}
                                            >
                                                {course.status === "Active" ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-green-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-red-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <h5 className="font-medium text-lg">
                                                    {course.course_name}
                                                </h5>
                                                <p className="text-sm text-gray-600">
                                                    Grade: {course.grade}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    course.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
