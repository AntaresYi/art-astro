
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 代理端点
app.post('/api/ask', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false
            })
        });
        
        const data = await ollamaResponse.json();
        res.json({ answer: data.response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// 配置文件上传
const upload = multer({
    storage: multer.diskStorage({
        destination: 'public/uploads/',
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${uuidv4()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 添加上传路由
app.post('/api/projects', upload.single('image'), (req, res) => {
    try {
        // 验证数据
        const requiredFields = ['title', 'year', 'category', 'description'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // 构造新项目
        const newProject = {
            id: uuidv4(),
            title: req.body.title,
            year: parseInt(req.body.year),
            category: req.body.category,
            contributors: Array.isArray(req.body.contributors) 
                ? req.body.contributors 
                : JSON.parse(req.body.contributors),
            description: req.body.description,
            keywords: req.body.keywords ? 
                (Array.isArray(req.body.keywords) ? req.body.keywords : JSON.parse(req.body.keywords)) 
                : [],
            link: req.body.link || '',
            image: req.file ? `/uploads/${req.file.filename}` : 'default.jpg',
            createdAt: new Date().toISOString()
        };

        // 这里应该将newProject存入数据库
        // 示例中暂时保存在内存
        projectsDB.push(newProject); // 假设projectsDB是你的数据存储

        res.status(201).json(newProject);
    } catch (err) {
        console.error('Error saving project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 确保有上传目录

if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}