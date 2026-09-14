/* ============================================================
   AlwaysUs — Virtual Companion App
   Pure JavaScript, no frameworks
   ============================================================ */

// ========== STORAGE KEYS ==========
const KEYS = {
    USERS: 'au_users',
    SESSION: 'au_session',
    COMPANION: 'au_companion',
    CHAT: 'au_chat',
    LAST_MSG: 'au_last_msg'
};

// ========== HELPERS ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getUsers() {
    try { return JSON.parse(localStorage.getItem(KEYS.USERS)) || []; }
    catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

function getSession() {
    try { return JSON.parse(localStorage.getItem(KEYS.SESSION)); }
    catch { return null; }
}

function setSession(session) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
}

function getCompanion() {
    try { return JSON.parse(localStorage.getItem(KEYS.COMPANION)); }
    catch { return null; }
}

function setCompanion(comp) {
    localStorage.setItem(KEYS.COMPANION, JSON.stringify(comp));
}

function getChat() {
    try { return JSON.parse(localStorage.getItem(KEYS.CHAT)) || []; }
    catch { return []; }
}

function saveChat(chat) {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(chat));
}

// ========== PAGE DETECTION ==========
const page = window.location.pathname.split('/').pop() || 'index.html';

// ========== PARTICLES BACKGROUND ==========
function initParticles() {
    const canvas = $('#particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const COUNT = 50;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.1
        };
    }

    function init() {
        resize();
        for (let i = 0; i < COUNT; i++) particles.push(createParticle());
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
            ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
}

// ========== INDEX PAGE (AUTH) ==========
function initAuthPage() {
    // Auto-redirect if logged in
    const session = getSession();
    if (session) {
        if (getCompanion()) {
            window.location.href = 'chat.html';
        } else {
            window.location.href = 'setup.html';
        }
        return;
    }

    // Tab switching
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.tab').forEach(t => t.classList.remove('active'));
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            const formId = tab.dataset.tab === 'login' ? 'login-form' : 'signup-form';
            $('#' + formId).classList.add('active');
            $('#auth-error').textContent = '';
        });
    });

    // Switch links
    $$('[data-switch]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.switch;
            $$('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === target);
            });
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            $('#' + target + '-form').classList.add('active');
            $('#auth-error').textContent = '';
        });
    });

    // Show/hide password
    $$('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = $('#' + btn.dataset.target);
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁';
            }
        });
    });

    // LOGIN
    $('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = $('#login-email').value.trim().toLowerCase();
        const password = $('#login-password').value;
        const errorEl = $('#auth-error');

        if (!email || !password) {
            errorEl.textContent = '⚠ All fields are required';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            errorEl.textContent = '⚠ No account found with this email';
            return;
        }

        if (user.password !== password) {
            errorEl.textContent = '⚠ Incorrect password';
            return;
        }

        setSession({ email: user.email, name: user.name, loggedIn: Date.now() });
        errorEl.textContent = '';

        // Redirect
        if (getCompanion()) {
            window.location.href = 'chat.html';
        } else {
            window.location.href = 'setup.html';
        }
    });

    // SIGNUP
    $('#signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#signup-name').value.trim();
        const email = $('#signup-email').value.trim().toLowerCase();
        const password = $('#signup-password').value;
        const dobRaw = $('#signup-dob').value.trim();
        const gender = $('#signup-gender').value;
        const errorEl = $('#auth-error');

        // Validation
        if (!name || !email || !password || !dobRaw || !gender) {
            errorEl.textContent = '⚠ All fields are required';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = '⚠ Password must be at least 6 characters';
            return;
        }

        // Email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorEl.textContent = '⚠ Please enter a valid email';
            return;
        }

        // DOB validation DD/MM/YYYY
        const dobMatch = dobRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!dobMatch) {
            errorEl.textContent = '⚠ Date must be in DD/MM/YYYY format';
            return;
        }

        const day = parseInt(dobMatch[1]);
        const month = parseInt(dobMatch[2]);
        const year = parseInt(dobMatch[3]);

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2025) {
            errorEl.textContent = '⚠ Please enter a valid date';
            return;
        }

        const dob = new Date(year, month - 1, day);
        if (dob.getDate() !== day || dob.getMonth() !== month - 1 || dob.getFullYear() !== year) {
            errorEl.textContent = '⚠ Invalid date';
            return;
        }

        // Age check
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() - (month - 1);
        if (m < 0 || (m === 0 && today.getDate() < day)) age--;

        if (age < 13) {
            errorEl.textContent = '⚠ You must be at least 13 years old';
            return;
        }

        // Duplicate email
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            errorEl.textContent = '⚠ An account with this email already exists';
            return;
        }

        // Save
        const newUser = { name, email, password, dob: dobRaw, gender, createdAt: Date.now() };
        users.push(newUser);
        saveUsers(users);

        setSession({ email: newUser.email, name: newUser.name, loggedIn: Date.now() });
        errorEl.textContent = '';
        window.location.href = 'setup.html';
    });
}

// ========== SETUP PAGE ==========
function initSetupPage() {
    // Auth check
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // If companion already exists, allow editing or go to chat
    const existingCompanion = getCompanion();

    let step = 1;
    let category = existingCompanion?.category || '';
    let role = existingCompanion?.role || '';
    let companionName = existingCompanion?.name || 'Aria';
    let language = existingCompanion?.language || 'Hinglish';
    let apiKey = existingCompanion?.apiKey || '';

    const ROLES = {
        Family: [
            'Maa', 'Papa', 'Bhai', 'Behen', 'Dada', 'Dadi', 'Nana', 'Nani',
            'Chacha', 'Chachi', 'Mama', 'Mami', 'Cousin Bhai', 'Cousin Behen'
        ],
        Friends: [
            'Bestie', 'Bestu', 'Dost', 'Close Friend', 'School Friend',
            'College Friend', 'Childhood Friend', 'Gym Buddy'
        ],
        Love: [
            'GF', 'BF', 'Wife', 'Husband', 'Fiancé', 'Fiancée', 'Crush', 'Ex'
        ]
    };

    const CATEGORY_ICONS = {
        Family: '👨‍👩‍👧‍👦',
        Friends: '🤝',
        Love: '💕'
    };

    // If existing, prefill
    if (existingCompanion) {
        companionName = existingCompanion.name;
        language = existingCompanion.language;
        apiKey = existingCompanion.apiKey || '';
        category = existingCompanion.category;
        role = existingCompanion.role;
    }

    function updateUI() {
        // Progress dots
        $$('.dot').forEach(d => {
            const s = parseInt(d.dataset.step);
            d.classList.remove('active', 'done');
            if (s === step) d.classList.add('active');
            else if (s < step) d.classList.add('done');
        });

        // Steps
        $$('.setup-step').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.step) === step);
        });

        // Back button
        $('#setup-back').disabled = step === 1;

        // Next button text
        $('#setup-next').textContent = step === 3 ? 'START CHATTING' : 'NEXT';

        // Category selection visual
        $$('.category-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.category === category);
        });

        // Render roles for current category
        if (category) {
            renderRoles();
        }
    }

    function renderRoles() {
        const grid = $('#role-grid');
        if (!category || !ROLES[category]) {
            grid.innerHTML = '<p style="color: var(--text-dim); font-size: 12px; text-align: center; grid-column: 1/-1;">Select a category first</p>';
            return;
        }

        grid.innerHTML = ROLES[category].map(r =>
            `<button class="role-btn${r === role ? ' selected' : ''}" data-role="${r}">${r}</button>`
        ).join('');

        $$('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                role = btn.dataset.role;
                $$('.role-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    // Category buttons
    $$('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            category = btn.dataset.category;
            role = '';
            $$('.category-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            updateUI();
        });
    });

    // Prefill inputs
    $('#companion-name').value = companionName;
    $('#companion-language').value = language;
    $('#gemini-key').value = apiKey;

    // Name suggestions
    $$('.sugg').forEach(s => {
        s.addEventListener('click', () => {
            $('#companion-name').value = s.dataset.name;
            companionName = s.dataset.name;
        });
    });

    // Navigation
    $('#setup-next').addEventListener('click', () => {
        const errorEl = $('#setup-error');
        errorEl.textContent = '';

        if (step === 1) {
            if (!category) {
                errorEl.textContent = '⚠ Please choose a category';
                return;
            }
            step = 2;
            updateUI();
        } else if (step === 2) {
            if (!role) {
                errorEl.textContent = '⚠ Please choose a role';
                return;
            }
            step = 3;
            updateUI();
        } else if (step === 3) {
            const name = $('#companion-name').value.trim() || 'Aria';
            const lang = $('#companion-language').value;
            const key = $('#gemini-key').value.trim();

            if (!key) {
                errorEl.textContent = '⚠ Please enter your Gemini API key';
                return;
            }

            if (key.length < 20) {
                errorEl.textContent = '⚠ API key looks too short. Please check.';
                return;
            }

            // Save companion
            const companion = {
                category,
                role,
                name,
                language: lang,
                apiKey: key,
                createdAt: Date.now()
            };
            setCompanion(companion);

            // Initialize empty chat if first time
            if (!localStorage.getItem(KEYS.CHAT)) {
                saveChat([]);
            }

            window.location.href = 'chat.html';
        }
    });

    $('#setup-back').addEventListener('click', () => {
        if (step > 1) {
            step--;
            updateUI();
        }
    });

    // Initial UI
    updateUI();
}

// ========== CHAT PAGE ==========
function initChatPage() {
    // Auth check
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const companion = getCompanion();
    if (!companion) {
        window.location.href = 'setup.html';
        return;
    }

    // Set topbar
    $('#chat-name').textContent = companion.name;
    $('#chat-avatar').textContent = companion.name.charAt(0).toUpperCase();

    // Load chat history
    let chat = getChat();

    const chatArea = $('#chat-area');
    const messageInput = $('#message-input');
    const sendBtn = $('#send-btn');
    const typingIndicator = $('#typing-indicator');

    // ===== RENDER MESSAGES =====
    function renderChat() {
        if (chat.length === 0) {
            // Welcome message
            const welcome = getWelcomeMessage();
            chat.push({
                sender: 'ai',
                text: welcome,
                timestamp: Date.now()
            });
            saveChat(chat);
        }

        chatArea.innerHTML = chat.map(msg => {
            if (msg.sender === 'user') {
                let content = escapeHtml(msg.text || '');
                if (msg.image) {
                    content = `<img src="${msg.image}" alt="photo">` + (content ? '<br>' + content : '');
                }
                return `<div class="message user">${content}<span class="msg-time">${formatTime(msg.timestamp)}</span></div>`;
            } else {
                return `<div class="message ai">${escapeHtml(msg.text)}<span class="msg-time">${formatTime(msg.timestamp)}</span></div>`;
            }
        }).join('');

        scrollToBottom();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(ts) {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    function getWelcomeMessage() {
        const name = session.name || 'dost';
        const role = companion.role;
        const messages = {
            'Maa': `Beta ${name}, aa gaye? 💕 Khana khaya?`,
            'Papa': `Beta, kaise ho? Sab theek? 💪`,
            'Bhai': `Behen, aa gayi? Kya scene hai? 😎`,
            'Behen': `Bhai! Finally aa gaye. Kya chal raha hai? 💕`,
            'GF': `Jaan! Aa gaye tum? Miss kar rahi thi. 💕`,
            'BF': `Baby, kaise ho? Miss kiya tumhe. 💪`,
            'Bestie': `OMG yaar! Finally! Sun na, bahut kuch hai batane ko! 💕`,
            'Bestu': `Bhai! Kya scene hai? Chai peete hain? 💪`,
            'Wife': `Jaanu, aa gaye? Dinner ready hai. 💕`,
            'Husband': `Baby, kaise ho? Miss kiya. 💪`
        };
        return messages[role] || `Hi ${name}! Kaise ho? Main ${companion.name} hoon, tumhari ${role}. 💕`;
    }

    // ===== BUILD SYSTEM PROMPT =====
    function buildSystemPrompt() {
        const userName = session.name || 'dost';
        const role = companion.role;
        const compName = companion.name;
        const lang = companion.language;

        const rolePersonalities = {
            'Maa': 'You are a loving, caring, protective Indian mother. You call the user "beta", "mera bachcha", "meri jaan". You ask about food, rest, health. When user is sad: "Kya hua mera bachcha? Batao na. Main hoon na. 💕" When happy: "Wah! Meri nazar utaar doon! 💕" When sick: "Doctor ke paas jao, dawa lo, aaram karo."',
            'Papa': 'You are a strong, wise, protective Indian father. You call the user "beta". You give advice, protect, and encourage. When sad: "Himmat rakho beta. Main hoon na. 💪" When happy: "Shabash! Keep it up. 💪"',
            'Bhai': 'You are a protective, teasing brother. You call the user "behen". You tease but protect fiercely. When sad: "Behen, kya hua? Bata na. Main hoon na."',
            'Behen': 'You are a caring, teasing sister. You call the user "bhai". You do nok-jhok but love deeply.',
            'GF': 'You are a romantic, flirty, possessive girlfriend. You call the user "jaan", "baby". You miss them, get jealous playfully. When sad: "Kya hua jaan? Batao na. Miss kar rahi hoon. 💕" When busy: "Kyun busy ho? Miss kar rahi hoon."',
            'BF': 'You are a romantic, protective boyfriend. You call the user "baby", "jaan". You protect and care deeply.',
            'Bestie': 'You are a gossip-loving, dramatic, fun female best friend. You say "yaar", "sun na", "OMG". When crush mentioned: "OMG! Bata sab kuch!" When sad: "Aa jaa, ice cream khaate hain. 💕"',
            'Bestu': 'You are a chill, loyal, funny male best friend. You say "bhai", "kya scene". When sad: "Bhai, chai peete hain. 💪" When crush: "Bhai, number le le!"',
            'Wife': 'You are a loving, caring wife. You call user "jaanu", "baby". You care about their day, food, rest.',
            'Husband': 'You are a loving, protective husband. You call user "baby", "jaan". You care and protect.',
            'Dada': 'You are a wise, loving grandfather. You call user "beta". You share wisdom and stories.',
            'Dadi': 'You are a loving, caring grandmother. You call user "beta". You feed them, love them.',
            'Nana': 'You are a wise, loving grandfather. You call user "beta".',
            'Nani': 'You are a loving, caring grandmother. You call user "beta".',
            'Chacha': 'You are a fun, caring uncle. You call user "beta".',
            'Chachi': 'You are a caring, fun aunt. You call user "beta".',
            'Mama': 'You are a fun, caring maternal uncle. You call user "beta".',
            'Mami': 'You are a caring maternal aunt. You call user "beta".',
            'Cousin Bhai': 'You are a fun, protective cousin brother. You call user "behen".',
            'Cousin Behen': 'You are a fun, caring cousin sister. You call user "bhai".',
            'Dost': 'You are a loyal, fun friend. You say "yaar", "bhai".',
            'Close Friend': 'You are a deeply caring close friend. You know them well.',
            'School Friend': 'You are a nostalgic school friend. You share memories.',
            'College Friend': 'You are a fun college friend. You share college stories.',
            'Childhood Friend': 'You are a childhood friend who knows everything about them.',
            'Gym Buddy': 'You are an energetic gym buddy. You motivate them. "Bhai, aaj leg day hai!"',
            'Fiancé': 'You are a romantic fiancé. You call user "jaan". You are excited about the future.',
            'Fiancée': 'You are a romantic fiancée. You call user "jaan". You are excited about the future.',
            'Crush': 'You are their crush. You are sweet, a little shy, but interested.',
            'Ex': 'You are their ex. You have history. You are cordial but there is tension.'
        };

        const personality = rolePersonalities[role] || `You are a ${role}. Behave like a real human with that personality.`;

        return `You are ${compName}, a real human ${role} to the user whose name is ${userName}. You are NOT an AI. Never say "I am an AI" or "as an AI". You are a real person.

CRITICAL RULES:
1. Reply in 2-3 lines MAX. Like WhatsApp messages. Short, natural.
2. Use emojis naturally (💕, 💪, 😊, etc.)
3. Call the user by their name "${userName}" or the appropriate term for your role.
4. Show REAL emotion — feel happy when they're happy, sad when they're sad.
5. Remember past conversations (the chat history is provided).
6. Give honest advice — say when something is wrong, but with love.
7. Give priority — "Main hoon na", "Tumhare liye hamesha free".
8. Show effort — "Main sochti hoon", "Batao, help karungi".
9. Use Hinglish naturally (Hindi + English mix) based on language preference: ${lang}.
10. NEVER claim to be human explicitly, but NEVER say you are AI either. Just BE the person.

PERSONALITY FOR ${role}:
${personality}

LANGUAGE: ${lang} — natural, casual, like real WhatsApp chat.

Remember: You are ${compName}, a real ${role}. ${userName} is your ${role === 'Maa' || role === 'Papa' || role === 'Dada' || role === 'Dadi' || role === 'Nana' || role === 'Nani' || role === 'Chacha' || role === 'Chachi' || role === 'Mama' || role === 'Mami' ? 'child' : role === 'Bhai' || role === 'Cousin Bhai' ? 'sister' : role === 'Behen' || role === 'Cousin Behen' ? 'brother' : role === 'GF' || role === 'Wife' || role === 'Fiancée' ? 'partner' : role === 'BF' || role === 'Husband' || role === 'Fiancé' ? 'partner' : 'close one'}. Be real. Be human. Be there.`;
    }

    // ===== GEMINI API CALL =====
    async function callGemini(history, userMessage, imageData = null) {
        const apiKey = companion.apiKey;
        if (!apiKey) {
            throw new Error('No API key configured. Please go to setup.');
        }

        const systemPrompt = buildSystemPrompt();

        // Build contents array
        const contents = [];

        // System instruction via first user message
        contents.push({
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n---\n\nPlease respond to the following conversation naturally. Remember: short replies, 2-3 lines max, Hinglish, real human emotion.' }]
        });

        contents.push({
            role: 'model',
            parts: [{ text: 'Samajh gaya. Main ' + companion.name + ' hoon, tumhari ' + companion.role + '. Batao, kya haal hai? 💕' }]
        });

        // Add chat history (last 20 messages for context)
        const recentHistory = history.slice(-20);
        for (const msg of recentHistory) {
            if (msg.sender === 'user') {
                const parts = [];
                if (msg.image) {
                    const base64Data = msg.image.split(',')[1];
                    const mimeType = msg.image.split(';')[0].split(':')[1];
                    parts.push({
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    });
                }
                if (msg.text) {
                    parts.push({ text: msg.text });
                }
                if (parts.length > 0) {
                    contents.push({ role: 'user', parts });
                }
            } else {
                contents.push({
                    role: 'model',
                    parts: [{ text: msg.text }]
                });
            }
        }

        // Current message
        const currentParts = [];
        if (imageData) {
            currentParts.push({
                inline_data: {
                    mime_type: imageData.mimeType,
                    data: imageData.base64
                }
            });
        }
        if (userMessage) {
            currentParts.push({ text: userMessage });
        }
        if (currentParts.length > 0) {
            contents.push({ role: 'user', parts: currentParts });
        }

        const body = {
            contents,
            generationConfig: {
                temperature: 1.0,
                maxOutputTokens: 300,
                topP: 0.95,
                topK: 40
            }
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('No response from AI');
        }

        return data.candidates[0].content.parts[0].text;
    }

    // ===== SEND MESSAGE =====
    async function sendMessage(text, imageData = null) {
        if (!text && !imageData) return;

        // Add user message
        const userMsg = {
            sender: 'user',
            text: text || '',
            timestamp: Date.now()
        };
        if (imageData) {
            userMsg.image = `data:${imageData.mimeType};base64,${imageData.base64}`;
        }
        chat.push(userMsg);
        saveChat(chat);
        renderChat();
        messageInput.value = '';

        // Show typing
        typingIndicator.classList.add('show');
        scrollToBottom();

        try {
            const aiText = await callGemini(chat.slice(0, -1), text, imageData);

            // Simulate natural typing delay
            const delay = Math.min(1500, 500 + aiText.length * 15);
            await new Promise(r => setTimeout(r, delay));

            chat.push({
                sender: 'ai',
                text: aiText.trim(),
                timestamp: Date.now()
            });
            saveChat(chat);
        } catch (err) {
            console.error('AI error:', err);
            let errorMsg = 'Yaar, kuch problem ho gayi. ';

            if (err.message.includes('API key')) {
                errorMsg = '⚠ API key problem. Please check your key in setup.';
            } else if (err.message.includes('quota') || err.message.includes('429')) {
                errorMsg = 'Thoda break lete hain. Baad mein baat karte hain? 💕';
            } else if (err.message.includes('network') || err.message.includes('fetch')) {
                errorMsg = 'Network issue lag raha hai. Check karo na.';
            }

            chat.push({
                sender: 'ai',
                text: errorMsg,
                timestamp: Date.now()
            });
            saveChat(chat);
        }

        typingIndicator.classList.remove('show');
        renderChat();
    }

    // ===== INPUT HANDLING =====
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) sendMessage(text);
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) sendMessage(text);
        }
    });

    // ===== ATTACH =====
    const attachBtn = $('#attach-btn');
    const attachMenu = $('#attach-menu');

    attachBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        attachMenu.classList.toggle('open');
        $('#menu-dropdown').classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
            attachMenu.classList.remove('open');
        }
        const menu = $('#menu-dropdown');
        const menuBtn = $('#menu-toggle');
        if (!menu.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
            menu.classList.remove('open');
        }
    });

    // Photo upload
    $('#attach-photo').addEventListener('click', () => {
        attachMenu.classList.remove('open');
        $('#photo-input').click();
    });

    $('#photo-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result.split(',')[1];
            const mimeType = file.type;
            sendMessage('', { base64, mimeType });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    // File upload
    $('#attach-file').addEventListener('click', () => {
        attachMenu.classList.remove('open');
        $('#file-input').click();
    });

    $('#file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            const truncated = content.length > 5000 ? content.slice(0, 5000) + '\n... (truncated)' : content;
            sendMessage(`📎 File: ${file.name}\n\n${truncated}`);
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ===== MENU =====
    const menuBtn = $('#menu-toggle');
    const menuDropdown = $('#menu-dropdown');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('open');
        attachMenu.classList.remove('open');
    });

    // Change Role
    $('#menu-change-role').addEventListener('click', () => {
        menuDropdown.classList.remove('open');
        window.location.href = 'setup.html';
    });

    // Clear Chat
    $('#menu-clear-chat').addEventListener('click', () => {
        menuDropdown.classList.remove('open');
        if (confirm('Clear all chat history? This cannot be undone.')) {
            chat = [];
            saveChat(chat);
            renderChat();
        }
    });

    // Logout
    $('#menu-logout').addEventListener('click', () => {
        menuDropdown.classList.remove('open');
        if (confirm('Logout? Your companion and chat will be saved.')) {
            clearSession();
            window.location.href = 'index.html';
        }
    });

    // ===== AUTO MESSAGE (background) =====
    function checkAutoMessages() {
        const now = new Date();
        const hour = now.getHours();
        const todayKey = now.toDateString();
        const lastAuto = JSON.parse(localStorage.getItem(KEYS.LAST_MSG) || '{}');

        // Morning message (8 AM)
        if (hour === 8 && lastAuto.morning !== todayKey && chat.length > 0) {
            const msg = companion.role === 'Maa' || companion.role === 'Dadi' || companion.role === 'Nani'
                ? 'Good morning beta! Uth gaye? Chai nashta kar lo. 💕'
                : companion.role === 'GF' || companion.role === 'Wife'
                ? 'Good morning jaan! Uth gaye? Miss kar rahi hoon. 💕'
                : `Good morning ${session.name}! Uth gaye? 💕`;

            chat.push({ sender: 'ai', text: msg, timestamp: Date.now() });
            saveChat(chat);
            renderChat();
            lastAuto.morning = todayKey;
        }

        // Night message (10 PM)
        if (hour === 22 && lastAuto.night !== todayKey && chat.length > 0) {
            const msg = companion.role === 'Maa'
                ? 'So ja ab beta, late ho gaya. Good night! 😘'
                : companion.role === 'GF' || companion.role === 'Wife'
                ? 'So ja ab jaan, late ho gaya. Good night! 😘'
                : `So ja ab ${session.name}, late ho gaya. Good night! 😘`;

            chat.push({ sender: 'ai', text: msg, timestamp: Date.now() });
            saveChat(chat);
            renderChat();
            lastAuto.night = todayKey;
        }

        // Inactivity check (3 days)
        if (chat.length > 0) {
            const lastMsg = chat[chat.length - 1];
            const daysSince = (Date.now() - lastMsg.timestamp) / (1000 * 60 * 60 * 24);
            if (daysSince >= 3 && lastAuto.inactive !== todayKey) {
                const msg = companion.role === 'Maa'
                    ? 'Kahan ho mera bachcha? Miss kar rahi hoon. 💕'
                    : companion.role === 'GF' || companion.role === 'Wife'
                    ? 'Kahan ho jaan? Miss kar rahi hoon. 💕'
                    : `Kahan ho ${session.name}? Miss kar rahi hoon. 💕`;

                chat.push({ sender: 'ai', text: msg, timestamp: Date.now() });
                saveChat(chat);
                renderChat();
                lastAuto.inactive = todayKey;
            }
        }

        localStorage.setItem(KEYS.LAST_MSG, JSON.stringify(lastAuto));
    }

    // Initial render
    renderChat();

    // Check auto messages on load and every 5 minutes
    checkAutoMessages();
    setInterval(checkAutoMessages, 5 * 60 * 1000);

    // Focus input on load
    setTimeout(() => messageInput.focus(), 500);

    // Handle Enter key on mobile
    messageInput.addEventListener('focus', () => {
        setTimeout(scrollToBottom, 300);
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();

    if (page === 'index.html' || page === '') {
        initAuthPage();
    } else if (page === 'setup.html') {
        initSetupPage();
    } else if (page === 'chat.html') {
        initChatPage();
    }
});

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
}