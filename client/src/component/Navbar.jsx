import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { images } from '../../public/index.js';
import { AiOutlineMenu } from "react-icons/ai";
import { IoMdCloseCircleOutline } from "react-icons/io";
import clsx from 'clsx';
import ApiContext from '../context/ApiContext.jsx';
import Cookies from 'js-cookie';
import {
    faHome,
    faComments,
    faCalendar,
    faBlog,
    faEnvelope,
    faBook,
    faUser,
    faCog,
    faSignOutAlt,
    faChalkboardTeacher,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBrain } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Navbar = () => {
    const [isSideMenuOpen, setMenu] = useState(false);
    const { user, userToken, setUserToken, logOut } = useContext(ApiContext);
    const isLoggedIn = !!(userToken && user);
    const location = useLocation();
    const navigate = useNavigate();

    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure you want to log out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log out'
        }).then((result) => {
            if (result.isConfirmed) {
                setDropdownOpen(false);
                Cookies.remove('userToken');
                setUserToken(null);
                navigate('/SignInn');
            }
        });
    };

    const navLinks = [
        { label: 'Home', to: "/", icon: faHome },
        { label: 'Discussions', to: '/Discussion', icon: faComments },
        { label: 'Events', to: '/EventWorkshopPage', icon: faCalendar },
        { label: 'Blog', to: '/Blog', icon: faBlog },
        { label: 'Quiz', to: '/QuizInterface', icon: FaBrain },
        { label: 'LMS', to: '/LearningPath', icon: faChalkboardTeacher },
        { label: 'Contact', to: '/ContactUs', icon: faEnvelope },
        { label: 'Guidelines', to: '/CommunityGuidelines', icon: faBook }
    ];

    const mobileMenuLinks = [
        { label: 'Home', to: "/", icon: faHome },
        { label: 'Discussions', to: '/Discussion', icon: faComments },
        { label: 'Events', to: '/EventWorkshopPage', icon: faCalendar },
        { label: 'Blog', to: '/Blog', icon: faBlog },
        { label: 'LMS', to: '/LearningPath', icon: faChalkboardTeacher },
        { label: 'Quiz', to: '/QuizInterface', icon: FaBrain },
        { label: 'Guidelines', to: '/CommunityGuidelines', icon: faBook },
        { label: 'Contact', to: '/ContactUs', icon: faEnvelope },
    ];

    const getProfileImage = () => {
        if (user?.ProfilePicture) {
            if (!user.ProfilePicture.startsWith('data:image')) {
                return `${user.ProfilePicture}?${new Date().getTime()}`;
            }
            return user.ProfilePicture;
        }
        return images.defaultProfile;
    };

    return (
        <main>
            <nav className='flex justify-between items-center py-2 px-4 md:px-6 lg:px-8 bg-DGXblue/10 shadow-lg'>
                {/* Left section - Logo and mobile menu button */}
                <div className='flex items-center gap-4'>
                    <AiOutlineMenu
                        onClick={() => setMenu(true)}
                        className='text-3xl cursor-pointer md:hidden text-DGXblue hover:text-DGXgreen transition-colors duration-300'
                    />
                    <Link to="/" className="flex items-center">
                        <img
                            src={images.giventure}
                            className="h-10 md:h-10 lg:h-12 xl:h-14"
                            alt="gi-venture logo"
                        />
                    </Link>
                </div>

                {/* Center section - Desktop Navigation Links */}
                <div className="hidden md:flex items-center justify-center flex-1 mx-4">
                    <div className="flex flex-wrap justify-center gap-2 lg:gap-4 xl:gap-6">
                        {navLinks.map((d, i) => (
                            <Link
                                key={i}
                                className={clsx(
                                    'text-DGXblue text-sm lg:text-base font-medium transition-all duration-300 ease-in-out relative',
                                    'px-2 py-1 rounded-md hover:bg-DGXblue/20',
                                    location.pathname === d.to ? 'text-DGXgreen font-bold' : 'hover:text-DGXgreen'
                                )}
                                to={d.to}
                            >
                                {d.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right section - User Profile (Always visible) */}
                <div className='flex items-center justify-end'>
                    {!isLoggedIn ? (
                        <Link to="/SignInn">
                            <button
                                type="button"
                                className="text-white bg-DGXgreen hover:bg-DGXblue font-medium rounded-md text-sm px-3 py-1.5 md:px-4 md:py-2 transition-all duration-300"
                            >
                                Login
                            </button>
                        </Link>
                    ) : (
                        <div className='relative flex items-center gap-2'>
                            <span className='hidden xs:inline text-sm sm:text-base font-medium text-DGXblue truncate max-w-[100px] sm:max-w-[150px]'>
                                {user.Name}
                            </span>
                            <div className="relative group">
                                <img
                                    src={getProfileImage()}
                                    alt="User"
                                    className='h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full border-2 cursor-pointer border-DGXgreen hover:border-DGXblue transition-all duration-300 object-cover'
                                    onClick={toggleDropdown}
                                    onError={(e) => {
                                        e.target.src = images.defaultProfile;
                                    }}
                                />
                                {/* Active indicator dot */}
                                {isDropdownOpen && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-DGXgreen border-2 border-white"></div>
                                )}
                            </div>
                            
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-DGXblue overflow-hidden">
                                    <Link
                                        to="/UserProfile"
                                        className='flex items-center px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200'
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-DGXblue" />
                                        Profile
                                    </Link>
                                    {(user.isAdmin == '1') && (
                                        <Link
                                            to="/AdminDashboard"
                                            className='flex items-center px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200'
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <FontAwesomeIcon icon={faCog} className="mr-2 text-DGXblue" />
                                            Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className='flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-DGXblue/10 hover:text-DGXgreen transition-all duration-200'
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-DGXblue" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Side Menu */}
                <div className={clsx(
                    'fixed inset-0 h-full w-screen lg:hidden bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
                    isSideMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}>
                    <section className={clsx(
                        "absolute left-0 top-0 h-full w-3/4 sm:w-64 bg-DGXblue text-white p-6 transition-transform duration-300 ease-in-out flex flex-col",
                        isSideMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    )}>
                        <div className='flex justify-between items-center mb-6'>
                            <IoMdCloseCircleOutline
                                onClick={() => setMenu(false)}
                                className="text-2xl cursor-pointer hover:text-DGXgreen transition-colors duration-300"
                            />
                            {isLoggedIn && (
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm truncate max-w-[100px]'>{user.Name}</span>
                                    <img
                                        src={getProfileImage()}
                                        alt="User"
                                        className='h-8 w-8 rounded-full border-2 border-white object-cover'
                                        onError={(e) => {
                                            e.target.src = images.defaultProfile;
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {mobileMenuLinks.map((d, i) => (
                                <Link
                                    key={i}
                                    className={clsx(
                                        'flex items-center gap-4 py-3 px-4 rounded-md my-1 transition-all duration-200',
                                        location.pathname === d.to 
                                            ? 'bg-DGXblue/80 text-DGXgreen font-bold' 
                                            : 'text-white hover:bg-DGXblue/80 hover:text-DGXgreen'
                                    )}
                                    to={d.to}
                                    onClick={() => setMenu(false)}
                                >
                                    {typeof d.icon === 'function' ? (
                                        <d.icon className="text-xl" />
                                    ) : (
                                        <FontAwesomeIcon icon={d.icon} className="text-xl" />
                                    )}
                                    <span className="text-sm font-medium">{d.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile menu login/logout */}
                        {!isLoggedIn ? (
                            <Link
                                to="/SignInn"
                                className='mt-4 bg-DGXgreen text-white px-4 py-3 rounded-md text-center hover:bg-DGXblue transition-all duration-300 flex items-center justify-center gap-2'
                                onClick={() => setMenu(false)}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                <span>Login</span>
                            </Link>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className='mt-4 bg-DGXgreen text-white px-4 py-3 rounded-md text-center hover:bg-DGXblue transition-all duration-300 flex items-center justify-center gap-2'
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span>Logout</span>
                            </button>
                        )}
                    </section>
                </div>
            </nav>
            <hr className='border-b-4 border-DGXblue' />
        </main>
    );
};

export default Navbar;