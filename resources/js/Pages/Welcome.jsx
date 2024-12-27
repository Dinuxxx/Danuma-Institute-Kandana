import ApplicationLogo from "@/Components/ApplicationLogo";
import Hero from "@/Components/Public-access/Hero";
import Footer from "@/Components/Public-access/Footer";
import Title from "@/Components/Public-access/Title";
import AddressInfo from "@/Components/Public-access/AddressInfo";
import ContactForm from "@/Components/Public-access/ContactForm";
import Timetable from "@/Components/Timetable";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { BsSearch, BsChevronDown } from 'react-icons/bs';
import TeacherCard from "@/Components/Public-access/TeacherCard";
import TeacherDetails from "@/Components/Public-access/TeacherDetails";
import Dropdown from '@/Components/Dropdown';
import AboutUs from "@/Components/Public-access/AboutUs";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('Select grade');

    const teacher = {
        name: 'John Doe',
        image: null, // URL for the teacher's image
        details: [
            { label: 'Email', value: 'johndoe@example.com' },
            { label: 'Phone', value: '123-456-7890' },
            { label: 'Subjects', value: 'Math, Science' },
        ],
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleGradeChange = (grade) => setSelectedGrade(grade);

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
                <Title title="About Us" />
                <AboutUs/>
            </div>
            <div className='ml-[5%] mr-[5%]'>
                <Title title='Teacher Profiles'/>
                <div className="lg:pt-10 md:pt-5 md:p-10 p-5 lg:p-20 mt-[-30px] shadow-[1px_1px_5px_#3d3d3df7,_1px_1px_5px_#afb0b0f7] rounded-2xl mt-[-40px] lg:mx-20">

                    {/* Search Bar and Dropdown */}
                    <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
                        {/* Search Bar */}
                        <div className="relative w-[70%] md:w-[23%]">
                            <input
                                type="text"
                                placeholder="Enter the course"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring focus:ring-orange-300 pr-10"
                            />
                            <BsSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
                        </div>

                        {/* Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="w-full md:w-auto px-4 py-2 bg-gray-100 border rounded-md text-gray-700 hover:bg-gray-200 flex items-center justify-between">
                                    {selectedGrade}
                                    <BsChevronDown className="ml-2 text-gray-500" /> {/* Dropdown Icon */}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 6')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 6</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 7')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 7</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 8')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 8</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 9')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 9</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 10')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 10</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade 11')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">Grade 11</Dropdown.Link>
                                <Dropdown.Link onClick={() => handleGradeChange('Grade A/L')} className="hover:bg-orange-100 hover:text-orange-500 hover:font-semibold">A/L</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    {/* Teacher Components */}
                    <div className="mt-6 flex flex-col md:flex-row md:space-x-40 ">
                        <TeacherCard name={teacher.name} image={teacher.image} />
                        <TeacherDetails details={teacher.details} />
                    </div>
                </div>
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
