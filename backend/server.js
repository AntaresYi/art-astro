const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // 确保你安装了 node-fetch
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors());
app.use(express.json());



const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1'; 
// Groq API Key
const GROQ_API_KEY = process.env.GROQ_API_KEY; 

// 代理端点 - 现在调用 Groq API
app.post('/api/ask', async (req, res) => {
    try {
        const { prompt } = req.body;

        
        if (!GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set in environment variables.');
            return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
        }

        const groqResponse = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`, 
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [
                    { role: "system", content: "You are a helpful assistant." }, 
                    { role: "user", content: prompt } 
                ],
                stream: false 
            })
        });

      
        if (!groqResponse.ok) {
            const errorData = await groqResponse.json();
            console.error('Groq API Error:', errorData);
            throw new Error(`Groq API request failed with status ${groqResponse.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await groqResponse.json();
        
        
        const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

        if (!answer) {
            throw new Error('No answer found in Groq API response.');
        }

        res.json({ answer: answer });
    } catch (error) {
        console.error('Error in /api/ask:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
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

const projectsDB = [];

app.post('/api/projects', upload.single('image'), (req, res) => {
    try {
        
        const requiredFields = ['title', 'year', 'category', 'description'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // create new project
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

        projectsDB.push(newProject);

        res.status(201).json(newProject);
    } catch (err) {
        console.error('Error saving project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// make sure has uploads dictionary
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}


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