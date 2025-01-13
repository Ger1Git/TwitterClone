import { Link } from 'react-router-dom';
import SuggestedUserSkeleton from './SuggestedUserSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import useFollow from '../hooks/useFollow';
import LoadingSpinner from './LoadingSpinner';
import apiUrl from '../utils/config';

const SuggestedUsers = () => {
    const [pendingFollow, setPendingFollow] = useState(null);
    const { follow, isPending } = useFollow();

    const { data: suggestedUsers, isLoading } = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/users/suggestions`, {
                    credentials: 'include'
                });

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                const data = await res.json();

                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    });

    const handleFollow = (userId) => {
        setPendingFollow(userId);
        let d = follow(userId);
    };

    if (!suggestedUsers?.length) {
        return <div className="md:w-64 w-9"></div>;
    }

    return (
        <div className="hidden lg:block my-4 bg-black p-4 rounded-lg sticky top-2 border border-slate-700">
            <p className="font-bold mb-4">Who to follow</p>
            <div className="flex flex-col gap-4">
                {isLoading && (
                    <>
                        <SuggestedUserSkeleton />
                        <SuggestedUserSkeleton />
                        <SuggestedUserSkeleton />
                        <SuggestedUserSkeleton />
                    </>
                )}
                {!isLoading &&
                    suggestedUsers?.map((user) => (
                        <Link
                            to={`/profile/${user.username}`}
                            className="flex items-center justify-between gap-4"
                            key={user._id}
                        >
                            <div className="flex gap-2 items-center">
                                <div className="avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            src={
                                                user.profileImg ||
                                                '/avatars/placeholder.png'
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold tracking-tight truncate w-28">
                                        {user.fullName}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        @{user.username}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <button
                                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleFollow(user._id);
                                    }}
                                >
                                    {pendingFollow === user._id ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        'Follow'
                                    )}
                                </button>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default SuggestedUsers;
