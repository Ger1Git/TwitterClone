import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

const PostCreator = () => {
  const [postContent, setPostContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const userData = {
    profileImage: "/avatars/boy1.png",
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    alert("Post created successfully");
  };

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
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={userData.profileImage || "/avatar-placeholder.png"} alt="User Avatar" />
        </div>
      </div>
      <form className='flex flex-col gap-2 w-full' onSubmit={handlePostSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='What is happening?!'
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        {imagePreview && (
          <div className='relative w-72 mx-auto'>
            <IoCloseSharp
              className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={clearImagePreview}
            />
            <img src={imagePreview} className='w-full mx-auto h-72 object-contain rounded' alt="Preview" />
          </div>
        )}

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => imageInputRef.current.click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>
          <input
            type='file'
            hidden
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
          />
          <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {false ? "Posting..." : "Post"}
          </button>
        </div>
        {false && <div className='text-red-500'>Something went wrong</div>}
      </form>
    </div>
  );
};

export default PostCreator;
