const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');  // Importer le middleware d'upload

const postController = require('../controllers/postController');
const {
  createPost,
  getAllPosts,
  getUserPosts,
  toggleLike,
  addComment
} = require('../controllers/postController');

// Utiliser le middleware upload que tu as défini dans le fichier 'middleware/upload.js'
router.post('/', auth, upload.single('image'), createPost);

router.get('/', auth, getAllPosts);                  // Tous les posts
router.get('/user/:userId', auth, getUserPosts);     // Posts d’un utilisateur
router.put('/like/:id', auth, toggleLike);           // Liker / unliker
router.post('/comment/:id', auth, addComment);       // Ajouter un commentaire

module.exports = router;
