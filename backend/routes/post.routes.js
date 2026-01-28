import express from 'express';
import { comment, createPost, getPost, like } from '../controllers/post.controllers.js';
import isAuth from '../middleware/isAuth.js';
import upload from '../middleware/multer.js';

const postRouter = express.Router();

postRouter.post('/create', isAuth, upload.single("image"), createPost);
postRouter.get('/getpost', isAuth, getPost);
postRouter.put('/like/:id', isAuth, like); // <== Use PUT, not GET
postRouter.post('/comment/:id', isAuth, comment);

export default postRouter;
