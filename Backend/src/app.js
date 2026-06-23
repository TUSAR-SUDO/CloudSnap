const express = require('express')
const cors = require('cors')
const multer = require('multer')
const uploadFile = require("./services/storage.service")
const postModel = require("./models/post.model")
const authRoutes = require("./routes/auth.routes")
const authMiddleware = require("./middleware/auth.middleware")
const path = require("path")

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({storage:multer.memoryStorage()})

// Auth routes (public)
app.use('/auth', authRoutes)

// Protected routes
app.post('/create-post', authMiddleware, upload.single("image"), async (req, res)=>{
    console.log(req.file);

    const result = await uploadFile(req.file.buffer)

    const post = await postModel.create({
        image: result.url,
        caption: req.body.caption,
        user: req.user._id
    })

    return res.status(201).json({
        message: "post Created Successfully",
        post
    })
})

app.get("/posts", async (req, res )=>{
    const posts = await postModel.find().populate('user', 'fullName email')
    return res.status(200).json({
        message:"post fetched successfully",
        posts
    })
})

// Fallback to serve index.html for React Router client-side routing
app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;