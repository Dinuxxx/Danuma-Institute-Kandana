import React from "react";
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaGlobe,
} from "react-icons/fa";
import {
    FaFacebook,
    FaInstagram,
    FaWhatsapp,
    FaLinkedin,
} from "react-icons/fa";

const AddressInfo = () => {
    return (
        <div className="p-6 bg-white rounded-lg max-w-lg mx-auto md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Address info</h2>
            <p className="font-bold mb-2 text-xl">Danuma Institute</p>
            <ul className="mb-4 space-y-2">
                <li className="flex items-center text-lg">
                    <FaMapMarkerAlt className="mr-2 text-gray-500 " />
                    Address
                </li>
                <li className="flex items-center text-lg">
                    <FaPhoneAlt className="mr-2 text-gray-500" />
                    Telephone
                </li>
                <li className="flex items-center text-lg">
                    <FaEnvelope className="mr-2 text-gray-500" />
                    Email
                </li>
                <li className="flex items-center text-lg">
                    <FaGlobe className="mr-2 text-gray-500" />
                    Website
                </li>
            </ul>
            <p className="lg:mb-4">
                ----------------------------------------------------------------
                ----------------------------------------------------------------
                ----------------------------------------------------------------
                ------------------------------
            </p>
            <div className="flex space-x-4">
                <FaInstagram className="text-gray-600 hover:text-orange-500 cursor-pointer text-2xl md:text-3xl lg:text-4xl" />
                <FaFacebook className="text-gray-600 hover:text-blue-500 cursor-pointer text-2xl md:text-3xl lg:text-4xl" />
                <FaWhatsapp className="text-gray-600 hover:text-green-500 cursor-pointer text-2xl md:text-3xl lg:text-4xl" />
                <FaLinkedin className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl md:text-3xl lg:text-4xl" />
            </div>
        </div>
    );
};

export default AddressInfo;
