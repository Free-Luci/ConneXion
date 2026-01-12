import express from "express";
import { addNewPost ,getAllPost,bookmarkPost,deletePost,getUserPost,likePost,dislikePost, addComment, getCommentsOfPost} from "../controllers/post_controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router=express.Router();
router.post("/newpost",isAuthenticated,upload.single('image'),addNewPost);
//  router.route('/newpost').post(isAuthenticated,upload.single('profilePicture'),addNewPost);
router.get("/showpost",isAuthenticated,getUserPost);
router.get("/allpost",isAuthenticated,getAllPost);
router.get('/:id/like', isAuthenticated, likePost);
router.get('/:id/dislike', isAuthenticated, dislikePost);
router.post('/:id/addcomment', isAuthenticated, addComment);
// router.post('/:id/addcomment', isAuthenticated, addComment);
router.post('/:id/addcomment/all', isAuthenticated, getCommentsOfPost);
router.delete('/:id/postdelete', isAuthenticated, deletePost);
router.get('/:id/bookmark', isAuthenticated, bookmarkPost);

router.route('/:id/addcomment').post(isAuthenticated, addComment);
export default router;