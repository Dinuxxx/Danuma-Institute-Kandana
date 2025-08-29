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
                    <a href="https://maps.google.com/?q=123+Kandana+Road+Kandana+Sri+Lanka" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        123 Kandana Road, Kandana, Sri Lanka
                    </a>
                </li>
                <li className="flex items-center text-lg">
                    <FaPhoneAlt className="mr-2 text-gray-500" />
                    0112456789
                </li>
                <li className="flex items-center text-lg">
                    <FaEnvelope className="mr-2 text-gray-500" />
                    <a href="mailto:danumainstitute@gmail.com" className="hover:text-blue-600">
                        danumainstitute@gmail.com
                    </a>
                </li>
                <li className="flex items-center text-lg">
                    <FaGlobe className="mr-2 text-gray-500" />
                    <a href="https://www.danumainstitute.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        www.danumainstitute.com
                    </a>
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
