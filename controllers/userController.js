const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
       _id: user._id,
      name: user.name,
      email: user.email
  }
     });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// Follow another user
exports.followUser = async (req, res) => {
  try {
    const userId = req.userId;
    const targetId = req.params.id;

    console.log('➡️ followUser');
    console.log('userId:', userId);
    console.log('targetId:', targetId);

    if (userId === targetId) {
      console.log("❌ Can't follow yourself");
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      console.log('❌ User or target not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.following.includes(targetId)) {
      user.following.push(targetId);
      targetUser.followers.push(userId);

      await user.save();
      await targetUser.save();

      console.log(`✅ ${userId} followed ${targetId}`);
    } else {
      console.log(`⚠️ ${userId} already follows ${targetId}`);
    }

    res.status(200).json({ message: 'Followed user' });

  } catch (err) {
    console.error('❌ Error in followUser:', err);
    res.status(500).json({ message: err.message });
  }
};
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.userId;
    const targetId = req.params.id;

    console.log('➡️ unfollowUser');
    console.log('userId:', userId);
    console.log('targetId:', targetId);

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      console.log('❌ User or target not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.following = user.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    console.log(`✅ ${userId} unfollowed ${targetId}`);

    res.status(200).json({ message: 'Unfollowed user' });

  } catch (err) {
    console.error('❌ Error in unfollowUser:', err);
    res.status(500).json({ message: err.message });
  }
};


// controllers/userController.js
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('followers following posts');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      followers: user.followers,
      following: user.following,
      posts: user.posts
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
