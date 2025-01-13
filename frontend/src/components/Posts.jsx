import Post from './Post';
import { useQuery } from '@tanstack/react-query';
import PostSkeleton from './PostSkeleton';
import { useEffect } from 'react';
import apiUrl from '../utils/config';

const Posts = ({ feedType, username }) => {
    const getPostEndpoint = () => {
        switch (feedType) {
            case 'forYou':
                return `${apiUrl}/api/posts/all`;
            case 'following':
                return `${apiUrl}/api/posts/following`;
            case 'posts':
                return `${apiUrl}/api/posts/user/${username}`;
            case 'likes':
                return `${apiUrl}/api/posts/likes/${username}`;
            default:
                return `${apiUrl}/api/posts/all`;
        }
    };

    const POST_ENDPOINT = getPostEndpoint();

    const {
        data: posts,
        isLoading,
        refetch,
        isRefetching
    } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            try {
                const res = await fetch(POST_ENDPOINT, {
                    credentials: 'include'
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || 'Posts unabled to be fetched'
                    );
                }

                return data;
            } catch (error) {
                throw new Error(error);
            }
        }
    });

    useEffect(() => {
        refetch();
    }, [feedType, refetch, username]);

    return (
        <>
            {isLoading || isRefetching ? (
                <div className="flex flex-col justify-center">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            ) : !posts.length ? (
                <p className="text-center my-4">
                    No posts in this tab. Post something to see it here.
                </p>
            ) : (
                <>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </>
            )}
        </>
    );
};
export default Posts;
