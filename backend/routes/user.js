import express from "express";
import { getProfile, register,login,logout, editProfile, getSuggestedUsers, followOrUnfollow} from "../controllers/user_controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router=express.Router();

// router.route("/register").post(register);
// router.route('/login').post(login);
// router.route('/logout').get(logout);
// router.route('/:id/profile').get(isAuthenticated,getProfile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'),editProfile);
router.route('/suggested').get(isAuthenticated,getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated,followOrUnfollow);


router.post("/register",register);
router.post("/login",login);
router.get('/logout',logout);
router.get('/:id/profile',isAuthenticated,getProfile);
// router.post('/profile/edit',isAuthenticated,upload.single('profilePicture'),editProfile);
export default router ;