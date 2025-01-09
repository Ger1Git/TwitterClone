import Post from './Post';
import { useQuery } from '@tanstack/react-query';
import PostSkeleton from './PostSkeleton';
import { useEffect } from 'react';

const Posts = ({ feedType }) => {
    const getPostEndpoint = () => {
        switch (feedType) {
            case 'forYou':
                return '/api/posts/all';
            case 'following':
                return '/api/posts/following';
            default:
                return '/api/posts/all';
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
                const res = await fetch(POST_ENDPOINT);
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
    }, [feedType, refetch]);

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
                    No posts in this tab. Switch 👻
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
