import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Posts from '../../components/Posts';
import ProfileHeaderSkeleton from '../../components/ProfileHeaderSkeleton';
import EditProfileModal from './components/EditProfileModal';
import { POSTS } from '../../utils/utils';
import { FaArrowLeft } from 'react-icons/fa6';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaLink } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import useFollow from '../../hooks/useFollow';
import apiUrl from '../../utils/config';

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState('posts');

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { username } = useParams();
    const { follow, isPending } = useFollow();
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({
        queryKey: ['authUser']
    });

    const {
        data: user,
        isLoading,
        refetch,
        isRefetching
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const res = await fetch(
                    `${apiUrl}/api/users/profile/${username}`,
                    {
                        credentials: 'include'
                    }
                );

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                return res.json();
            } catch (error) {
                toast.error(error.message);
            }
        }
    });

    const { mutate: updateProfile, isPending: isUpdating } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/users/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        coverImg,
                        profileImg
                    })
                });

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                return res.json();
            } catch (error) {
                toast.error(error.message);
            }
        },
        onSuccess: () => {
            toast.success('Profile updated successfully');
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
                queryClient.invalidateQueries({ queryKey: ['authUser'] })
            ]);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const userCreatedAt = user && format(new Date(user.createdAt), 'MMMM yyyy');
    const isMyProfile = authUser?._id === user?._id;
    const userFollowed = authUser?.following.includes(user?._id);

    useEffect(() => {
        refetch();
    }, [username, refetch]);

    const handleImgChange = (e, state) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                state === 'coverImg' && setCoverImg(reader.result);
                state === 'profileImg' && setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
            {/* HEADER */}
            {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
            {!isLoading && !isRefetching && !user && (
                <p className="text-center text-lg mt-4">User not found</p>
            )}
            <div className="flex flex-col">
                {!isLoading && !isRefetching && user && (
                    <>
                        <div className="flex gap-10 px-4 py-2 items-center">
                            <Link to="/">
                                <FaArrowLeft className="w-4 h-4" />
                            </Link>
                            <div className="flex flex-col">
                                <p className="font-bold text-lg">
                                    {user?.fullName}
                                </p>
                                <span className="text-sm text-slate-500">
                                    {POSTS?.length} posts
                                </span>
                            </div>
                        </div>
                        {/* COVER IMG */}
                        <div className="relative group">
                            {coverImg ? (
                                <img
                                    src={
                                        coverImg ||
                                        user?.coverImg ||
                                        '/avatars/cover.png'
                                    }
                                    className="h-52 w-full object-cover"
                                    alt="cover image"
                                />
                            ) : (
                                <div className="bg-gray-800 h-52 w-full"></div>
                            )}

                            {isMyProfile && (
                                <div
                                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200"
                                    onClick={() => coverImgRef.current.click()}
                                >
                                    <MdEdit className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                ref={coverImgRef}
                                onChange={(e) => handleImgChange(e, 'coverImg')}
                            />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                ref={profileImgRef}
                                onChange={(e) =>
                                    handleImgChange(e, 'profileImg')
                                }
                            />
                            {/* USER AVATAR */}
                            <div className="inline-flex absolute -bottom-16 left-4">
                                <div className="w-32 rounded-full relative overflow-hidden group border-3 border-black">
                                    <img
                                        src={
                                            profileImg ||
                                            user?.profileImg ||
                                            '/avatars/placeholder.png'
                                        }
                                    />
                                    <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover:opacity-100 opacity-0 cursor-pointer">
                                        {isMyProfile && (
                                            <MdEdit
                                                className="w-4 h-4 text-white"
                                                onClick={() =>
                                                    profileImgRef.current.click()
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end px-4 mt-5">
                            {isMyProfile && <EditProfileModal />}
                            {!isMyProfile && (
                                <button
                                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                                    onClick={() => follow(user?._id)}
                                >
                                    {isPending
                                        ? 'Loading...'
                                        : userFollowed
                                        ? 'Unfollow'
                                        : 'Follow'}
                                </button>
                            )}
                            {(coverImg || profileImg) && (
                                <button
                                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                                    onClick={() =>
                                        updateProfile({ coverImg, profileImg })
                                    }
                                >
                                    {isUpdating ? 'Updating...' : 'Update'}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 mt-10 px-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">
                                    {user?.fullName}
                                </span>
                                <span className="text-sm text-slate-500">
                                    @{user?.username}
                                </span>
                                {user?.bio && (
                                    <span className="text-sm my-1">
                                        {user?.bio}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {user?.link && (
                                    <div className="flex gap-1 items-center ">
                                        <>
                                            <FaLink className="w-3 h-3 text-slate-500" />
                                            <a
                                                href="https://youtube.com/@asaprogrammer_"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-blue-500 hover:underline"
                                            >
                                                youtube.com/@asaprogrammer_
                                            </a>
                                        </>
                                    </div>
                                )}
                                {userCreatedAt && (
                                    <div className="flex gap-2 items-center">
                                        <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-500">
                                            {userCreatedAt}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex gap-1 items-center">
                                    <span className="font-bold text-xs">
                                        {user?.following.length}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        Following
                                    </span>
                                </div>
                                <div className="flex gap-1 items-center">
                                    <span className="font-bold text-xs">
                                        {user?.followers.length}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        Followers
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full border-b border-gray-700 mt-4 relative">
                            {/* Posts Tab */}
                            <div
                                className={`flex justify-center flex-1 p-3 transition duration-300 cursor-pointer ${
                                    feedType === 'posts'
                                        ? 'text-white'
                                        : 'text-slate-500'
                                }`}
                                onClick={() => setFeedType('posts')}
                            >
                                Posts
                            </div>

                            {/* Likes Tab */}
                            <div
                                className={`flex justify-center flex-1 p-3 transition duration-300 cursor-pointer ${
                                    feedType === 'likes'
                                        ? 'text-white'
                                        : 'text-slate-500'
                                }`}
                                onClick={() => setFeedType('likes')}
                            >
                                Likes
                            </div>

                            {/* Indicator */}
                            <div
                                className="absolute bottom-0 w-10 h-1 rounded-full bg-primary transition-all duration-300"
                                style={{
                                    left: feedType === 'posts' ? '22%' : '75%',
                                    transform:
                                        feedType === 'likes'
                                            ? 'translateX(-50%)'
                                            : 'none'
                                }}
                            />
                        </div>
                    </>
                )}

                <Posts feedType={feedType} username={username} />
            </div>
        </div>
    );
};

export default ProfilePage;
