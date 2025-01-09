import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsThreeDots } from 'react-icons/bs';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import XSvg from './XSVG';
import { sidebarLinks } from '../utils/utils'; // Import the utility file

const Sidebar = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    const queryClient = useQueryClient();
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target)
            ) {
                setMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Logout mutation
    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch('/api/auth/logout', { method: 'POST' });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                return data;
            } catch (error) {
                toast.error('Failed to logout');
                throw error;
            }
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['authUser'] }),
        onError: () => toast.error('Log out failed')
    });

    // Menu Toggle Handler
    const toggleMenu = () => setMenuVisible((prev) => !prev);

    return (
        <div className="w-18 max-w-52">
            <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
                <Link to="/" className="flex justify-center md:justify-start">
                    <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
                </Link>
                <ul className="flex flex-col gap-3 mt-4">
                    {sidebarLinks(authUser?.username).map(
                        ({ to, icon, label }) => (
                            <li
                                key={to}
                                className="flex justify-center md:justify-start"
                            >
                                <Link
                                    to={to}
                                    className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
                                >
                                    {icon}
                                    <span className="text-lg hidden md:block">
                                        {label}
                                    </span>
                                </Link>
                            </li>
                        )
                    )}
                </ul>

                {authUser && (
                    <div
                        ref={menuButtonRef}
                        className="mt-auto mb-7 mx-3 cursor-pointer relative flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] p-4 rounded-full"
                        onClick={toggleMenu}
                    >
                        <Link
                            to={`/profile/${authUser.username}`}
                            className="avatar hidden md:inline-flex"
                        >
                            <div className="max-w-[40px] rounded-full">
                                <img
                                    src={
                                        authUser?.profileImg ||
                                        '/avatars/placeholder.png'
                                    }
                                    alt="Profile"
                                />
                            </div>
                        </Link>
                        <div className="flex justify-between items-center flex-1">
                            <div className="hidden md:block">
                                <p className="text-white font-bold text-sm w-20 truncate">
                                    {authUser?.fullName}
                                </p>
                                <p className="text-slate-500 text-sm">
                                    @{authUser?.username}
                                </p>
                            </div>
                            <BsThreeDots />
                            {menuVisible && (
                                <div
                                    ref={menuRef}
                                    className="absolute left-0 -top-3 -translate-y-full bg-black w-[120%] z-10 text-white rounded-md shadow-[0_0_10px_2px_rgba(255,255,255,0.2)]"
                                >
                                    <ul className="py-2">
                                        <li
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={() =>
                                                alert('Navigate to Settings')
                                            }
                                        >
                                            Add an existing account
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                logout();
                                            }}
                                        >
                                            Log out @{authUser?.username}
                                        </li>
                                    </ul>
                                    <div className="absolute bg-black bottom-[-4px] left-1/2 w-2 h-2 rotate-45 shadow-right-bottom"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
