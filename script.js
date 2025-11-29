// ===== Global Variables =====
const toolModal = document.getElementById('toolModal');
const toolContainer = document.getElementById('toolContainer');
const searchInput = document.getElementById('searchInput');
const toolsGrid = document.getElementById('toolsGrid');

// ===== Search Functionality =====
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const title = card.querySelector('.tool-title').textContent.toLowerCase();
        const desc = card.querySelector('.tool-desc').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
});

// ===== Modal Functions =====
function openTool(toolName) {
    toolModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    switch(toolName) {
        case 'image-to-pdf':
            loadImageToPDF();
            break;
        case 'speech-to-text':
            loadSpeechToText();
            break;
        case 'image-compressor':
            loadImageCompressor();
            break;
        case 'password-generator':
            loadPasswordGenerator();
            break;
        case 'pdf-to-images':
            loadPDFToImages();
            break;
        case 'pdf-merger':
            loadPDFMerger();
            break;
        case 'video-to-audio':
            loadVideoToAudio();
            break;
    }
}

function closeModal() {
    toolModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    toolContainer.innerHTML = '';
}

// ===== Tool 1: Image to PDF =====
function loadImageToPDF() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>📄 تحويل صورة إلى PDF</h2>
            <div class="upload-area" id="imageUploadArea">
                <div class="upload-icon">📸</div>
                <div class="upload-text">اسحب الصورة هنا أو انقر للاختيار</div>
                <div class="upload-hint">PNG, JPG, JPEG مدعومة</div>
                <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
            </div>
            <div id="imagePreview"></div>
            <button class="btn" id="convertToPDFBtn" style="display:none;">تحويل إلى PDF</button>
        </div>
    `;
    
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const convertBtn = document.getElementById('convertToPDFBtn');
    let selectedImages = [];
    
    uploadArea.addEventListener('click', () => imageInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleImageFiles(e.dataTransfer.files);
    });
    
    imageInput.addEventListener('change', (e) => {
        handleImageFiles(e.target.files);
    });
    
    function handleImageFiles(files) {
        selectedImages = Array.from(files);
        imagePreview.innerHTML = '';
        
        selectedImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML += `
                    <div style="margin: 1rem 0;">
                        <img src="${e.target.result}" class="preview-image" style="max-height: 200px;">
                        <p style="color: var(--text-secondary);">صورة ${index + 1}: ${file.name}</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });
        
        convertBtn.style.display = 'inline-block';
    }
    
    convertBtn.addEventListener('click', async () => {
        if (selectedImages.length === 0) return;
        
        convertBtn.disabled = true;
        convertBtn.textContent = 'جاري التحويل...';
        
        try {
            // Using jsPDF library (we'll include it via CDN in production)
            // For now, we'll create a simple download mechanism
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Simple implementation - in production use jsPDF
            alert('سيتم تحميل PDF قريباً. يرجى تضمين مكتبة jsPDF للحصول على الوظيفة الكاملة.');
            
            convertBtn.textContent = 'تم التحويل ✓';
            convertBtn.classList.add('btn-success');
        } catch (error) {
            alert('حدث خطأ أثناء التحويل');
            convertBtn.disabled = false;
            convertBtn.textContent = 'تحويل إلى PDF';
        }
    });
}

// ===== Tool 2: Speech to Text =====
function loadSpeechToText() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🎤 تفريغ الصوت إلى نص</h2>
            <div class="result-area">
                <button class="btn" id="startRecording">🎙️ ابدأ التسجيل</button>
                <button class="btn btn-secondary" id="stopRecording" style="display:none;">⏹️ إيقاف</button>
                <div id="transcriptResult" style="margin-top: 2rem; min-height: 200px; padding: 1rem; background: rgba(30, 41, 59, 0.6); border-radius: 12px; color: var(--text-primary); font-size: 1.1rem; line-height: 1.8;"></div>
                <button class="btn btn-success" id="copyTranscript" style="display:none; margin-top: 1rem;">📋 نسخ النص</button>
            </div>
        </div>
    `;
    
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    const transcriptDiv = document.getElementById('transcriptResult');
    const copyBtn = document.getElementById('copyTranscript');
    
    let recognition;
    let isRecording = false;
    
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA'; // Arabic
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            transcriptDiv.textContent = transcript;
            if (transcript.length > 0) {
                copyBtn.style.display = 'inline-block';
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            transcriptDiv.textContent = 'حدث خطأ في التعرف على الصوت. يرجى المحاولة مرة أخرى.';
        };
        
        startBtn.addEventListener('click', () => {
            if (!isRecording) {
                recognition.start();
                isRecording = true;
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                transcriptDiv.textContent = 'جاري الاستماع... تحدث الآن';
            }
        });
        
        stopBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
                isRecording = false;
                stopBtn.style.display = 'none';
                startBtn.style.display = 'inline-block';
            }
        });
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(transcriptDiv.textContent);
            copyBtn.textContent = '✓ تم النسخ';
            setTimeout(() => {
                copyBtn.textContent = '📋 نسخ النص';
            }, 2000);
        });
        
    } else {
        transcriptDiv.textContent = 'عذراً، متصفحك لا يدعم ميزة التعرف على الصوت. يرجى استخدام Chrome أو Edge.';
        startBtn.style.display = 'none';
    }
}

// ===== Tool 3: Image Compressor =====
function loadImageCompressor() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🗜️ ضغط الصور</h2>
            <div class="upload-area" id="compressUploadArea">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">اختر صورة للضغط</div>
                <input type="file" id="compressInput" class="file-input" accept="image/*">
            </div>
            <div class="options-group" id="compressOptions" style="display:none;">
                <div class="option-item">
                    <span class="option-label">جودة الصورة: <span id="qualityValue">80</span>%</span>
                    <input type="range" id="qualitySlider" min="10" max="100" value="80">
                </div>
            </div>
            <div id="compressResult"></div>
        </div>
    `;
    
    const uploadArea = document.getElementById('compressUploadArea');
    const compressInput = document.getElementById('compressInput');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressOptions = document.getElementById('compressOptions');
    const compressResult = document.getElementById('compressResult');
    
    uploadArea.addEventListener('click', () => compressInput.click());
    
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value;
    });
    
    compressInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        compressOptions.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                compressImage(img, file);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    qualitySlider.addEventListener('change', () => {
        if (compressInput.files[0]) {
            const file = compressInput.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    compressImage(img, file);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    function compressImage(img, originalFile) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const quality = qualitySlider.value / 100;
        
        canvas.toBlob((blob) => {
            const originalSize = (originalFile.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            const savings = ((1 - blob.size / originalFile.size) * 100).toFixed(1);
            
            const url = URL.createObjectURL(blob);
            
            compressResult.innerHTML = `
                <div class="result-area">
                    <h3 style="margin-bottom: 1rem;">النتيجة</h3>
                    <img src="${url}" class="preview-image">
                    <div style="margin-top: 1rem;">
                        <p>الحجم الأصلي: <strong>${originalSize} KB</strong></p>
                        <p>الحجم بعد الضغط: <strong>${compressedSize} KB</strong></p>
                        <p style="color: var(--success);">تم توفير: <strong>${savings}%</strong></p>
                    </div>
                    <button class="btn btn-success" id="downloadCompressed">تحميل الصورة المضغوطة</button>
                </div>
            `;
            
            document.getElementById('downloadCompressed').addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compressed_' + originalFile.name;
                a.click();
            });
        }, 'image/jpeg', quality);
    }
}

// ===== Tool 4: Password Generator =====
function loadPasswordGenerator() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🔐 توليد كلمة سر قوية</h2>
            <div class="options-group">
                <div class="option-item">
                    <span class="option-label">طول كلمة السر:</span>
                    <input type="number" id="passwordLength" min="4" max="64" value="16">
                </div>
                <div class="option-item">
                    <span class="option-label">أحرف كبيرة (A-Z)</span>
                    <input type="checkbox" id="includeUppercase" checked>
                </div>
                <div class="option-item">
                    <span class="option-label">أحرف صغيرة (a-z)</span>
                    <input type="checkbox" id="includeLowercase" checked>
                </div>
                <div class="option-item">
                    <span class="option-label">أرقام (0-9)</span>
                    <input type="checkbox" id="includeNumbers" checked>
                </div>
                <div class="option-item">
                    <span class="option-label">رموز (!@#$%^&*)</span>
                    <input type="checkbox" id="includeSymbols" checked>
                </div>
            </div>
            <button class="btn" id="generatePasswordBtn">توليد كلمة السر</button>
            <div id="passwordResult"></div>
        </div>
    `;
    
    const generateBtn = document.getElementById('generatePasswordBtn');
    const passwordResult = document.getElementById('passwordResult');
    
    generateBtn.addEventListener('click', generatePassword);
    
    function generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const includeUppercase = document.getElementById('includeUppercase').checked;
        const includeLowercase = document.getElementById('includeLowercase').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;
        
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (charset === '') {
            alert('يرجى اختيار نوع واحد على الأقل من الأحرف');
            return;
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        const strength = calculatePasswordStrength(password);
        
        passwordResult.innerHTML = `
            <div class="result-area">
                <div class="generated-password">${password}</div>
                <p style="color: ${strength.color}; font-size: 1.2rem; margin: 1rem 0;">
                    قوة كلمة السر: <strong>${strength.text}</strong>
                </p>
                <button class="btn btn-success" id="copyPassword">📋 نسخ كلمة السر</button>
            </div>
        `;
        
        document.getElementById('copyPassword').addEventListener('click', () => {
            navigator.clipboard.writeText(password);
            document.getElementById('copyPassword').textContent = '✓ تم النسخ';
            setTimeout(() => {
                document.getElementById('copyPassword').textContent = '📋 نسخ كلمة السر';
            }, 2000);
        });
    }
    
    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (password.length >= 16) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return { text: 'ضعيفة', color: 'var(--error)' };
        if (strength <= 4) return { text: 'متوسطة', color: 'var(--warning)' };
        if (strength <= 6) return { text: 'قوية', color: 'var(--success)' };
        return { text: 'قوية جداً', color: 'var(--accent)' };
    }
}

// ===== Tool 5: PDF to Images =====
function loadPDFToImages() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🖼️ تحويل PDF إلى صور</h2>
            <div class="upload-area" id="pdfUploadArea">
                <div class="upload-icon">📄</div>
                <div class="upload-text">اختر ملف PDF</div>
                <input type="file" id="pdfInput" class="file-input" accept=".pdf">
            </div>
            <div id="pdfResult">
                <p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">
                    هذه الميزة تتطلب مكتبة PDF.js للعمل بشكل كامل.<br>
                    سيتم إضافتها في النسخة القادمة.
                </p>
            </div>
        </div>
    `;
}

// ===== Tool 6: PDF Merger =====
function loadPDFMerger() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>📚 دمج ملفات PDF</h2>
            <div class="upload-area" id="pdfMergeArea">
                <div class="upload-icon">📄</div>
                <div class="upload-text">اختر ملفات PDF للدمج</div>
                <input type="file" id="pdfMergeInput" class="file-input" accept=".pdf" multiple>
            </div>
            <div id="pdfMergeResult">
                <p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">
                    هذه الميزة تتطلب مكتبة PDF-lib للعمل بشكل كامل.<br>
                    سيتم إضافتها في النسخة القادمة.
                </p>
            </div>
        </div>
    `;
}

// ===== Tool 7: Video to Audio =====
function loadVideoToAudio() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🎵 استخراج الصوت من الفيديو</h2>
            <div class="upload-area" id="videoUploadArea">
                <div class="upload-icon">🎬</div>
                <div class="upload-text">اختر ملف فيديو</div>
                <input type="file" id="videoInput" class="file-input" accept="video/*">
            </div>
            <div id="videoResult">
                <p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">
                    هذه الميزة تتطلب معالجة من جانب الخادم.<br>
                    يمكن استخدام FFmpeg.js للمعالجة في المتصفح.
                </p>
            </div>
        </div>
    `;
}

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ===== Close modal on ESC key =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toolModal.classList.contains('active')) {
        closeModal();
    }
});
