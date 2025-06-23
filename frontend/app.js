// app.js

console.log("Script loaded!");

// IMPORTANT: Update this URL for your deployed backend
// For local development, it might be 'http://localhost:3001'
// For Render deployment, it will be your Render backend service URL

// Global variable to store all fetched approved projects
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
        alert("Failed to load project details. Please try again.");
    }
});

// --- Project Fetching and Rendering ---
async function fetchApprovedProjects() {
    const container = document.getElementById('items-container');
    container.innerHTML = `
        <div class="col-12 text-center py-5" id="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading projects from the library...</p>
        </div>
    `;

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/projects`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        allApprovedProjects = projects; // Store fetched projects globally
        renderItems(allApprovedProjects); // Render all fetched projects initially
    } catch (error) {
        console.error('Error fetching approved projects:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>Failed to load projects. Please try refreshing the page.
                </div>
            </div>
        `;
    } finally {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.remove();
    }
}

function renderItems(itemsToRender) {
    const container = document.getElementById('items-container');
    container.innerHTML = ''; // Clear existing items

    if (itemsToRender.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4>No projects found for this category.</h4>
                <p>Try selecting another category or submitting a new project!</p>
            </div>
        `;
        return;
    }

    itemsToRender.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card item-card h-100" data-category="${item.category}" data-id="${item._id}">
              <img src="${item.imageUrl}" class="card-img-top" alt="${item.title}"
                   onerror="this.onerror=null;this.src='images/default.jpg'">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${item.year} • ${item.contributors.join(', ')}</h6>
                <p class="card-text">${item.description.substring(0, 100)}...</p>
                <div class="mb-3">
                  ${item.keywords.map(keyword => `<span class="badge badge-custom">${keyword}</span>`).join('') || 'N/A'}
                </div>
                <button class="btn btn-outline-primary view-detail"
                         data-item-id="${item._id}">
                  <i class="fas fa-expand me-2"></i>View Detail
                </button>
              </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showDetailModal(item) {
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-image').src = item.imageUrl; // Use imageUrl from Cloudinary
    document.getElementById('detail-year').textContent = item.year;
    document.getElementById('detail-contributors').textContent = item.contributors.join(', ');
    document.getElementById('detail-description').textContent = item.description;
    // Hide link if not available
    const detailLink = document.getElementById('detail-link');
    if (item.link) {
        detailLink.href = item.link;
        detailLink.style.display = 'inline-block';
    } else {
        detailLink.style.display = 'none';
    }

    const keywordsContainer = document.getElementById('detail-keywords');
    keywordsContainer.innerHTML = item.keywords.map(k =>
        `<span class="badge badge-custom me-2 mb-2">${k}</span>`
    ).join('') || 'N/A';

    const modal = new bootstrap.Modal(document.getElementById('detail-modal'));
    modal.show();
}

// --- Filtering and Other UI Event Handlers ---
function setupEventListeners() {
    const projectForm = document.getElementById('projectForm');
      if (projectForm) {
          projectForm.addEventListener('submit', handleProjectSubmit);
      }

    // AI chat elements
    aiSearchInput = document.getElementById('ai-search');
    aiResponseDiv = document.getElementById('ai-response');
    // Category filtering
    document.querySelectorAll('.category-filter button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.category-filter .active').classList.remove('active');
            this.classList.add('active');

            const category = this.dataset.category;
            let filteredItems = [];

            if (category === 'all') {
                filteredItems = allApprovedProjects;
            } else {
                // Filter by category directly from the fetched projects
                filteredItems = allApprovedProjects.filter(item => item.category === category);
            }
            renderItems(filteredItems);
        });
    });

    // Load more button (simulated - can be expanded for pagination)
    document.getElementById('load-more').addEventListener('click', function() {
        // For now, it just indicates no more items.
        // In a real application, you'd fetch more items from the backend with pagination.
        this.textContent = 'No more items to load';
        this.disabled = true;
    });
}

// --- Project Submission (Upload) Logic ---
function initUpload() {
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleUploadClick);
    }

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Uploading...`;

            const formData = new FormData(form);

            // Ensure contributors and keywords are sent as JSON strings or correct array format
            // Backend expects JSON.parse, so send as stringified JSON array
            const contributorsArray = formData.get('contributors').split(',').map(c => c.trim()).filter(c => c);
            formData.set('contributors', JSON.stringify(contributorsArray));

            const keywordsValue = formData.get('keywords');
            const keywordsArray = keywordsValue ? keywordsValue.split(',').map(k => k.trim()).filter(k => k) : [];
            formData.set('keywords', JSON.stringify(keywordsArray));

            // Remove empty link field if present, or backend might try to parse "" as URL
            if (formData.get('link') === '') {
                formData.delete('link');
            }

            const response = await fetch(`${BACKEND_API_BASE_URL}/api/projects`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                // Assuming backend sends { error: 'message' }
                throw new Error(data.error || 'Unknown error occurred during upload.');
            }

            // Project submitted successfully, but it's *not yet approved*
            // So we don't add it to allApprovedProjects or re-render immediately
            form.reset();
            const uploadModal = bootstrap.Modal.getInstance(document.getElementById('upload-modal'));
            if (uploadModal) uploadModal.hide();

            alert('Project submitted successfully! It is now awaiting administrator review.');
            // No need to refresh projects, as the new project is not approved yet.
            // If you want to show a "thank you" message on the main page, implement that separately.

        } catch (err) {
            console.error('Upload failed:', err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

function handleUploadClick() {
    console.log('[DEBUG] Upload button clicked');
    try {
        const modal = new bootstrap.Modal(
            document.getElementById('upload-modal'),
            { keyboard: true }
        );
        modal.show();
    } catch (err) {
        console.error('Modal initialization failed:', err);
        // Fallback for older Bootstrap versions or if modal script isn't loaded correctly
        document.getElementById('upload-modal').classList.add('show');
        document.getElementById('upload-modal').style.display = 'block';
    }
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
