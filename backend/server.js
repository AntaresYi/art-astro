// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // Re-introduce node-fetch for Groq API calls
const helmet = require('helmet'); // For security headers
const rateLimit = require('express-rate-limit'); // For rate limiting

// Load environment variables from .env file
dotenv.config();

// Import Mongoose models
const Project = require('./models/project');
const User = require('./models/user'); // For admin users

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security Middleware ---
app.use(helmet()); // Apply security headers
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increase limit for descriptions
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Rate limiting for API requests to prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter); // Apply to all /api routes

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        // Optional: Create a default admin user if none exists
        createDefaultAdminUser();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if cannot connect to DB
    });

// Function to create a default admin user if none exists
async function createDefaultAdminUser() {
    try {
        const adminCount = await User.countDocuments({ isAdmin: true });
        if (adminCount === 0) {
            const defaultAdminUsername = 'admin';
            const defaultAdminEmail = process.env.ADMIN_EMAIL;
            const defaultAdminPassword = process.env.ADMIN_PASSWORD;

            if (!defaultAdminEmail || !defaultAdminPassword) {
                console.warn('WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping default admin creation.');
                console.warn('Please set them to enable admin functionalities.');
                return;
            }

            const newAdmin = new User({
                username: defaultAdminUsername,
                password: defaultAdminPassword, // This will be hashed by the pre-save hook
                email: defaultAdminEmail,
                isAdmin: true
            });
            await newAdmin.save();
            console.log('Default admin user created successfully!');
        }
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }
}

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for handling file uploads (Cloudinary will take over storing)
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
        }
    }
});

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service (e.g., 'outlook', 'smtp.yourdomain.com')
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

// Middleware to check if user is an admin

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        console.log('Decoded token payload (backend):', decoded); 
        console.log('isAdmin from decoded token (backend):', decoded.isAdmin); 

        req.userId = decoded.id;
        req.isAdmin = decoded.isAdmin;

        if (!req.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin access required.' });
        }

        next();
    } catch (error) {
        console.error('Authentication failed:', error);
        return res.status(401).json({ message: 'Authentication failed: Invalid or expired token.' });
    }
};

/**
 * Extracts unique categories from a list of projects.
 * @param {Array} projects - Array of project objects.
 * @returns {Array} - Array of unique category strings.
 */
function getUniqueCategories(projects) {
    const categories = new Set();
    projects.forEach(project => {
        if (project.category) {
            categories.add(project.category);
        }
    });
    return Array.from(categories);
}

/**
 * Selects a specified number of random project examples with links for the AI prompt.
 * @param {Array} projects - Array of project objects.
 * @param {number} count - The number of examples to select.
 * @returns {string} - A formatted string of project examples.
 */
function getProjectExamples(projects, count) {
    if (!projects || projects.length === 0) {
        return "No examples available.";
    }
    // Shuffle projects and take the first 'count'
    const shuffled = [...projects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => {
        // AI needs project title, category, and crucially, the link to generate hyperlinks
        return `- Title: ${p.title}, Category: ${p.category}, Link: ${p.link || 'N/A'}`;
    }).join('\n');
}

/**
 * Constructs the full prompt for the Groq AI model, including project data and instructions for links.
 * @param {string} question - The user's question.
 * @param {Array} currentProjects - The list of approved projects from the database.
 * @returns {string} - The formatted prompt string.
 */
function buildPrompt(question, currentProjects) {
    const categories = getUniqueCategories(currentProjects);
    const examples = getProjectExamples(currentProjects, 3); // Get 3 examples with links
    const totalProjects = currentProjects.length;

    return `[INST]
<<SYS>>
You are an expert on astronomy and art collaborations. Please answer the user's question directly based on the provided project database.
Crucial Information about the Projects:
- Categories: ${categories.join(', ')}
- Example Projects (Note: Each example includes a "Link" property):
${examples}
Rules for your response:
1.  Respond ONLY with the answer content.
2.  Never include [INST], <<SYS>>, or any other instruction markers.
3.  Do not explain how you generated the answer.
4.  Keep your responses concise, ideally under 200 words.
5.  If you cannot find relevant projects, state "I couldn't find relevant projects matching your query".
6.  Infer answers from ALL ${totalProjects} projects (not just the examples).
7.  Do not list projects unless specifically asked to do so.
8.  **If your answer refers to a specific project and that project has a valid 'Link' in the database, include a hyperlink in Markdown format: \`[Project Name](Project Link)\`. For example: \`[Stardust Echoes](https://example.com/stardust-echoes)\`.**
9.  **Only provide a hyperlink if the project explicitly has a 'Link' in the database. If a project does not have a link, just mention its name.**
<</SYS>>

Question: ${question}
[/INST]`;
}
// --- API Routes ---

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign(
                { userId: user._id, username: user.username, isAdmin: user.isAdmin }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
app.get('/api/admin/projects', authMiddleware, async (req, res) => {
    try {

        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        console.error('Failed to get projects:', error);
        res.status(500).json({ message: 'Failed to get projects.' });
    }
});

// @route   POST /api/projects
// @desc    Submit a new project for approval
// @access  Public
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        const { title, year, category, contributors, description, keywords, link, uploaderName, contactEmail } = req.body;


        if (!title || !year || !category || !contributors || !description || !uploaderName || !contactEmail) {
            return res.status(400).json({ error: 'Please fill all required fields (title, year, category, contributors, description, uploader name, contact email).' });
        }


        const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
            folder: 'astronomy_collaborations', 
            eager: [
                { width: 400, height: 300, crop: "fill", gravity: "auto" }, 
            ]
        });


        let parsedContributors;
        try {
            parsedContributors = JSON.parse(contributors);
            if (!Array.isArray(parsedContributors)) throw new Error('Contributors must be an array.');
        } catch {

            parsedContributors = contributors.split(',').map(s => s.trim()).filter(s => s);
        }

        let parsedKeywords = [];
        if (keywords) {
            try {
                parsedKeywords = JSON.parse(keywords);
                if (!Array.isArray(parsedKeywords)) throw new Error('Keywords must be an array.');
            } catch {
                parsedKeywords = keywords.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        const newProject = new Project({
            title,
            year: parseInt(year),
            category,
            contributors: parsedContributors,
            description,
            keywords: parsedKeywords,
            imageUrl: result.secure_url,
            link: link || null,
            uploaderName,
            contactEmail,
            isApproved: false 
        });

        await newProject.save();

        const adminMailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Project Submission Awaiting Approval',
            html: `
                <p>A new project has been submitted to the Astronomy Collaboration Library and is awaiting your review:</p>
                <p><strong>Title:</strong> ${newProject.title}</p>
                <p><strong>Uploader:</strong> ${newProject.uploaderName} (${newProject.contactEmail})</p>
                <p>Please log in to the admin panel to review and approve/reject it.</p>
                <p>Admin Panel Link: <a href="${process.env.FRONTEND_URL}/admin.html">${process.env.FRONTEND_URL}/admin.html</a></p>
            `
        };


        const uploaderMailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: newProject.contactEmail,
            subject: 'Your Project Submission to Astronomy Collaboration Library',
            html: `
                <p>Dear ${newProject.uploaderName},</p>
                <p>Thank you for submitting your project "${newProject.title}" to the Astronomy Collaboration Library.</p>
                <p>Your submission is currently under review by our administrators. We will notify you once it has been approved or if further information is needed.</p>
                <p>Sincerely,</p>
                <p>The Astronomy Collaboration Library Team</p>
            `
        };

        transporter.sendMail(adminMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending admin notification email:', error);
            } else {
                console.log('Admin notification email sent:', info.response);
            }
        });

        transporter.sendMail(uploaderMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending uploader confirmation email:', error);
            } else {
                console.log('Uploader confirmation email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'Project submitted successfully for approval!', project: newProject });
    } catch (err) {
        console.error('Error submitting project:', err);

        if (req.file && err.result && err.result.public_id) { 

            const publicId = err.result.public_id;
            cloudinary.uploader.destroy(publicId, (deleteErr) => {
                if (deleteErr) console.error('Error deleting image from Cloudinary after failed project save:', deleteErr);
            });
        }
        res.status(500).json({ error: err.message || 'Internal server error during project submission' });
    }
});

// @route   GET /api/projects
// @desc    Get all approved projects (for public display)
// @access  Public
app.get('/api/projects', async (req, res) => {
    try {
        const { category } = req.query;
        let query = { isApproved: true }; 
        if (category && category !== 'all') {
            query.category = category;
        }
        const projects = await Project.find(query).sort({ year: -1, submissionDate: -1 }); // Sort by year, then submission date
        res.json(projects);
    } catch (err) {
        console.error('Error fetching approved projects:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   GET /api/admin/projects/pending
// @desc    Get all pending projects for admin review
// @access  Private (Admin)
app.get('/api/admin/projects/pending', authMiddleware, async (req, res) => {
    try {
        const pendingProjects = await Project.find({ isApproved: false }).sort({ submissionDate: 1 });
        res.json(pendingProjects);
    } catch (err) {
        console.error('Error fetching pending projects:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   PUT /api/admin/projects/:id/approve
// @desc    Approve a project
// @access  Private (Admin)
app.put('/api/admin/projects/:id/approve', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.isApproved = true;
        project.approvalDate = Date.now();
        await project.save();


        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: project.contactEmail,
            subject: 'Your Project Has Been Approved!',
            html: `
                <p>Dear ${project.uploaderName},</p>
                <p>Great news! Your project "${project.title}" has been approved by our administrators and is now live on the Astronomy Collaboration Library.</p>
                <p>You can view it here: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
                <p>Thank you for your contribution!</p>
                <p>Sincerely,</p>
                <p>The Astronomy Collaboration Library Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending approval email:', error);
            } else {
                console.log('Approval email sent:', info.response);
            }
        });

        res.json({ message: 'Project approved successfully', project });
    } catch (err) {
        console.error('Error approving project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Reject/Delete a project
// @access  Private (Admin)
app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }


        if (project.imageUrl) {

            const publicIdMatch = project.imageUrl.match(/\/astronomy_collaborations\/([^/.]+)\./);
            if (publicIdMatch && publicIdMatch[1]) {
                const publicId = `astronomy_collaborations/${publicIdMatch[1]}`;
                await cloudinary.uploader.destroy(publicId);
            } else {
                console.warn('Could not extract public ID from Cloudinary URL:', project.imageUrl);
            }
        }

        await Project.deleteOne({ _id: req.params.id });


        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: project.contactEmail,
            subject: 'Update Regarding Your Project Submission',
            html: `
                <p>Dear ${project.uploaderName},</p>
                <p>We regret to inform you that your project "${project.title}" submitted to the Astronomy Collaboration Library could not be approved at this time.</p>
                <p>If you have any questions or would like to resubmit with modifications, please contact our support team.</p>
                <p>Sincerely,</p>
                <p>The Astronomy Collaboration Library Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending rejection email:', error);
            } else {
                console.log('Rejection email sent:', info.response);
            }
        });

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// @route   GET /api/projects/:id
// @desc    Get a single project by ID (public, for detail view)
// @access  Public
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || !project.isApproved) {
            return res.status(404).json({ message: 'Project not found or not approved' });
        }
        res.json(project);
    } catch (err) {
        console.error('Error fetching single project:', err);

        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- API for AI Chat ---
const GROQ_API_BASE_URL = 'https://api.groq.com/openai/v1'; // Standard Groq API base URL

app.post('/api/ask', apiLimiter, async (req, res) => {
    // 【MODIFICATION START】
    // Receive only the user's question from the frontend
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required.' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ message: 'Server configuration error: Groq API Key missing.' });
    }

    try {
        // Fetch all approved projects from the database
        // Select only the fields necessary for the prompt to reduce data transfer
        const approvedProjects = await Project.find({ isApproved: true }).select('title category link');

        // Build the prompt on the server-side using the fetched projects
        const prompt = buildPrompt(question, approvedProjects);

        const groqResponse = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // You can choose other Groq models (e.g., mixtral-8x7b-32768)
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 500, // Limit response length
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            throw new Error(`Groq API error! Status: ${groqResponse.status}, Message: ${errorText}`);
        }

        const groqData = await groqResponse.json();

        if (!groqData.choices || groqData.choices.length === 0 || !groqData.choices[0].message) {
            throw new Error('No valid response from Groq API.');
        }

        const aiAnswer = groqData.choices[0].message.content;
        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error('Error in /api/ask (Groq API call):', error);
        res.status(500).json({ message: 'An error occurred while fetching AI response.' });
    }
    // 【MODIFICATION END】
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});