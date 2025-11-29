const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Generate Password
router.post('/generate', (req, res) => {
    try {
        const {
            length = 16,
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true
        } = req.body;

        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (charset === '') {
            return res.status(400).json({
                success: false,
                message: 'يجب اختيار نوع واحد على الأقل من الأحرف'
            });
        }

        // Generate cryptographically secure password
        let password = '';
        const randomBytes = crypto.randomBytes(length);

        for (let i = 0; i < length; i++) {
            password += charset[randomBytes[i] % charset.length];
        }

        // Calculate password strength
        const strength = calculatePasswordStrength(password);

        res.json({
            success: true,
            message: 'تم توليد كلمة السر بنجاح',
            data: {
                password: password,
                length: password.length,
                strength: strength
            }
        });

    } catch (error) {
        console.error('Password generation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء توليد كلمة السر'
        });
    }
});

// Check Password Strength
router.post('/check-strength', (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'يجب إدخال كلمة سر'
            });
        }

        const strength = calculatePasswordStrength(password);

        res.json({
            success: true,
            data: strength
        });

    } catch (error) {
        console.error('Password check error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء فحص كلمة السر'
        });
    }
});

// Generate Multiple Passwords
router.post('/generate-bulk', (req, res) => {
    try {
        const { count = 5, ...options } = req.body;

        if (count > 100) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن توليد أكثر من 100 كلمة سر في المرة الواحدة'
            });
        }

        const passwords = [];

        for (let i = 0; i < count; i++) {
            const {
                length = 16,
                includeUppercase = true,
                includeLowercase = true,
                includeNumbers = true,
                includeSymbols = true
            } = options;

            let charset = '';
            if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (includeNumbers) charset += '0123456789';
            if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

            let password = '';
            const randomBytes = crypto.randomBytes(length);

            for (let j = 0; j < length; j++) {
                password += charset[randomBytes[j] % charset.length];
            }

            passwords.push({
                password: password,
                strength: calculatePasswordStrength(password)
            });
        }

        res.json({
            success: true,
            message: `تم توليد ${count} كلمة سر بنجاح`,
            data: {
                count: passwords.length,
                passwords: passwords
            }
        });

    } catch (error) {
        console.error('Bulk password generation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء توليد كلمات السر'
        });
    }
});

// Helper function to calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        longLength: false,
        veryLongLength: false
    };

    // Length checks
    if (password.length >= 8) {
        score++;
        checks.length = true;
    }
    if (password.length >= 12) {
        score++;
        checks.longLength = true;
    }
    if (password.length >= 16) {
        score++;
        checks.veryLongLength = true;
    }

    // Character type checks
    if (/[a-z]/.test(password)) {
        score++;
        checks.lowercase = true;
    }
    if (/[A-Z]/.test(password)) {
        score++;
        checks.uppercase = true;
    }
    if (/[0-9]/.test(password)) {
        score++;
        checks.numbers = true;
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
        score++;
        checks.symbols = true;
    }

    // Determine strength level
    let level, color, text;
    if (score <= 2) {
        level = 1;
        text = 'ضعيفة';
        color = '#ef4444';
    } else if (score <= 4) {
        level = 2;
        text = 'متوسطة';
        color = '#f59e0b';
    } else if (score <= 6) {
        level = 3;
        text = 'قوية';
        color = '#10b981';
    } else {
        level = 4;
        text = 'قوية جداً';
        color = '#14b8a6';
    }

    return {
        score: score,
        level: level,
        text: text,
        color: color,
        checks: checks
    };
}

module.exports = router;
