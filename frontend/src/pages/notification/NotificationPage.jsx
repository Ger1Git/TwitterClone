import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa6';
import { IoTrashBin } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

const NotificationPage = () => {
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/notifications');

                if (!res.ok) {
                    throw new Error('An error occurred');
                }

                return res.json();
            } catch (error) {
                throw error;
            }
        }
    });

    const { mutate: deleteAllNotifications } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch('/api/notifications/all', {
                    method: 'DELETE'
                });

                if (!res.ok) {
                    throw new Error('An error occurred');
                }

                return res.json();
            } catch (error) {
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Notifications deleted');
            queryClient.invalidateQueries(['notifications']);
        },
        onError: () => {
            toast.error('Failed to delete notifications');
        }
    });

    const { mutate: deleteNotification } = useMutation({
        mutationFn: async (notificationId) => {
            try {
                const res = await fetch(
                    `/api/notifications/${notificationId}`,
                    {
                        method: 'DELETE'
                    }
                );

                if (!res.ok) {
                    throw new Error('An error occurred');
                }

                return res.json();
            } catch (error) {
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Notification deleted');
            queryClient.invalidateQueries(['notifications']);
        },
        onError: () => {
            toast.error('Failed to delete notifications');
        }
    });

    return (
        <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h1 className="font-bold">Notifications</h1>
                <div className="dropdown">
                    <button tabIndex={0} role="button">
                        <IoSettingsOutline
                            size={20}
                            className="transform transition-transform duration-500 ease-in-out hover:rotate-180"
                        />
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <a onClick={deleteAllNotifications}>
                                Delete all notifications
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            {isLoading ? (
                <div className="flex justify-center h-full items-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center p-4 font-bold">
                    No notifications 🤔
                </div>
            ) : (
                notifications.map((notification) => (
                    <div
                        className="border-b border-gray-700"
                        key={notification._id}
                    >
                        <div className="flex gap-3 p-4">
                            {notification.type === 'follow' ? (
                                <FaUser className="w-7 h-7 text-primary" />
                            ) : (
                                <FaHeart className="w-7 h-7 text-red-500" />
                            )}
                            <div className="flex justify-between flex-1">
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to={`/profile/${notification.from.username}`}
                                        className="w-8 rounded-full mr-2 overflow-hidden"
                                    >
                                        <img
                                            src={
                                                notification.from
                                                    .profileImage ||
                                                'avatars/placeholder.png'
                                            }
                                            alt="User Avatar"
                                        />
                                    </Link>
                                    <div>
                                        <span className="font-bold">
                                            @{notification.from.username}
                                        </span>
                                        <span className="ml-1">
                                            {notification.type === 'follow'
                                                ? 'followed you'
                                                : 'liked your post'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(
                                            new Date(notification.createdAt),
                                            { addSuffix: true }
                                        )}
                                    </span>
                                    <IoTrashBin
                                        className="hover:text-red-500 w-5 h-5"
                                        onClick={() =>
                                            deleteNotification(notification._id)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default NotificationPage;
