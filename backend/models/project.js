// backend/models/Project.js

const mongoose = require('mongoose');

// Define the schema for a project
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900, // You can adjust the minimum year as needed
        max: 2100  // You can adjust the maximum year as needed
    },
    category: {
        type: String,
        required: true,
        enum: ['exhibition', 'research', 'artwork', 'collaboration', 'event', 'astronomyproject', 'project', 'organization', 'founding'] // Ensure consistency with frontend categories
    },
    contributors: {
        type: [String], // Array of strings
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    keywords: {
        type: [String], // Array of strings
        default: []
    },
    imageUrl: {
        type: String, // URL to the image hosted on Cloudinary
        required: true
    },
    link: {
        type: String, // External link for the project
        default: null,
        trim: true
    },
    // New fields for submission and admin approval
    uploaderName: { // Name or alias of the person who submitted the project
        type: String,
        required: true,
        trim: true
    },
    contactEmail: { // Email of the uploader for status updates
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address'] // Basic email regex validation
    },
    isApproved: { // Flag for administrator approval
        type: Boolean,
        default: false
    },
    submissionDate: { // When the project was submitted
        type: Date,
        default: Date.now
    },
    approvalDate: { // When the project was approved
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose model from the schema
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;