import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const { data: suggestedUsers, isLoading } = useQuery({
        queryKey: ['suggestedUsers', debouncedSearchQuery],
        queryFn: async () => {
            try {
                const res = await fetch(
                    `/api/users?search=${debouncedSearchQuery}`
                );

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                const data = await res.json();
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        enabled: !!debouncedSearchQuery
    });

    const handleChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <div className="relative w-72">
            {/* Search Input */}
            <div className="group flex items-center bg-[#202327] rounded-full px-4 py-2 shadow-md w-full border-2 border-gray-600 focus-within:border-blue-500">
                <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-4.35-4.35m1.85-5.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                    />
                </svg>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleChange}
                    className="ml-3 bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none w-full"
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-500 ml-2"
                    >
                        X
                    </button>
                )}
            </div>

            {/* Results Panel */}
            {debouncedSearchQuery && !isLoading && (
                <div className="w-full mt-1 p-3 bg-[#202327] rounded-lg shadow-md max-h-60 overflow-y-auto">
                    {suggestedUsers?.length === 0 ? (
                        <p className="text-gray-500">No results found</p>
                    ) : (
                        suggestedUsers?.map((user) => (
                            <Link
                                to={`/profile/${user.username}`}
                                key={user._id}
                                className="text-gray-300 py-2 px-3 hover:bg-[#3a3f44] rounded-md cursor-pointer"
                            >
                                <p className="font-bold">{user.fullName}</p>
                                <p className="text-sm">{user.username}</p>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {isLoading && <p className="text-gray-500">Loading...</p>}
        </div>
    );
};

export default Search;
