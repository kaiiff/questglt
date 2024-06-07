const express = require("express");
const {
  user_register,
  user_login,
  update_user_profile,
  changePassword,
  get_user_details,
  remove_user,
} = require("../controllers/userController");
const user_image = require("../middleware/multer");
const auth = require("../middleware/verifiedToken");
const router = express.Router();

router.post("/register_user", user_image.array("image", 10), user_register);
router.post("/login_user", user_login);
router.put(
  "/update_user_profile",
  user_image.single("image"),
  auth,
  update_user_profile
);
router.post("/changePassword", auth, changePassword);
router.get("/get_user_details/:role", auth, get_user_details);
router.delete("/remove_user/:role", auth, remove_user);

module.exports = router;
