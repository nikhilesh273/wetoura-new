// Destination Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get destination from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const destinationSlug = urlParams.get('destination');
    
    if (!destinationSlug || !destinationData[destinationSlug]) {
        // Redirect to home if no valid destination
        window.location.href = 'index.html';
        return;
    }
    
    const destination = destinationData[destinationSlug];
    loadDestinationContent(destination);
});

function loadDestinationContent(destination) {
    // Preload hero image
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = destination.heroImage;
    document.head.appendChild(link);
    
    // Hide loading and show content
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('hero').style.display = 'block';
        document.getElementById('content').style.display = 'block';
        
        // Update page title
        document.getElementById('page-title').textContent = `${destination.title} - Wentoura`;
        document.title = `${destination.title} - Wentoura`;
        
        // Update hero section
        const heroSection = document.getElementById('hero');
        heroSection.style.backgroundImage = `url('${destination.heroImage}')`;
        document.getElementById('destination-title').textContent = destination.title;
        document.getElementById('destination-subtitle').textContent = destination.subtitle;
        
        // Update description
        document.getElementById('destination-description').innerHTML = destination.description.replace(/\n\s*/g, '</p><p>');
        
        // Update quick info
        updateQuickInfo(destination.quickInfo);
        
        // Update highlights
        updateHighlights(destination.highlights);
        
        // Update gallery
        updateGallery(destination.gallery);
        
        // Pre-fill enquiry form
        const destinationInput = document.getElementById('destination');
        if (destinationInput) {
            destinationInput.value = destination.title;
        }
        
    }, 300);
}

function updateQuickInfo(quickInfo) {
    const container = document.getElementById('quick-info-content');
    let html = '';
    
    for (const [label, value] of Object.entries(quickInfo)) {
        html += `
            <div class="info-item">
                <span class="info-label">${label}:</span>
                <span class="info-value">${value}</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function updateHighlights(highlights) {
    const container = document.getElementById('highlights-grid');
    let html = '';
    
    highlights.forEach(highlight => {
        html += `
            <div class="highlight-item">
                <div class="highlight-icon">
                    <i class="${highlight.icon}"></i>
                </div>
                <div class="highlight-title">${highlight.title}</div>
                <div class="highlight-description">${highlight.description}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateGallery(gallery) {
    const container = document.getElementById('gallery-grid');
    let html = '';
    
    gallery.forEach((image, index) => {
        html += `
            <div class="gallery-item">
                <img data-src="${image}" alt="Gallery Image ${index + 1}" loading="lazy" class="lazy-image">
            </div>
        `;
    });
    
    container.innerHTML = html;
    initLazyLoading();
}

// Lazy loading implementation
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Modal functions
function openEnquiryModal() {
    document.getElementById('enquiryModal').style.display = 'flex';
}

function closeEnquiryModal() {
    document.getElementById('enquiryModal').style.display = 'none';
}

// Handle enquiry form submission
document.getElementById('enquiryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        destination: document.getElementById('destination').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to your server
    console.log('Enquiry submitted:', formData);
    
    // Show success message
    alert('Thank you for your enquiry! We will contact you soon.');
    
    // Close modal and reset form
    closeEnquiryModal();
    this.reset();
});

// Close modal when clicking outside
document.getElementById('enquiryModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEnquiryModal();
    }
});

// Handle escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEnquiryModal();
    }
});