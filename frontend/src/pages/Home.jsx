import React, { useContext, useRef, useState } from 'react'
import Nav from '../components/Nav'
import dp from '../assets/User.webp'
import Post from '../components/Post';
import { FaPlusCircle, FaCamera } from "react-icons/fa";
import { UserDataContext } from '../context/userContext';
import { HiPencil } from "react-icons/hi";
import EditProfile from '../components/EditProfile';
import { RxCross1 } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa6";
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';

function Home() {
  const { userData, edit, setEdit,postData,setPostData } = useContext(UserDataContext);
  const { serverUrl } = useContext(authDataContext);

  const [frontendImage, setfrontndImage] = useState("");
  const [backendImage, setbackendImage] = useState("");
  const [description, setdescription] = useState("");
  const [uploadPost, setUploadPost] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ NEW

  const image = useRef();

  function handleImage(e) {
    let file = e.target.files[0];
    setbackendImage(file);
    setfrontndImage(URL.createObjectURL(file));
  }

  async function handleUploadPost() {
    if (loading) return;

    try {
      setLoading(true); // ✅ start loading

      let formdata = new FormData();
      formdata.append("description", description);
      if (backendImage) {
        formdata.append("image", backendImage);
      }

      const result = await axios.post(
        serverUrl + '/api/post/create',
        formdata,
        { withCredentials: true }
      );

      console.log(result);

      // ✅ reset after success
      setdescription("");
      setbackendImage("");
      setfrontndImage("");
      setUploadPost(false);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#eceade]">
      {edit && <EditProfile />}
      <Nav />

      <div className="w-full min-h-screen pt-[20px] flex flex-col lg:flex-row items-start justify-center gap-[20px] px-[20px]">

        {/* LEFT */}
        <div className="w-full lg:w-[25%] min-h-[200px] bg-white shadow-lg rounded-lg overflow-hidden">
          {/* cover */}
          <div
            className="w-full h-[100px] bg-gray-400 relative cursor-pointer"
            onClick={() => setEdit(true)}
          >
            <img
              src={userData?.coverImage || 'https://via.placeholder.com/400x100'}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
              <FaCamera className="text-blue-600" />
            </span>
          </div>

          {/* profile */}
          <div className="relative flex justify-center">
            <div
              className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-4 border-white -mt-[35px] cursor-pointer"
              onClick={() => setEdit(true)}
            >
              <img src={userData?.profileImage || dp} className="w-full h-full object-cover" />
              <span className="absolute bottom-[5px] right-[8px] bg-white rounded-full p-[3px] shadow-md">
                <FaPlusCircle className="text-blue-600 text-[18px]" />
              </span>
            </div>
          </div>

          <div className="px-5 pt-2 pb-4 text-center">
            <h3 className="font-semibold">{userData?.firstname} {userData?.lastname}</h3>
            <p className="text-sm text-gray-500">{userData.headline}</p>
            <p className="text-sm text-gray-500">{userData.location}</p>

            <button
              onClick={() => setEdit(true)}
              className="mt-3 text-sm px-4 py-2 border border-violet-700 text-violet-700 rounded-full flex items-center justify-center gap-2 hover:bg-violet-50"
            >
              Edit Profile <HiPencil />
            </button>
          </div>
        </div>

        {/* POPUP */}
        {uploadPost && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
            <div className="w-[90%] max-w-[520px] h-[620px] bg-white rounded-xl shadow-xl relative flex flex-col">

              <button
                onClick={() => setUploadPost(false)}
                className="absolute top-3 right-3"
                disabled={loading}
              >
                <RxCross1 className="w-6 h-6 text-gray-600" />
              </button>

              {/* header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b">
                <img
                  src={userData.profileImage || dp}
                  className="w-[52px] h-[52px] rounded-full object-cover"
                />
                <div className="font-semibold">
                  {userData.firstname} {userData.lastname}
                </div>
              </div>

              {/* body */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                <textarea
                  className={`w-full resize-none outline-none text-[18px]
                  ${frontendImage ? "h-[120px]" : "min-h-[240px]"}`}
                  placeholder="What do you want to talk about?"
                  value={description}
                  onChange={(e) => setdescription(e.target.value)}
                  disabled={loading}
                />

                {frontendImage && (
                  <div className="max-h-[260px] overflow-hidden rounded-xl border">
                    <img src={frontendImage} className="w-full h-full object-cover" />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  ref={image}
                  accept="image/*"
                  onChange={handleImage}
                />
              </div>

              {/* footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t">
                <FaRegImage
                  className="w-[22px] h-[22px] text-gray-500 cursor-pointer"
                  onClick={() => !loading && image.current.click()}
                />

                <button
                  onClick={handleUploadPost}
                  disabled={loading || (!description && !backendImage)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold
                  hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CENTER */}
      <div className="w-full lg:w-[50%] bg-[#f0efe7] shadow-lg px-5 py-4 rounded-xl flex flex-col gap-4">
  
  <div className="bg-white shadow-md rounded-xl flex items-center gap-4 px-4 h-[110px]">
    <img
      src={userData.profileImage || dp}
      className="w-[55px] h-[55px] rounded-full object-cover"
    />
    <button
      onClick={() => setUploadPost(true)}
      className="flex-1 h-[50px] border border-gray-400 rounded-full px-5 text-gray-600 hover:bg-gray-100"
    >
      Start a post
    </button>
  </div>
  
{postData.map((post, index) => (
  <Post
    key={index}
    id={post._id}
    author={post.author}
    description={post.description}
    image={post.image}
    like={post.like}
    comment={post.comment}
    createdAt={post.createdAt}
  />
))}


</div>


        {/* RIGHT */}
        <div className="w-full lg:w-[25%] bg-white shadow-lg px-5 rounded-lg">
          Right
        </div>

      </div>
    </div>
  )
}

export default Home;
