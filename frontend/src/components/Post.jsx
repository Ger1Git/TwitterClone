import {
    FaRegComment,
    FaHeart,
    FaRegHeart,
    FaRegBookmark,
    FaTrash
} from 'react-icons/fa';
import { BiRepost } from 'react-icons/bi';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import apiUrl from '../utils/config';

const Post = ({ post }) => {
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });
    const isUserPostOwner = authUser?._id === post.user._id;
    const [hasLikedPost, setHasLikedPost] = useState(
        post.isLikedByUser || authUser?.likedPosts.includes(post._id)
    );

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${apiUrl}/api/posts/delete/${post._id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete post');
        },
        onSuccess: () => {
            toast.success('Post deleted successfully');
            queryClient.invalidateQueries(['posts']);
        }
    });

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${apiUrl}/api/posts/like/${post._id}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Failed to like/unlike post');
            return await res.json();
        },
        onSuccess: ({ likes, isLikedByUser }) => {
            queryClient.setQueryData(['posts'], (oldData) =>
                oldData.map((p) =>
                    p._id === post._id ? { ...p, likes, isLikedByUser } : p
                )
            );

            setHasLikedPost(isLikedByUser);
        },
        onError: () => {
            toast.error('Failed to like/unlike the post');
        }
    });

    const { mutate: commentPost, isPending: isCommenting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${apiUrl}/api/posts/comment/${post._id}`, {
                method: 'POST',
                body: JSON.stringify({ text: newComment }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error('Failed to comment on post');
            }

            return await res.json();
        },
        onSuccess: (comment) => {
            queryClient.setQueryData(['posts'], (oldData) =>
                oldData.map((p) =>
                    p._id === post._id
                        ? { ...p, comments: [...p.comments, comment] }
                        : p
                )
            );
            setNewComment('');
        }
    });

    const toggleLikePost = () => {
        if (isLiking) return;
        likePost();
    };

    const postAuthor = post.user;
    const postDate = formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true
    });
    const isSubmittingComment = true;

    const submitComment = (e) => {
        e.preventDefault();

        if (isCommenting) return;
        commentPost();
    };

    return (
        <div className="flex gap-2 items-start p-4 border-b border-gray-700">
            <div className="avatar">
                <Link
                    to={`/profile/${postAuthor.username}`}
                    className="w-10 mt-1 rounded-full overflow-hidden"
                >
                    <img
                        src={
                            postAuthor.profileImg || '/avatars/placeholder.png'
                        }
                        alt="Author Avatar"
                    />
                </Link>
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex gap-2 items-center">
                    <Link
                        to={`/profile/${postAuthor.username}`}
                        className="font-bold"
                    >
                        {postAuthor.fullName}
                    </Link>
                    <span className="text-gray-700 flex gap-1 text-sm">
                        <Link to={`/profile/${postAuthor.username}`}>
                            @{postAuthor.username}
                        </Link>
                        <span>·</span>
                        <span>{postDate}</span>
                    </span>
                    {isUserPostOwner && (
                        <span className="flex justify-end flex-1">
                            {isDeleting ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <FaTrash
                                    className="cursor-pointer hover:text-red-500"
                                    onClick={() => deletePost()}
                                />
                            )}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-3 overflow-hidden">
                    <span>{post.text}</span>
                    {post.image && (
                        <img
                            src={post.image}
                            className="h-80 object-cover rounded-xl border border-gray-700"
                            alt="Post Content"
                        />
                    )}
                </div>
                <div className="flex justify-between mt-3">
                    <div className="flex gap-4 items-center w-2/3 justify-between">
                        <div
                            className="flex gap-1 items-center cursor-pointer group"
                            onClick={() =>
                                document.getElementById(post._id).showModal()
                            }
                        >
                            <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                            <span className="text-sm text-slate-500 group-hover:text-sky-400">
                                {post.comments.length}
                            </span>
                        </div>
                        {/* Comments Modal */}
                        <dialog
                            id={post._id}
                            className="modal border-none outline-none"
                        >
                            <div className="modal-box rounded border border-gray-600">
                                <h3 className="font-bold text-lg mb-2">
                                    COMMENTS
                                </h3>
                                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                                    {post.comments.length === 0 && (
                                        <p className="text-sm text-slate-500">
                                            No comments yet 🤔 Be the first one
                                            😉
                                        </p>
                                    )}
                                    {post.comments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            className="flex gap-2 items-center"
                                        >
                                            <div className="avatar">
                                                <div className="w-8 rounded-full">
                                                    <img
                                                        src={
                                                            comment.user
                                                                .profileImg ||
                                                            '/avatar-placeholder.png'
                                                        }
                                                        alt="Commenter Avatar"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">
                                                        {comment.user.fullName}
                                                    </span>
                                                    <span className="text-gray-700 text-sm">
                                                        @{comment.user.username}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    {comment.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form
                                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                                    onSubmit={submitComment}
                                >
                                    <textarea
                                        className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) =>
                                            setNewComment(e.target.value)
                                        }
                                    />
                                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                                        {isSubmittingComment ? (
                                            <LoadingSpinner size="md" />
                                        ) : (
                                            'Post'
                                        )}
                                    </button>
                                </form>
                            </div>
                            <form method="dialog" className="modal-backdrop">
                                <button className="outline-none">close</button>
                            </form>
                        </dialog>
                        <div className="flex gap-1 items-center group cursor-pointer">
                            <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                            <span className="text-sm text-slate-500 group-hover:text-green-500">
                                0
                            </span>
                        </div>
                        <div
                            className="flex gap-1 items-center group cursor-pointer"
                            onClick={toggleLikePost}
                        >
                            {hasLikedPost ? (
                                <FaHeart
                                    className="w-4 h-4 cursor-pointer text-pink-500"
                                    fill="#ec4899"
                                />
                            ) : (
                                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                            )}
                            <span
                                className={`text-sm group-hover:text-pink-500 ${
                                    hasLikedPost
                                        ? 'text-pink-500'
                                        : 'text-slate-500'
                                }`}
                            >
                                {post?.likes?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className="flex w-1/3 justify-end gap-2 items-center">
                        <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
