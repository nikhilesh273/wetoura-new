/**
 * Wentoura WhatsApp + Enquiry Integration (Stable Build)
 * Author: Nasal Nasi (updated)
 * Version: 1.1
 */

/* ---------------- CONFIGURATION ---------------- */
const WHATSAPP_NUMBERS = {
  primary: '919876543210',          // ← replace with live number (no +)
  secondary: ''                     // optional second number
};

const WHATSAPP_OPTIONS = {
  autoPrompt: true,                 // show WhatsApp action modal after submit
  promptDelay: 600,                 // ms before opening the modal
  secondNumberDelay: 800            // ms gap before opening secondary link
};

/* ---------------- ENQUIRY MODAL CONTROL ---------------- */
function openEnquiryModal() {
  const m = document.getElementById('enquiryModal');
  const o = document.getElementById('modalOverlay');
  if (m) m.style.display = 'flex';
  if (o) o.style.display = 'block';
}

function closeEnquiryModal() {
  const m = document.getElementById('enquiryModal');
  const o = document.getElementById('modalOverlay');
  if (m) m.style.display = 'none';
  if (o) o.style.display = 'none';
}

/* ---------------- UTILITIES ---------------- */
const WentouraUI = {
  ensureHost: function () {
    let host = document.getElementById('whatsapp-action-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'whatsapp-action-host';
      document.body.appendChild(host);
    }
    return host;
  },
  showAlert: function (text, type = 'info') {
    // minimal toast
    const node = document.createElement('div');
    node.textContent = text;
    node.style.position = 'fixed';
    node.style.left = '50%';
    node.style.transform = 'translateX(-50%)';
    node.style.bottom = '24px';
    node.style.padding = '10px 16px';
    node.style.borderRadius = '10px';
    node.style.zIndex = '3000';
    node.style.fontSize = '14px';
    node.style.color = '#fff';
    node.style.background = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#121212';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }
};

/* ---------------- WHATSAPP CORE ---------------- */
window.WentouraWhatsApp = {
  isMobileDevice: function () {
    try {
      if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') return navigator.userAgentData.mobile;
    } catch (_) {}
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
  },

  getWhatsAppBase: function () {
    return this.isMobileDevice() ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
  },

  sanitizeDigits: function (num) {
    // keep only digits; WA expects country code + number without plus
    return String(num || '').replace(/\D+/g, '');
  },

  buildMessage: function (formData) {
    // map only fields we actually collect; optional extras supported if present
    const lines = [
      '*New Tour Enquiry*',
      '',
      'Destination: ' + (formData.destination || 'Not specified'),
      ...(formData.checkinDate ? ['Check-in: ' + formData.checkinDate] : []),
      ...(formData.checkoutDate ? ['Check-out: ' + formData.checkoutDate] : []),
      ...(formData.travelers ? ['Travelers: ' + formData.travelers] : []),
      '',
      'Customer Details:',
      'Name: ' + (formData.name || 'Not provided'),
      'Email: ' + (formData.email || 'Not provided'),
      'Phone: ' + (formData.phone || 'Not provided'),
      '',
      'Additional Requirements:',
      (formData.message || 'None'),
      '',
      'Submitted: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    ];
    return lines.join('\n');
  },

  buildLink: function (formData, which = 'primary') {
    const base = this.getWhatsAppBase();
    const number =
      which === 'secondary'
        ? this.sanitizeDigits(WHATSAPP_NUMBERS.secondary)
        : this.sanitizeDigits(WHATSAPP_NUMBERS.primary);

    if (!number) return '';
    const text = encodeURIComponent(this.buildMessage(formData));
    return `${base}?phone=${number}&text=${text}`;
  },

  open: function (formData, which = 'primary') {
    const url = this.buildLink(formData, which);
    if (!url) {
      WentouraUI.showAlert('WhatsApp number missing', 'error');
      return;
    }
    if (this.isMobileDevice()) {
      // on mobile, navigate current tab for better WA handoff
      window.location.href = url;
    } else {
      // on desktop, open new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },

  copyLink: function (formData, which = 'primary') {
    const url = this.buildLink(formData, which);
    if (!url) {
      WentouraUI.showAlert('No WhatsApp link to copy', 'error');
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => WentouraUI.showAlert('WhatsApp link copied!', 'success'))
        .catch(() => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  },

  fallbackCopy: function (text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      WentouraUI.showAlert('WhatsApp link copied!', 'success');
    } catch (_) {
      WentouraUI.showAlert('Copy failed. Long-press to copy.', 'error');
    }
    document.body.removeChild(ta);
  }
};

/* ---------------- ACTION MODAL (PRIMARY ONLY) ---------------- */
function showWhatsAppButtons(formData) {
  window.lastEnquiryData = formData;

  const host = WentouraUI.ensureHost();
  host.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(18,18,18,0.6)';
  overlay.style.zIndex = '2500';

  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.left = '50%';
  modal.style.top = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '2600';
  modal.style.width = 'min(92vw, 520px)';
  modal.style.background = '#fdfaf7';
  modal.style.borderRadius = '14px';
  modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
  modal.style.padding = '20px';

  const title = document.createElement('h3');
  title.textContent = 'Send via WhatsApp';
  title.style.margin = '8px 8px 14px';
  title.style.fontFamily = "'Playfair Display', serif";
  title.style.color = '#121212';

  const msgPreview = document.createElement('pre');
  msgPreview.textContent = WentouraWhatsApp.buildMessage(formData);
  msgPreview.style.whiteSpace = 'pre-wrap';
  msgPreview.style.fontSize = '12px';
  msgPreview.style.lineHeight = '1.5';
  msgPreview.style.background = '#f5f3f0';
  msgPreview.style.padding = '12px';
  msgPreview.style.borderRadius = '10px';
  msgPreview.style.maxHeight = '30vh';
  msgPreview.style.overflow = 'auto';
  msgPreview.style.margin = '0 8px 14px';

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.flexWrap = 'wrap';
  row.style.gap = '10px';
  row.style.margin = '10px 8px';

  const makeBtn = (label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.padding = '10px 14px';
    b.style.borderRadius = '28px';
    b.style.border = '1px solid #d4af37';
    b.style.background = '#fdfaf7';
    b.style.cursor = 'pointer';
    b.style.fontWeight = '600';
    return b;
  };

  const sendPrimary = makeBtn('Send');
  sendPrimary.onclick = () => WentouraWhatsApp.open(formData, 'primary');

  const futureNote = document.createElement('p');
//   futureNote.textContent = 'Secondary number support (send to both) – coming soon.';
  futureNote.style.fontSize = '12px';
  futureNote.style.color = '#777';
  futureNote.style.margin = '6px 8px 0';

  const copyLinkBtn = makeBtn('Copy link');
  copyLinkBtn.onclick = () => WentouraWhatsApp.copyLink(formData, 'primary');

  const closeBtn = makeBtn('Close');
  closeBtn.style.background = '#f5f3f0';
  closeBtn.onclick = () => {
    overlay.remove();
    modal.remove();
  };

  row.appendChild(sendPrimary);
  row.appendChild(copyLinkBtn);
  row.appendChild(closeBtn);

  modal.appendChild(title);
  modal.appendChild(msgPreview);
  modal.appendChild(row);
  modal.appendChild(futureNote);

  overlay.addEventListener('click', () => {
    overlay.remove();
    modal.remove();
  });

  host.appendChild(overlay);
  host.appendChild(modal);
}

/* ---------------- FORM BINDING ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      destination: document.getElementById('destination')?.value?.trim(),
      name: document.getElementById('name')?.value?.trim(),
      email: document.getElementById('email')?.value?.trim(),
      phone: document.getElementById('phone')?.value?.trim(),
      message: document.getElementById('message')?.value?.trim()
      // Optional: add fields if you later include them in the form:
      // checkinDate: document.getElementById('checkin')?.value?.trim(),
      // checkoutDate: document.getElementById('checkout')?.value?.trim(),
      // travelers: document.getElementById('travelers')?.value?.trim()
    };

    form.reset();

    closeEnquiryModal();

    if (WHATSAPP_OPTIONS.autoPrompt) {
      setTimeout(() => showWhatsAppButtons(formData), WHATSAPP_OPTIONS.promptDelay);
    } else {
      WentouraWhatsApp.open(formData, 'primary');
    }
  });
});
