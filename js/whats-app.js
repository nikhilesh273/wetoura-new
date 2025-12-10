
/**
 * Wentoura WhatsApp + Enquiry Integration (Stable Build)
 * Author: Nasal Nasi (updated by Nikhilesh)
 * Version: 1.2
 */

/* ---------------- CONFIGURATION ---------------- */
const WHATSAPP_NUMBERS = {
  primary: '9995668737', // ← Replace with your live number (digits only, no +)
  secondary: '' // Optional
};

const WHATSAPP_OPTIONS = {
  autoPrompt: true,  // Show WhatsApp modal automatically after submit
  promptDelay: 600
};

/* ---------------- ENQUIRY MODAL CONTROL ---------------- */
function openEnquiryModal() {
  document.getElementById('enquiryModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeEnquiryModal() {
  document.getElementById('enquiryModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
  document.body.style.overflow = 'auto';
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
    node.style.background =
      type === 'success' ? '#16a34a' :
      type === 'error' ? '#dc2626' :
      '#121212';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }
};

/* ---------------- WHATSAPP CORE ---------------- */
window.WentouraWhatsApp = {
  sanitizeDigits: function (num) {
    return String(num || '').replace(/\D+/g, '');
  },

  buildMessage: function (formData) {
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

  /* ✅ FIXED: consistent API endpoint */
  buildLink: function (formData, which = 'primary') {
    const number =
      which === 'secondary'
        ? this.sanitizeDigits(WHATSAPP_NUMBERS.secondary)
        : this.sanitizeDigits(WHATSAPP_NUMBERS.primary);

    if (!number) return '';
    const text = encodeURIComponent(this.buildMessage(formData));
    return `https://api.whatsapp.com/send?phone=${number}&text=${text}`;
  },

  /* ✅ FIXED: universal open works on all devices */
  open: function (formData, which = 'primary') {
    const url = this.buildLink(formData, which);
    if (!url) {
      WentouraUI.showAlert('WhatsApp number missing', 'error');
      return;
    }
    window.open(url, '_blank');
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

/* ---------------- ACTION MODAL ---------------- */
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

