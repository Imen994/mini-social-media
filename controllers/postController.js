const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path'); 


exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    
    const image = req.file ? req.file.filename : null;

    const post = await Post.create({ 
      author: req.userId, 
      content,
      image 
    });
    
    res.status(201).json(post);
  } catch (err) {
    console.error('Erreur création post:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePic')
      .populate('comments.author', 'username profilePic')
      .sort({ createdAt: -1 });

    const postsWithImageUrl = posts.map(post => {
      const postObj = post.toObject();
      if (post.image) {
        postObj.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${post.image}`;
      }
      return postObj;
    });

    res.json(postsWithImageUrl);
  } catch (err) {
    console.error('Erreur getAllPosts:', err);  // <== Ajoute ça pour voir le détail
    res.status(500).json({ error: err.message });
  }
};


exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username profilePic')
      .sort({ createdAt: -1 });
    

    const postsWithImageUrl = posts.map(post => {
      if (post.image) {
        return {
          ...post.toObject(),
          imageUrl: `${req.protocol}://${req.get('host')}/uploads/${post.image}`
        };
      }
      return post;
    });

    res.json(postsWithImageUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId.toString();
    
    const likeIndex = post.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex !== -1) {
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.json({ message: 'Post unliked', likes: post.likes });
    } else {
      post.likes.push(userId);
      await post.save();
      return res.json({ message: 'Post liked', likes: post.likes });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    console.log('➡️ addComment - userId:', req.userId); // Ajoute un log i
    const comment = {
      author : req.userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    // Récupérer le post avec les informations utilisateur complètes
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'username profilePic')
      .populate('author', 'username profilePic');

    res.status(201).json(updatedPost);
  } catch (err) {
    console.error('Error in addComment:', err); 
    res.status(500).json({ error: err.message });
  }
};