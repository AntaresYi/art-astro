// app.js

console.log("Script loaded!");

// IMPORTANT: Update this URL for your deployed backend
// For local development, it might be 'http://localhost:3001'
// For Render deployment, it will be your Render backend service URL
const BACKEND_API_BASE_URL = 'https://art-astro-qvm2.onrender.com'; // 【MODIFICATION】Update this with your actual Render backend URL

// Global variable to store all fetched approved projects (still useful for display logic)
let allApprovedProjects = [];

// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', function() {
    fetchApprovedProjects(); // Fetch projects from backend on load
    setupEventListeners();
    initUpload();
});

document.getElementById('ask-button').addEventListener('click', askAI);

document.getElementById('ai-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        askAI();
    }
});

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.view-detail');
    if (!btn) return;

    // Use dataset.id to directly fetch from the global list or re-fetch from backend if needed
    const itemId = btn.dataset.itemId; // Changed to data-item-id
    const item = allApprovedProjects.find(p => p._id === itemId); // Use _id from MongoDB

    if (item) {
        showDetailModal(item);
    } else {
        console.error("Project not found in local cache:", itemId);
        // Optionally, re-fetch this specific project from backend if not found
        // This scenario should be rare if allApprovedProjects is kept up-to-date
        alert("Failed to find project details locally. Please refresh.");
    }
});

// --- Project Submission and Display ---

async function handleProjectSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form); // Get form data including file

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable button to prevent multiple submissions
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/projects`, {
            method: 'POST',
            body: formData // FormData handles multipart/form-data correctly
        });

        const data = await response.json();

        if (response.ok) {
            alert('Project submitted successfully and awaiting approval!');
            form.reset(); // Clear form
        } else {
            alert(`Error: ${data.message || 'Failed to submit project.'}`);
            console.error('Submission error:', data.message);
        }
    } catch (error) {
        console.error('Network error during submission:', error);
        alert('An error occurred during submission. Please try again later.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-upload me-2"></i>Submit';
    }
}


async function fetchApprovedProjects() {
    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/projects/approved`);
        const projects = await response.json();
        allApprovedProjects = projects; // Store globally for AI and detail modal
        renderProjects(projects);
    } catch (error) {
        console.error('Error fetching approved projects:', error);
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p class="text-danger">Failed to load projects. Please try again later.</p>';
        }
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return; // Ensure container exists

    container.innerHTML = ''; // Clear previous content

    if (projects.length === 0) {
        container.innerHTML = '<p class="text-muted">No approved projects to display yet. Check back soon!</p>';
        return;
    }

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm border-0">
                <img src="${project.imageUrl}" class="card-img-top project-card-img" alt="${project.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${project.title}</h5>
                    <p class="card-text text-muted small">${project.category}</p>
                    <p class="card-text flex-grow-1">${project.description.substring(0, 100)}...</p>
                    <div class="mt-auto">
                        <button class="btn btn-sm btn-outline-primary view-detail" data-item-id="${project._id}">
                            View Details <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 text-end">
                    <small class="text-muted">By: ${project.uploaderName}</small>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showDetailModal(item) {
    const detailModal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
    document.getElementById('detailModalTitle').textContent = item.title;
    document.getElementById('detailModalImage').src = item.imageUrl;
    document.getElementById('detailModalDescription').textContent = item.description;
    document.getElementById('detailModalCategory').textContent = item.category;
    document.getElementById('detailModalUploader').textContent = item.uploaderName;

    const detailModalLink = document.getElementById('detailModalLink');
    if (item.link) {
        detailModalLink.href = item.link;
        detailModalLink.textContent = 'View Original Project';
        detailModalLink.style.display = 'inline-block';
    } else {
        detailModalLink.style.display = 'none'; // Hide if no link
    }

    detailModal.show();
}

// --- AI Chat Functions ---

// 【MODIFICATION】Remove the buildPrompt function from app.js
// It will now be handled entirely on the server-side.
/*
function getUniqueCategories(projects) { ... }
function getProjectExamples(projects, count) { ... }
function buildPrompt(question, currentProjects) { ... }
*/


async function askAI() {
    const question = aiSearchInput.value.trim();
    if (!question) {
        alert('Please enter your question for the AI.');
        return;
    }

    // Display user question
    appendMessage('You', question);
    aiSearchInput.value = ''; // Clear input

    // Show loading spinner
    aiResponseDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    aiResponseDiv.style.display = 'block'; // Ensure it's visible

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 【MODIFICATION】Only send the question, backend will build the prompt
            body: JSON.stringify({ question: question })
        });

        const data = await response.json();

        if (response.ok) {
            // Remove spinner
            aiResponseDiv.innerHTML = '';
            // 【MODIFICATION】Use formatResponse to display AI answer (now includes link formatting)
            appendMessage('AI', formatResponse(data.answer));
        } else {
            // Remove spinner
            aiResponseDiv.innerHTML = '';
            appendMessage('AI', `Error: ${data.message || 'Failed to get AI response.'}`);
            console.error('AI response error:', data.message);
        }
    } catch (error) {
        // Remove spinner
        aiResponseDiv.innerHTML = '';
        appendMessage('AI', 'An error occurred while connecting to the AI. Please try again.');
        console.error('Fetch AI error:', error);
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `alert ${sender === 'You' ? 'alert-info' : 'alert-success'} d-flex align-items-center mt-2`;

    const icon = sender === 'You' ? 'fas fa-user' : 'fas fa-robot';
    messageElement.innerHTML = `<i class="${icon} me-2"></i><div><strong>${sender}:</strong> ${message}</div>`;

    aiResponseDiv.appendChild(messageElement);
    aiResponseDiv.scrollTop = aiResponseDiv.scrollHeight; // Scroll to bottom
}

// 【MODIFICATION】Updated formatResponse to handle Markdown links
function formatResponse(text) {
    // Clean up any lingering instruction markers if the AI model echoes them
    text = text.replace(/\[INST\]/g, '').replace(/\[\/INST\]/g, '');
    text = text.replace(/<<SYS>>/g, '').replace(/<\/?SYS>>/g, '');

    // Convert **text** to <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *text* to <em>text</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert - or * list items to HTML list
    // This regex matches lines starting with '- ' or '* '
    text = text.replace(/^(- |\* )(.*)$/gm, '<li>$2</li>');
    // If any list items were found, wrap the whole block in <ul>
    if (text.includes('<li>')) {
        // This is a simple approach; for complex cases, you might need a Markdown parser library
        text = `<ul>${text}</ul>`;
    }

    // 【NEW/MODIFIED】Recognize Markdown links and convert to HTML links
    // This regex looks for [Any Text](http or https://Any URL)
    // $1 captures the link text, $2 captures the URL
    text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Simple newline characters to <br> for basic formatting
    text = text.replace(/\n/g, '<br>');

    return text;
}


// --- Utility Functions ---

function setupEventListeners() {
    // Project submission form
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }

    // AI chat elements
    aiSearchInput = document.getElementById('ai-search');
    aiResponseDiv = document.getElementById('ai-response');
}

function initUpload() {
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                imagePreview.src = '#';
                imagePreview.style.display = 'none';
            }
        });
    }
}