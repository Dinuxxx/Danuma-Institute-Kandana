import ApplicationLogo from "@/Components/ApplicationLogo";
import Hero from "@/Components/Public-access/Hero";
import Footer from "@/Components/Public-access/Footer";
import Title from "@/Components/Public-access/Title";
import AddressInfo from "@/Components/Public-access/AddressInfo";
import ContactForm from "@/Components/Public-access/ContactForm";
import Timetable from "@/Components/Timetable";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { BsList, BsX } from "react-icons/bs";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const columns = [
        "Subject Code",
        "Subject Name",
        "Day",
        "Start Time",
        "End Time",
    ];
    const data = [
        {
            "Subject Code": "CSC101",
            "Subject Name": "Introduction to Programming",
            Day: "Monday",
            "Start Time": "09:00 AM",
            "End Time": "11:00 AM",
        },
        {
            "Subject Code": "CSC102",
            "Subject Name": "Data Structures",
            Day: "Wednesday",
            "Start Time": "02:00 PM",
            "End Time": "04:00 PM",
        },
    ];
    const handleBack = () => alert("Back button clicked!");

    return (
        <>
            <Head title="Danums Institute" />
            <div className="">
                <header className="">
                    <nav className="">
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="w-full bg-[#F8F8F8] text-black py-1 fixed top-0 left-0 flex items-center justify-between z-10 pl-[4%] pr-[10%] pt-2 pb-4">
                                <ApplicationLogo className="w-[130px]" />
                                <div className="sm:hidden">
                                    <button
                                        onClick={toggleMenu}
                                        className="text-3xl"
                                    >
                                        <div
                                            className={`hamburger ${
                                                isMenuOpen ? "open" : ""
                                            }`}
                                            onClick={toggleMenu}
                                        >
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </button>
                                </div>
                                <ul
                                    className={`${
                                        isMenuOpen ? "block" : "hidden"
                                    } absolute top-full right-0 w-full bg-[#F8F8F8] sm:static sm:flex sm:items-center sm:space-x-10 sm:justify-end sm:list-none pl-5`}
                                >
                                    <li className="nav-item nav-item-1 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02]">
                                        <a href="#">Home</a>
                                    </li>
                                    <li className="nav-item nav-item-2 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02]">
                                        <a href="#">About Us</a>
                                    </li>
                                    <li className="nav-item nav-item-3 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02]">
                                        <a href="#">Teacher Profiles</a>
                                    </li>
                                    <li className="nav-item nav-item-4 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02]">
                                        <a href="#">Time Table</a>
                                    </li>
                                    <li className="nav-item nav-item-5 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02]">
                                        <a href="#">Contact Us</a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </nav>
                </header>

                <main className="mt-[80px] sm:mt-[100px]">
                    <Hero />
                </main>
            </div>
            <div className="ml-[5%] mr-[5%]">
                <Title title="Time Table" />
                <Timetable columns={columns} data={data} onBack={handleBack} />
            </div>
            <div>
                <div className="ml-[5%] mr-[5%]">
                    <Title title="Contact Us" />
                </div>
                <div className=" flex flex-col mt-[-100px]">
                    <div className="flex flex-col md:flex-row w-full my-10 md:mb-10 lg:mb-8 mb-4 flex-grow">
                        <ContactForm />
                        <AddressInfo />
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    );
}
