const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const {
  register,
  login,
  getProfile,
  followUser,
  unfollowUser,
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', getProfile);
router.put('/:id/follow', auth, followUser);
router.put('/:id/unfollow', auth, unfollowUser);

module.exports = router;

