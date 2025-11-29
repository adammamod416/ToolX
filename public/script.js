// ===== Configuration =====
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

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

    switch (toolName) {
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

// ===== Helper Function: Upload File =====
async function uploadFile(endpoint, formData, onProgress) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'حدث خطأ في الخادم');
        }

        return data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// ===== Tool 1: Image to PDF (Backend) =====
function loadImageToPDF() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>📄 تحويل صورة إلى PDF</h2>
            <div class="upload-area" id="imageUploadArea">
                <div class="upload-icon">📸</div>
                <div class="upload-text">اسحب الصور هنا أو انقر للاختيار</div>
                <div class="upload-hint">PNG, JPG, JPEG مدعومة (يمكن اختيار عدة صور)</div>
                <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
            </div>
            <div id="imagePreview"></div>
            <button class="btn" id="convertToPDFBtn" style="display:none;">تحويل إلى PDF</button>
            <div id="progressBar" style="display:none; margin-top: 1rem;">
                <div style="background: rgba(99, 102, 241, 0.2); border-radius: 8px; overflow: hidden;">
                    <div id="progressFill" style="height: 30px; background: linear-gradient(90deg, var(--primary), var(--secondary)); width: 0%; transition: width 0.3s;"></div>
                </div>
                <p id="progressText" style="text-align: center; margin-top: 0.5rem;"></p>
            </div>
        </div>
    `;

    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const convertBtn = document.getElementById('convertToPDFBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
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
        progressBar.style.display = 'block';
        progressFill.style.width = '30%';
        progressText.textContent = 'جاري رفع الصور...';

        try {
            const formData = new FormData();
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            progressFill.style.width = '60%';
            progressText.textContent = 'جاري إنشاء PDF...';

            const result = await uploadFile('/pdf/images-to-pdf', formData);

            progressFill.style.width = '100%';
            progressText.textContent = 'تم بنجاح!';

            imagePreview.innerHTML = `
                <div class="result-area">
                    <h3 style="color: var(--success); margin-bottom: 1rem;">✓ تم التحويل بنجاح!</h3>
                    <p>عدد الصفحات: <strong>${result.data.pageCount}</strong></p>
                    <a href="${result.data.downloadUrl}" download class="btn btn-success" style="text-decoration: none; margin-top: 1rem; display: inline-block;">
                        📥 تحميل PDF
                    </a>
                </div>
            `;

            convertBtn.style.display = 'none';
            progressBar.style.display = 'none';
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
            convertBtn.disabled = false;
            convertBtn.textContent = 'تحويل إلى PDF';
            progressBar.style.display = 'none';
        }
    });
}

// ===== Tool 2: Speech to Text (Client-side) =====
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

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
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

// ===== Tool 3: Image Compressor (Backend) =====
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
                <button class="btn" id="compressBtn">ضغط الصورة</button>
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
    const compressBtn = document.getElementById('compressBtn');
    let selectedFile = null;

    uploadArea.addEventListener('click', () => compressInput.click());

    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value;
    });

    compressInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (!selectedFile) return;

        compressOptions.style.display = 'block';

        const reader = new FileReader();
        reader.onload = (event) => {
            compressResult.innerHTML = `
                <div class="result-area">
                    <h3>الصورة الأصلية</h3>
                    <img src="${event.target.result}" class="preview-image">
                    <p>الحجم: ${(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
            `;
        };
        reader.readAsDataURL(selectedFile);
    });

    compressBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        compressBtn.disabled = true;
        compressBtn.textContent = 'جاري الضغط...';

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('quality', qualitySlider.value);

            const result = await uploadFile('/image/compress', formData);

            compressResult.innerHTML = `
                <div class="result-area">
                    <h3 style="color: var(--success);">✓ تم الضغط بنجاح!</h3>
                    <img src="${result.data.downloadUrl}" class="preview-image">
                    <div style="margin-top: 1rem;">
                        <p>الحجم الأصلي: <strong>${result.data.originalSize}</strong></p>
                        <p>الحجم بعد الضغط: <strong>${result.data.compressedSize}</strong></p>
                        <p style="color: var(--success);">تم توفير: <strong>${result.data.savings}</strong></p>
                    </div>
                    <a href="${result.data.downloadUrl}" download class="btn btn-success" style="text-decoration: none; margin-top: 1rem; display: inline-block;">
                        📥 تحميل الصورة المضغوطة
                    </a>
                </div>
            `;

            compressBtn.disabled = false;
            compressBtn.textContent = 'ضغط الصورة';
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
            compressBtn.disabled = false;
            compressBtn.textContent = 'ضغط الصورة';
        }
    });
}

// ===== Tool 4: Password Generator (Backend) =====
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

    async function generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const includeUppercase = document.getElementById('includeUppercase').checked;
        const includeLowercase = document.getElementById('includeLowercase').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;

        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            alert('يرجى اختيار نوع واحد على الأقل من الأحرف');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'جاري التوليد...';

        try {
            const response = await fetch(`${API_BASE_URL}/password/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    length,
                    includeUppercase,
                    includeLowercase,
                    includeNumbers,
                    includeSymbols
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            const { password, strength } = result.data;

            passwordResult.innerHTML = `
                <div class="result-area">
                    <div class="generated-password">${password}</div>
                    <p style="color: ${strength.color}; font-size: 1.2rem; margin: 1rem 0;">
                        قوة كلمة السر: <strong>${strength.text}</strong>
                    </p>
                    <div style="margin: 1rem 0; text-align: right;">
                        <p>✓ الطول: ${strength.checks.length ? 'جيد' : 'قصير'}</p>
                        <p>✓ أحرف كبيرة: ${strength.checks.uppercase ? 'نعم' : 'لا'}</p>
                        <p>✓ أحرف صغيرة: ${strength.checks.lowercase ? 'نعم' : 'لا'}</p>
                        <p>✓ أرقام: ${strength.checks.numbers ? 'نعم' : 'لا'}</p>
                        <p>✓ رموز: ${strength.checks.symbols ? 'نعم' : 'لا'}</p>
                    </div>
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

            generateBtn.disabled = false;
            generateBtn.textContent = 'توليد كلمة السر';
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
            generateBtn.disabled = false;
            generateBtn.textContent = 'توليد كلمة السر';
        }
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
                    هذه الميزة قيد التطوير وستكون متاحة قريباً.<br>
                    تتطلب معالجة خاصة لملفات PDF.
                </p>
            </div>
        </div>
    `;
}

// ===== Tool 6: PDF Merger (Backend) =====
function loadPDFMerger() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>📚 دمج ملفات PDF</h2>
            <div class="upload-area" id="pdfMergeArea">
                <div class="upload-icon">📄</div>
                <div class="upload-text">اختر ملفات PDF للدمج (ملفين على الأقل)</div>
                <input type="file" id="pdfMergeInput" class="file-input" accept=".pdf" multiple>
            </div>
            <div id="pdfPreview"></div>
            <button class="btn" id="mergePDFBtn" style="display:none;">دمج الملفات</button>
            <div id="pdfMergeResult"></div>
        </div>
    `;

    const uploadArea = document.getElementById('pdfMergeArea');
    const pdfInput = document.getElementById('pdfMergeInput');
    const pdfPreview = document.getElementById('pdfPreview');
    const mergeBtn = document.getElementById('mergePDFBtn');
    const mergeResult = document.getElementById('pdfMergeResult');
    let selectedPDFs = [];

    uploadArea.addEventListener('click', () => pdfInput.click());

    pdfInput.addEventListener('change', (e) => {
        selectedPDFs = Array.from(e.target.files);

        if (selectedPDFs.length < 2) {
            alert('يجب اختيار ملفين PDF على الأقل');
            return;
        }

        pdfPreview.innerHTML = '<h3>الملفات المحددة:</h3>';
        selectedPDFs.forEach((file, index) => {
            pdfPreview.innerHTML += `<p>${index + 1}. ${file.name}</p>`;
        });

        mergeBtn.style.display = 'inline-block';
    });

    mergeBtn.addEventListener('click', async () => {
        if (selectedPDFs.length < 2) return;

        mergeBtn.disabled = true;
        mergeBtn.textContent = 'جاري الدمج...';

        try {
            const formData = new FormData();
            selectedPDFs.forEach(pdf => {
                formData.append('pdfs', pdf);
            });

            const result = await uploadFile('/pdf/merge', formData);

            mergeResult.innerHTML = `
                <div class="result-area">
                    <h3 style="color: var(--success);">✓ تم الدمج بنجاح!</h3>
                    <p>إجمالي الصفحات: <strong>${result.data.totalPages}</strong></p>
                    <a href="${result.data.downloadUrl}" download class="btn btn-success" style="text-decoration: none; margin-top: 1rem; display: inline-block;">
                        📥 تحميل PDF المدمج
                    </a>
                </div>
            `;

            mergeBtn.style.display = 'none';
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
            mergeBtn.disabled = false;
            mergeBtn.textContent = 'دمج الملفات';
        }
    });
}

// ===== Tool 7: Video to Audio (Backend) =====
function loadVideoToAudio() {
    toolContainer.innerHTML = `
        <div class="tool-interface">
            <h2>🎵 استخراج الصوت من الفيديو</h2>
            <div class="upload-area" id="videoUploadArea">
                <div class="upload-icon">🎬</div>
                <div class="upload-text">اختر ملف فيديو</div>
                <div class="upload-hint">MP4, AVI, MOV, WEBM مدعومة</div>
                <input type="file" id="videoInput" class="file-input" accept="video/*">
            </div>
            <div id="videoPreview"></div>
            <button class="btn" id="extractAudioBtn" style="display:none;">استخراج الصوت</button>
            <div id="videoResult"></div>
        </div>
    `;

    const uploadArea = document.getElementById('videoUploadArea');
    const videoInput = document.getElementById('videoInput');
    const videoPreview = document.getElementById('videoPreview');
    const extractBtn = document.getElementById('extractAudioBtn');
    const videoResult = document.getElementById('videoResult');
    let selectedVideo = null;

    uploadArea.addEventListener('click', () => videoInput.click());

    videoInput.addEventListener('change', (e) => {
        selectedVideo = e.target.files[0];
        if (!selectedVideo) return;

        videoPreview.innerHTML = `
            <div class="result-area">
                <p>الملف: <strong>${selectedVideo.name}</strong></p>
                <p>الحجم: <strong>${(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</strong></p>
            </div>
        `;

        extractBtn.style.display = 'inline-block';
    });

    extractBtn.addEventListener('click', async () => {
        if (!selectedVideo) return;

        extractBtn.disabled = true;
        extractBtn.textContent = 'جاري الاستخراج... (قد يستغرق بعض الوقت)';

        try {
            const formData = new FormData();
            formData.append('video', selectedVideo);

            const result = await uploadFile('/video/extract-audio', formData);

            videoResult.innerHTML = `
                <div class="result-area">
                    <h3 style="color: var(--success);">✓ تم استخراج الصوت بنجاح!</h3>
                    <p>التنسيق: <strong>${result.data.format}</strong></p>
                    <p>جودة الصوت: <strong>${result.data.bitrate}</strong></p>
                    <a href="${result.data.downloadUrl}" download class="btn btn-success" style="text-decoration: none; margin-top: 1rem; display: inline-block;">
                        📥 تحميل ملف MP3
                    </a>
                </div>
            `;

            extractBtn.style.display = 'none';
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
            extractBtn.disabled = false;
            extractBtn.textContent = 'استخراج الصوت';
        }
    });
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
