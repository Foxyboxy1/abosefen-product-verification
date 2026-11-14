// State Management
const state = {
    productName: "المنتج المعتمد الفاخر",
    serialNumber: "ORIG-98427-EG",
    targetUrl: window.location.href
};

let qrCodeInstance = null;

// DOM Elements
const displaySerial = document.getElementById('displaySerial');
const displayProductName = document.getElementById('displayProductName');
const verificationTime = document.getElementById('verificationTime');
const qrcodeContainer = document.getElementById('qrcode');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveCustomDataBtn = document.getElementById('saveCustomDataBtn');
const inputProductName = document.getElementById('inputProductName');
const inputSerial = document.getElementById('inputSerial');
const inputCustomUrl = document.getElementById('inputCustomUrl');
const toastMessage = document.getElementById('toastMessage');

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    loadFromUrlParamsOrStorage();
    updateUI();
    setVerificationTimestamp();
    generateQRCode();
    fireCelebrationConfetti();
    setupEventListeners();
});

// Load Query Params or LocalStorage
function loadFromUrlParamsOrStorage() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('serial')) {
        state.serialNumber = params.get('serial');
    } else if (localStorage.getItem('pv_serial')) {
        state.serialNumber = localStorage.getItem('pv_serial');
    }

    if (params.get('product')) {
        state.productName = params.get('product');
    } else if (localStorage.getItem('pv_product')) {
        state.productName = localStorage.getItem('pv_product');
    }

    if (params.get('url')) {
        state.targetUrl = params.get('url');
    } else if (localStorage.getItem('pv_target_url')) {
        state.targetUrl = localStorage.getItem('pv_target_url');
    } else {
        state.targetUrl = window.location.href;
    }
}

// Update UI
function updateUI() {
    displaySerial.textContent = state.serialNumber;
    displayProductName.textContent = state.productName;
    inputProductName.value = state.productName;
    inputSerial.value = state.serialNumber;
    inputCustomUrl.value = (state.targetUrl === window.location.href) ? "" : state.targetUrl;
}

// Format and set Arabic Timestamp
function setVerificationTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    try {
        verificationTime.textContent = now.toLocaleDateString('ar-EG', options);
    } catch (e) {
        verificationTime.textContent = now.toLocaleString();
    }
}

// Generate QR Code
function generateQRCode() {
    qrcodeContainer.innerHTML = "";
    
    // Determine the URL to encode in the QR code
    let urlToEncode = state.targetUrl;
    
    // If the URL is just file:// or localhost and doesn't have query params, construct a shareable link
    try {
        const urlObj = new URL(urlToEncode.startsWith('http') ? urlToEncode : window.location.href);
        urlObj.searchParams.set('serial', state.serialNumber);
        urlObj.searchParams.set('product', state.productName);
        urlToEncode = urlObj.toString();
    } catch (e) {
        // Fallback to simple string
    }

    qrCodeInstance = new QRCode(qrcodeContainer, {
        text: urlToEncode,
        width: 190,
        height: 190,
        colorDark: "#065f46",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Confetti Animation for Celebratory Feel
function fireCelebrationConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#059669', '#34d399', '#f59e0b']
        });
    }
}

// Toast notification helper
function showToast(msg) {
    toastMessage.textContent = msg;
    toastMessage.classList.add('show');
    setTimeout(() => {
        toastMessage.classList.remove('show');
    }, 2800);
}

// Event Listeners
function setupEventListeners() {
    // Copy link
    copyLinkBtn.addEventListener('click', () => {
        let currentUrl = window.location.href;
        try {
            const urlObj = new URL(currentUrl.startsWith('http') ? currentUrl : 'https://example.com/verify');
            urlObj.searchParams.set('serial', state.serialNumber);
            urlObj.searchParams.set('product', state.productName);
            currentUrl = (currentUrl.startsWith('http')) ? urlObj.toString() : window.location.href;
        } catch (e) {}

        navigator.clipboard.writeText(currentUrl).then(() => {
            showToast("تم نسخ رابط التحقق بنجاح!");
        }).catch(() => {
            showToast("تعذر النسخ التلقائي");
        });
    });

    // Download QR Code with nice printable framing
    downloadQrBtn.addEventListener('click', () => {
        const qrCanvas = qrcodeContainer.querySelector('canvas');
        const qrImg = qrcodeContainer.querySelector('img');

        if (!qrCanvas && !qrImg) {
            showToast("جاري تجهيز الكود، يرجى المحاولة بعد لحظات");
            return;
        }

        // Create a temporary canvas with label & badge for sticker printing
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        const width = 450;
        const height = 550;
        exportCanvas.width = width;
        exportCanvas.height = height;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Green Border
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        // Header text
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 24px Cairo, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("هذا المنتج أصلي 100%", width / 2, 60);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px Cairo, Arial, sans-serif';
        ctx.fillText("امسح الكود للتأكد من شهادة الضمان", width / 2, 90);

        // Draw QR Image/Canvas
        const source = qrCanvas || qrImg;
        const qrSize = 280;
        const qrX = (width - qrSize) / 2;
        const qrY = 120;
        ctx.drawImage(source, qrX, qrY, qrSize, qrSize);

        // Product & Serial Footer
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 16px Cairo, Arial, sans-serif';
        ctx.fillText(state.productName, width / 2, 440);

        ctx.fillStyle = '#059669';
        ctx.font = 'bold 15px Arial, sans-serif';
        ctx.fillText("S/N: " + state.serialNumber, width / 2, 475);

        // Convert to Download
        const downloadUrl = exportCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `QR-Verification-${state.serialNumber}.png`;
        a.href = downloadUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast("تم تحميل بطاقة الـ QR بنجاح للطباعة!");
    });

    // Modal controls
    customizeBtn.addEventListener('click', () => {
        customizeModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        customizeModal.classList.remove('active');
    });

    customizeModal.addEventListener('click', (e) => {
        if (e.target === customizeModal) {
            customizeModal.classList.remove('active');
        }
    });

    // Save Custom Data
    saveCustomDataBtn.addEventListener('click', () => {
        const pName = inputProductName.value.trim();
        const sNum = inputSerial.value.trim();
        const cUrl = inputCustomUrl.value.trim();

        if (pName) state.productName = pName;
        if (sNum) state.serialNumber = sNum;
        if (cUrl) {
            state.targetUrl = cUrl;
            localStorage.setItem('pv_target_url', cUrl);
        } else {
            localStorage.removeItem('pv_target_url');
            state.targetUrl = window.location.href;
        }

        localStorage.setItem('pv_product', state.productName);
        localStorage.setItem('pv_serial', state.serialNumber);

        updateUI();
        generateQRCode();
        customizeModal.classList.remove('active');
        showToast("تم تحديث البيانات والـ QR Code بنجاح!");
    });
}
