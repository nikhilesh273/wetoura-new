// Reusable Components with Index Page Styling

// Header Component
function createHeader() {
  return `
    <nav class="navbar">
      <img src="./img/logo.png" alt="Wentoura Logo" class="logo-icon">
      <button class="get-in-touch" onclick="openEnquiryModal()">Get in touch</button>
    </nav>
  `;
}

// Social Icons Component
function createSocialIcons() {
  return `
    <div class="social-icons">
      <a href="#"><i class="fab fa-instagram"></i></a>
      <a href="#"><i class="fab fa-whatsapp"></i></a>
      <a href="#"><i class="fab fa-facebook-f"></i></a>
      <a href="#"><i class="fab fa-youtube"></i></a>
    </div>
  `;
}

// Footer Component
function createFooter() {
  return `
    <section class="footer-section">
      <div class="footer-content">
        <div class="footer-main-content">
          <h3>About</h3>
          <p>Wentoura Holidays is your trusted travel partner, creating personalized journeys with care, comfort,
            and unforgettable experiences.</p>

          <h3>Have a Questions?</h3>
          <p>Wentoura, Parakkottu Towers, Club Road, 7th Cross Road, Girinagar, Kadavanthra, Ernakulam-682020</p>
          <p>+91 6238468737 , +91 9995668737</p>
          <p>Wentoura.com</p>
        </div>
        <div class="footer-copyright">
          <p>Copyright ©2025 All rights reserved | Wentoura.co</p>
        </div>
      </div>
    </section>
  `;
}

// Enquiry Modal Component
function createEnquiryModal() {
  return `
    <div id="enquiryModal" class="wentoura-modal">
      <div class="modal-content">
        <h2>Plan Your Trip</h2>
        <form id="enquiryForm">
          <div class="form-group">
            <label>Destination</label>
            <input type="text" id="destination" placeholder="Enter destination" required />
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="name" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" placeholder="Your email" required />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="phone" placeholder="Your phone number" required />
          </div>
          <div class="form-group">
            <label>Enquiry</label>
            <textarea id="message" placeholder="Tell us about your trip"></textarea>
          </div>
          <div class="modal-buttons">
            <button type="submit" class="submit-btn">Send Enquiry</button>
            <button type="button" class="close-btn" onclick="closeEnquiryModal()">Close</button>
          </div>
        </form>
      </div>
    </div>
    <div id="modalOverlay" class="modal-overlay" onclick="closeEnquiryModal()"></div>
  `;
}