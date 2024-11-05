import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const isLoading = false; // This would typically be a state variable
	const notificationsList = [
		{
			id: "1",
			sender: {
				id: "1",
				username: "johndoe",
				profileImage: "/avatars/boy2.png",
			},
			notificationType: "follow",
		},
		{
			id: "2",
			sender: {
				id: "2",
				username: "janedoe",
				profileImage: "/avatars/girl1.png",
			},
			notificationType: "like",
		},
	];

	const handleDeleteNotifications = () => {
		alert("All notifications deleted");
	};

	return (
		<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
			<div className='flex justify-between items-center p-4 border-b border-gray-700'>
				<h1 className='font-bold'>Notifications</h1>
				<div className='dropdown'>
					<button tabIndex={0} role='button' className='m-1'>
						<IoSettingsOutline className='w-4' />
					</button>
					<ul
						tabIndex={0}
						className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
					>
						<li>
							<a onClick={handleDeleteNotifications}>Delete all notifications</a>
						</li>
					</ul>
				</div>
			</div>
			{isLoading ? (
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			) : notificationsList.length === 0 ? (
				<div className='text-center p-4 font-bold'>No notifications 🤔</div>
			) : (
				notificationsList.map((notification) => (
					<div className='border-b border-gray-700' key={notification.id}>
						<div className='flex gap-2 p-4'>
							{notification.notificationType === "follow" ? (
								<FaUser className='w-7 h-7 text-primary' />
							) : (
								<FaHeart className='w-7 h-7 text-red-500' />
							)}
							<Link to={`/profile/${notification.sender.username}`} className='flex items-center'>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.sender.profileImage || "/avatar-placeholder.png"} alt="User Avatar" />
									</div>
								</div>
								<span className='font-bold'>@{notification.sender.username}</span>
								<span className='ml-1'>
									{notification.notificationType === "follow" ? "followed you" : "liked your post"}
								</span>
							</Link>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default NotificationPage;
