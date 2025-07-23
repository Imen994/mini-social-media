const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const userRoutes = require('./routes/userRoute');
const app = express();
connectDB();


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/users', require('./routes/userRoute'));
app.use('/api/posts', require('./routes/postRoute'));


app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'interface1.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));