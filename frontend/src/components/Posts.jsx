import Post from "./Post";
import PostSkeleton from "./PostSkeleton";
import { POSTS } from "../utils/dummy";

const Posts = () => {
	const isLoading = false;

	return (
		<>
			{isLoading ? (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			) : POSTS.length === 0 ? (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			) : (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;