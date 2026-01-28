import Post from "../models/post.models.js";
import UploadOnCloudinary from "../config/cloudinary.js";
import { io } from "../index.js"; // Make sure io is exported from your server

// ================= CREATE POST =================
export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    let image = null;

    if (req.file) {
      // Cloudinary returns an object, store only URL
      const uploaded = await UploadOnCloudinary(req.file.path);
      image = uploaded.url;
    }

    const newPost = await Post.create({
      author: req.userId,
      description,
      image,
    });

    return res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({ message: "Create post error" });
  }
};

// ================= GET POSTS =================
export const getPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstname lastname profileImage headline")
      .populate("comment.user", "firstname lastname profileImage headline")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get Post Error:", error);
    return res.status(500).json({ message: "Get post error" });
  }
};

// ================= LIKE / UNLIKE POST =================
export const like = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.like) post.like = [];

    const index = post.like.findIndex(id => id.toString() === userId.toString());
    let liked = false;

    if (index !== -1) {
      post.like.splice(index, 1); // unlike
    } else {
      post.like.push(userId); // like
      liked = true;
    }

    await post.save();

    // 🔥 Real-time socket emit
    io.emit("likeUpdated", { postId, like: post.like });

    return res.status(200).json({ likes: post.like, liked });
  } catch (error) {
    console.error("Like Error:", error);
    return res.status(500).json({ message: "Like error" });
  }
};

// ================= ADD COMMENT =================
export const comment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Content required" });

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comment: { content, user: userId } } },
      { new: true }
    ).populate("comment.user", "firstname lastname profileImage headline");

    if (!post) return res.status(404).json({ message: "Post not found" });

    // 🔥 Optionally, you can emit new comment for real-time updates
    io.emit("commentAdded", { postId, comment: post.comment });

    return res.status(200).json(post);
  } catch (error) {
    console.error("Comment Error:", error);
    return res.status(500).json({ message: "Comment error" });
  }
};
