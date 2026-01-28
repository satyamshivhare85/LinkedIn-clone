import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import dp from "../assets/User.webp";
import moment from "moment";
import { FaThumbsUp, FaRegCommentDots } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";
import ConnectionButton from "./ConnectionButton";

function Post({ id, author, like = [], comment = [], description, image, createdAt }) {
  const { userData } = useContext(UserDataContext);
  const { serverUrl } = useContext(authDataContext);

  // STATES
  const [expanded, setExpanded] = useState(false);
  const [likesState, setLikesState] = useState(like);
  const [liked, setLiked] = useState(like.includes(userData?._id));
  const [comments, setComments] = useState(comment);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // SOCKET
  const socketRef = useRef(null);
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(serverUrl, { withCredentials: true });
    }

    const handleLikeUpdated = ({ postId, like }) => {
      if (postId === id) {
        setLikesState(like);
        setLiked(like.includes(userData?._id));
      }
    };

    const handleCommentAdded = ({ postId, comment }) => {
      if (postId === id) {
        setComments(comment);
      }
    };

    socketRef.current.on("likeUpdated", handleLikeUpdated);
    socketRef.current.on("commentAdded", handleCommentAdded);

    return () => {
      socketRef.current.off("likeUpdated", handleLikeUpdated);
      socketRef.current.off("commentAdded", handleCommentAdded);
    };
  }, [id, serverUrl, userData?._id]);

  // LIKE POST
  const likePost = async () => {
    try {
      const res = await axios.put(`${serverUrl}/api/post/like/${id}`, {}, { withCredentials: true });
      if (res?.data?.likes) {
        setLikesState(res.data.likes);
        setLiked(res.data.likes.includes(userData?._id));
      }
    } catch (err) {
      console.error("Like Error:", err);
    }
  };

  // ADD COMMENT
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `${serverUrl}/api/post/comment/${id}`,
        { content: newComment },
        { withCredentials: true }
      );
      setComments(res.data.comment);
      setNewComment("");
      setShowComments(true);
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={author?.profileImage || dp}
            alt={author?.firstname}
            className="w-[52px] h-[52px] rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-[15px]">{author?.firstname} {author?.lastname}</p>
            <p className="text-sm text-gray-500">{author?.headline}</p>
            <p className="text-xs text-gray-400">{moment(createdAt).fromNow()}</p>
          </div>
        </div>

        {userData?._id !== author?._id && (
          <div className="min-w-[90px] h-[34px] flex items-center justify-end">
            <ConnectionButton userId={author._id} />
          </div>
        )}
      </div>

      {/* DESCRIPTION */}
      {description && (
        <div className="mt-4 text-gray-800 text-[15px]">
          <p className={`${expanded ? "" : "line-clamp-3"}`}>{description}</p>
          {description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-sm mt-1 hover:underline cursor-pointer"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* IMAGE */}
      {image && (
        <div className="mt-4 rounded-xl overflow-hidden border">
          <img src={image} className="w-full max-h-[420px] object-cover" alt="Post visual content" />
        </div>
      )}

      {/* LIKE & COMMENT SECTION */}
      <div className="mt-4 border-t pt-3">
        {/* COUNTS */}
        <div className="flex justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FaThumbsUp className={liked ? "text-blue-500" : "text-gray-400"} />
            {liked ? `You and ${likesState.length - 1} others` : `${likesState.length} Likes`}
          </span>
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
            {comments.length} Comments
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mt-2 border-t pt-2 text-sm">
          <button
            onClick={likePost}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition active:scale-95
              ${liked ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <FaThumbsUp /> {liked ? "Liked" : "Like"}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition cursor-pointer"
          >
            <FaRegCommentDots /> Comment
          </button>
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="mt-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border rounded-lg p-2 text-sm"
              rows="2"
            />
            <button
              onClick={addComment}
              className="mt-1 text-sm text-blue-600 font-semibold cursor-pointer"
            >
              Post
            </button>

            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {comments.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <img
                    src={c.user?.profileImage || dp}
                    alt={c.user?.firstname}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                  />
                  <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm">
                    <p className="font-semibold">{c.user?.firstname} {c.user?.lastname}</p>
                    <p>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Post;
