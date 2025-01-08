import { CiImageOn } from 'react-icons/ci';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { useRef, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const PostCreator = () => {
    const [postContent, setPostContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const { data: authUser } = useQuery({
        queryKey: ['authUser']
    });

    const queryClient = useQueryClient();
    const {
        mutate: createPost,
        isPending,
        isError,
        error
    } = useMutation({
        mutationFn: async ({ text, image }) => {
            try {
                const res = await fetch('/api/posts/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text, image })
                });

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                const data = await res.json();

                return data;
            } catch (error) {
                throw new Error(error);
            }
        },

        onSuccess: () => {
            setPostContent('');
            setImagePreview(null);
            toast.success('Post created succesfully');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });

    const handleImageUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            previewImage(selectedFile);
        }
    };

    const previewImage = (file) => {
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const clearImagePreview = () => {
        setImagePreview(null);
        imageInputRef.current.value = null;
    };

    return (
        <div className="flex p-4 items-start gap-4 border-b border-gray-700">
            <div className="avatar">
                <div className="w-8 rounded-full">
                    <img
                        src={authUser.profileImage || 'avatars/placeholder.png'}
                        alt="User Avatar"
                    />
                </div>
            </div>
            <form
                className="flex flex-col gap-2 w-full"
                onSubmit={(e) => {
                    e.preventDefault();
                    createPost({ text: postContent, image: imagePreview });
                }}
            >
                <textarea
                    className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
                    placeholder="What is happening?!"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                />
                {imagePreview && (
                    <div className="relative w-72 mx-auto">
                        <IoCloseSharp
                            className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                            onClick={clearImagePreview}
                        />
                        <img
                            src={imagePreview}
                            className="w-full mx-auto h-72 object-contain rounded"
                            alt="Preview"
                        />
                    </div>
                )}

                <div className="flex justify-between border-t py-2 border-t-gray-700">
                    <div className="flex gap-1 items-center">
                        <CiImageOn
                            className="fill-primary w-6 h-6 cursor-pointer"
                            onClick={() => imageInputRef.current.click()}
                        />
                        <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
                    </div>
                    <input
                        type="file"
                        hidden
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
                {isError && <div className="text-red-500">{error.message}</div>}
            </form>
        </div>
    );
};

export default PostCreator;
