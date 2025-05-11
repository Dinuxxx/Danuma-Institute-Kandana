import ApplicationLogo from "@/Components/ApplicationLogo";
import Hero from "@/Components/Public-access/Hero";
import Footer from "@/Components/Public-access/Footer";
import Title from "@/Components/Public-access/Title";
import AddressInfo from "@/Components/Public-access/AddressInfo";
import ContactForm from "@/Components/Public-access/ContactForm";
import Timetable from "@/Components/TableComponent";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { BsSearch, BsChevronDown } from 'react-icons/bs';
import TeacherCard from "@/Components/Public-access/TeacherCard";
import TeacherDetails from "@/Components/Public-access/TeacherDetails";
import AboutUs from "@/Components/Public-access/AboutUs";
import axios from 'axios';

export default function Welcome({ auth }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Create refs for each section
    const homeRef = useRef(null);
    const aboutSectionRef = useRef(null);
    const teacherSectionRef = useRef(null);
    const timetableSectionRef = useRef(null);
    const contactSectionRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('Select grade');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTimetable, setShowTimetable] = useState(false);
    
    // For timetable specific filtering
    const [timetableGradeFilter, setTimetableGradeFilter] = useState('All grades');
    const [filteredTimetableData, setFilteredTimetableData] = useState([]);
    
    // Available grades for dropdown
    const grades = [
        'Select grade',
        'Grade 6',
        'Grade 7',
        'Grade 8',
        'Grade 9',
        'Grade 10',
        'Grade 11',
        'Grade A/L'
    ];
    
    // Scroll to section function
    const scrollToSection = (ref) => {
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false); // Close mobile menu after clicking
        }
    };
    
    // When timetable grade filter changes, filter the timetable data
    useEffect(() => {
        if (selectedTeacher && selectedTeacher.timetable) {
            if (timetableGradeFilter === 'All grades') {
                setFilteredTimetableData(selectedTeacher.timetable);
            } else {
                // Extract grade number or A/L from filter
                let gradeValue;
                if (timetableGradeFilter === 'Grade A/L') {
                    gradeValue = 'A/L';
                } else {
                    gradeValue = timetableGradeFilter.replace('Grade ', '');
                }
                
                // Filter timetable data by grade
                const filtered = selectedTeacher.timetable.filter(item => 
                    item.Grade.toString() === gradeValue.toString()
                );
                setFilteredTimetableData(filtered);
            }
        }
    }, [timetableGradeFilter, selectedTeacher]);

    // Set filtered timetable data when selected teacher changes
    useEffect(() => {
        if (selectedTeacher && selectedTeacher.timetable) {
            setFilteredTimetableData(selectedTeacher.timetable);
            
            // Reset grade filter when teacher changes
            setTimetableGradeFilter('All grades');
        }
    }, [selectedTeacher]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim() !== '') {
            // Search when user types
            searchTeachers(e.target.value, selectedGrade);
        } else {
            // Clear results when search field is empty
            setSelectedTeacher(null);
        }
    };
    
    const handleGradeChange = (e) => {
        const grade = e.target.value;
        setSelectedGrade(grade);
        
        if (searchTerm.trim() !== '') {
            searchTeachers(searchTerm, grade);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            searchTeachers(searchTerm, selectedGrade);
        }
    };

    const searchTeachers = async (courseName, grade) => {
        setIsLoading(true);
        setError(null);
        setShowTimetable(false);
        
        try {
            const response = await axios.get('/teachers/search', {
                params: {
                    courseName: courseName,
                    grade: grade
                }
            });
            
            if (response.data.success && response.data.teachers.length > 0) {
                setSelectedTeacher(response.data.teachers[0]); // Display the first matching teacher
            } else {
                setSelectedTeacher(null);
                setError('No teachers found matching your criteria.');
            }
        } catch (err) {
            console.error('Error searching for teachers:', err);
            setError('An error occurred while searching. Please try again.');
            setSelectedTeacher(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewTimetable = () => {
        setShowTimetable(true);
        setTimeout(() => {
            if (timetableSectionRef.current) {
                timetableSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleBackToTeacher = () => {
        if (teacherSectionRef.current) {
            teacherSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Get unique grades from timetable data for filter options
    const getUniqueGrades = () => {
        if (!selectedTeacher || !selectedTeacher.timetable) return ['All grades'];
        
        const uniqueGrades = ['All grades', ...new Set(selectedTeacher.timetable.map(item => {
            if (item.Grade === 'A/L') return 'Grade A/L';
            return `Grade ${item.Grade}`;
        }))];
        
        return uniqueGrades;
    };

    const columns = [
        "Subject Code",
        "Subject Name",
        "Grade",
        "Day",
        "Start Time",
        "End Time"
    ];

    return (
        <>
            <Head title="Danums Institute" />
            <div className="" ref={homeRef}>
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
                                    <li className="nav-item nav-item-1 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02] cursor-pointer">
                                        <a onClick={() => scrollToSection(homeRef)}>Home</a>
                                    </li>
                                    <li className="nav-item nav-item-2 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02] cursor-pointer">
                                        <a onClick={() => scrollToSection(aboutSectionRef)}>About Us</a>
                                    </li>
                                    <li className="nav-item nav-item-3 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02] cursor-pointer">
                                        <a onClick={() => scrollToSection(teacherSectionRef)}>Teacher Profiles</a>
                                    </li>
                                    <li className="nav-item nav-item-4 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02] cursor-pointer">
                                        <a onClick={() => scrollToSection(timetableSectionRef)}>Time Table</a>
                                    </li>
                                    <li className="nav-item nav-item-5 text-lg sm:text-xl my-2 sm:my-0 hover:text-[#FC9C02] cursor-pointer">
                                        <a onClick={() => scrollToSection(contactSectionRef)}>Contact Us</a>
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
            <div className="ml-[5%] mr-[5%]" ref={aboutSectionRef}>
                <Title title="About Us" />
                <AboutUs/>
            </div>
            <div className='ml-[5%] mr-[5%]' ref={teacherSectionRef}>
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
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring focus:ring-orange-300 pr-10"
                            />
                            <BsSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    {/* Loading, Error, and Teacher Components */}
                    <div className="mt-6">
                        {isLoading && (
                            <div className="text-center py-4">
                                <p>Loading teacher information...</p>
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="text-center py-4 text-red-500">
                                <p>{error}</p>
                            </div>
                        )}

                        {selectedTeacher && !isLoading && (
                            <div className="flex flex-col md:flex-row md:space-x-40">
                                <TeacherCard 
                                    name={selectedTeacher.name} 
                                    image={selectedTeacher.image} 
                                />
                                <TeacherDetails 
                                    details={selectedTeacher.details}
                                    onViewTimetable={handleViewTimetable}
                                />
                            </div>
                        )}

                        {!selectedTeacher && !isLoading && !error && searchTerm.trim() === '' && (
                            <div className="text-center py-4 text-gray-500">
                                <p>Enter a course name or select a grade to find teachers</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="ml-[5%] mr-[5%]" ref={timetableSectionRef} id="timetable-section">
                <Title title="Time Table"/>
                {showTimetable && selectedTeacher ? (
                    <div>
                        {/* Timetable Grade Filter */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="relative w-1/3 max-w-xs">
                                <label htmlFor="timetableGradeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Grade:
                                </label>
                                <div className="relative">
                                    <select
                                        id="timetableGradeFilter"
                                        value={timetableGradeFilter}
                                        onChange={(e) => setTimetableGradeFilter(e.target.value)}
                                        className="block w-full px-4 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    >
                                        {getUniqueGrades().map((grade, index) => (
                                            <option key={index} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                    <BsChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Show message if no results after filtering */}
                        {filteredTimetableData.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                                <p className="text-gray-500">
                                    No classes found for {timetableGradeFilter}.
                                </p>
                            </div>
                        ) : (
                            <Timetable 
                                columns={columns} 
                                data={filteredTimetableData} 
                                onBack={handleBackToTeacher} 
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                        <p className="text-gray-500">
                            {selectedTeacher ? 
                                "Click 'View Timetable' in teacher details to view timetable" : 
                                "Search for a teacher to view their timetable"}
                        </p>
                    </div>
                )}
            </div>
            <div ref={contactSectionRef}>
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