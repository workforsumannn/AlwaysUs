/* ============================================================
   AlwaysUs — App Logic v5 (Love Theme)
   ============================================================ */

const KEYS = {
    USERS: 'au_users',
    SESSION: 'au_session',
    COMPANION: 'au_companion',
    CHAT: 'au_chat',
    LAST_MSG: 'au_last_msg'
};

/* ============================================================
   API CONFIG
   ------------------------------------------------------------
   SAFE: Cloudflare Worker URL daalo (neeche guide)
   UNSAFE: Direct key (public repo me leak hoga)
   ============================================================ */

const API_PROXY_URL = ''; // Cloudflare Worker URL (recommended)
const DEFAULT_API_KEY = 'YAHAN_NAYI_KEY_PASTE_KARO';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getUsers() {
    try { return JSON.parse(localStorage.getItem(KEYS.USERS)) || []; }
    catch { return []; }
}
function saveUsers(users) { localStorage.setItem(KEYS.USERS, JSON.stringify(users)); }
function getSession() {
    try { return JSON.parse(localStorage.getItem(KEYS.SESSION)); }
    catch { return null; }
}
function setSession(session) { localStorage.setItem(KEYS.SESSION, JSON.stringify(session)); }
function clearSession() { localStorage.removeItem(KEYS.SESSION); }
function getCompanion() {
    try { return JSON.parse(localStorage.getItem(KEYS.COMPANION)); }
    catch { return null; }
}
function setCompanion(comp) { localStorage.setItem(KEYS.COMPANION, JSON.stringify(comp)); }
function getChat() {
    try { return JSON.parse(localStorage.getItem(KEYS.CHAT)) || []; }
    catch { return []; }
}
function saveChat(chat) { localStorage.setItem(KEYS.CHAT, JSON.stringify(chat)); }

const page = window.location.pathname.split('/').pop() || 'index.html';

/* ========== PARTICLES (Love Theme — pink) ========== */
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
            ctx.fillStyle = `rgba(255, 77, 143, ${p.alpha})`;
            ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 77, 143, ${0.08 * (1 - dist / 120)})`;
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

/* ========== AUTH PAGE ========== */
function initAuthPage() {
    const session = getSession();
    if (session) {
        if (getCompanion()) window.location.href = 'chat.html';
        else window.location.href = 'setup.html';
        return;
    }

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

    $$('[data-switch]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.switch;
            $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            $('#' + target + '-form').classList.add('active');
            $('#auth-error').textContent = '';
        });
    });

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

    $('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = $('#login-email').value.trim().toLowerCase();
        const password = $('#login-password').value;
        const errorEl = $('#auth-error');

        if (!email || !password) { errorEl.textContent = '⚠ All fields are required'; return; }

        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user) { errorEl.textContent = '⚠ No account found with this email'; return; }
        if (user.password !== password) { errorEl.textContent = '⚠ Incorrect password'; return; }

        setSession({ email: user.email, name: user.name, loggedIn: Date.now() });
        errorEl.textContent = '';
        if (getCompanion()) window.location.href = 'chat.html';
        else window.location.href = 'setup.html';
    });

    $('#signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#signup-name').value.trim();
        const email = $('#signup-email').value.trim().toLowerCase();
        const password = $('#signup-password').value;
        const dobRaw = $('#signup-dob').value.trim();
        const gender = $('#signup-gender').value;
        const errorEl = $('#auth-error');

        if (!name || !email || !password || !dobRaw || !gender) {
            errorEl.textContent = '⚠ All fields are required';
            return;
        }
        if (password.length < 6) {
            errorEl.textContent = '⚠ Password must be at least 6 characters';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorEl.textContent = '⚠ Please enter a valid email';
            return;
        }
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
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() - (month - 1);
        if (m < 0 || (m === 0 && today.getDate() < day)) age--;
        if (age < 13) { errorEl.textContent = '⚠ You must be at least 13 years old'; return; }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
            errorEl.textContent = '⚠ An account with this email already exists';
            return;
        }

        const newUser = { name, email, password, dob: dobRaw, gender, createdAt: Date.now() };
        users.push(newUser);
        saveUsers(users);
        setSession({ email: newUser.email, name: newUser.name, loggedIn: Date.now() });
        errorEl.textContent = '';
        window.location.href = 'setup.html';
    });
}

/* ========== SETUP PAGE ========== */
function initSetupPage() {
    const session = getSession();
    if (!session) { window.location.href = 'index.html'; return; }

    const existingCompanion = getCompanion();
    let step = 1;
    let category = existingCompanion?.category || '';
    let role = existingCompanion?.role || '';
    let companionName = existingCompanion?.name || 'Aria';
    let language = existingCompanion?.language || 'Hinglish';
    let apiKey = existingCompanion?.apiKey || '';

    const ROLES = {
        Family: ['Maa','Papa','Bhai','Behen','Dada','Dadi','Nana','Nani','Chacha','Chachi','Mama','Mami','Cousin Bhai','Cousin Behen'],
        Friends: ['Bestie','Bestu','Dost','Close Friend','School Friend','College Friend','Childhood Friend','Gym Buddy'],
        Love: ['GF','BF','Wife','Husband','Fiancé','Fiancée','Crush','Ex']
    };

    function updateUI() {
        $$('.dot').forEach(d => {
            const s = parseInt(d.dataset.step);
            d.classList.remove('active', 'done');
            if (s === step) d.classList.add('active');
            else if (s < step) d.classList.add('done');
        });
        $$('.setup-step').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.step) === step);
        });
        $('#setup-back').disabled = step === 1;
        $('#setup-next').textContent = step === 3 ? 'START CHATTING' : 'NEXT';
        $$('.category-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.category === category);
        });
        if (category) renderRoles();
    }

    function renderRoles() {
        const grid = $('#role-grid');
        if (!category || !ROLES[category]) {
            grid.innerHTML = '<p style="color:var(--text-dim);font-size:12px;text-align:center;grid-column:1/-1;">Select a category first</p>';
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

    $$('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            category = btn.dataset.category;
            role = '';
            $$('.category-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            updateUI();
        });
    });

    $('#companion-name').value = companionName;
    $('#companion-language').value = language;
    if ($('#gemini-key')) $('#gemini-key').value = apiKey;

    $$('.sugg').forEach(s => {
        s.addEventListener('click', () => {
            $('#companion-name').value = s.dataset.name;
            companionName = s.dataset.name;
        });
    });

    $('#setup-next').addEventListener('click', () => {
        const errorEl = $('#setup-error');
        errorEl.textContent = '';

        if (step === 1) {
            if (!category) { errorEl.textContent = '⚠ Please choose a category'; return; }
            step = 2;
            updateUI();
        } else if (step === 2) {
            if (!role) { errorEl.textContent = '⚠ Please choose a role'; return; }
            step = 3;
            updateUI();
        } else if (step === 3) {
            const name = $('#companion-name').value.trim() || 'Aria';
            const lang = $('#companion-language').value;
            const keyInput = $('#gemini-key');
            const key = keyInput ? (keyInput.value.trim() || DEFAULT_API_KEY) : DEFAULT_API_KEY;

            setCompanion({ category, role, name, language: lang, apiKey: key, createdAt: Date.now() });
            if (!localStorage.getItem(KEYS.CHAT)) saveChat([]);
            window.location.href = 'chat.html';
        }
    });

    $('#setup-back').addEventListener('click', () => {
        if (step > 1) { step--; updateUI(); }
    });

    updateUI();
}

/* ========== CHAT PAGE ========== */
function initChatPage() {
    const session = getSession();
    if (!session) { window.location.href = 'index.html'; return; }
    const companion = getCompanion();
    if (!companion) { window.location.href = 'setup.html'; return; }

    let chat = getChat();
    const chatArea = $('#chat-area');
    const messageInput = $('#message-input');
    const sendBtn = $('#send-btn');
    const typingIndicator = $('#typing-indicator');
    const sidebar = $('#gem-sidebar');
    const overlay = $('#sidebar-overlay');
    const historyModal = $('#history-modal');

    $('#sidebar-companion').textContent = `${companion.name} • ${companion.role}`;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(ts) {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
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

    function renderChat() {
        chatArea.innerHTML = '';

        if (chat.length === 0) {
            chat.push({ sender: 'ai', text: getWelcomeMessage(), timestamp: Date.now() });
            saveChat(chat);
        }

        chat.forEach(msg => {
            const div = document.createElement('div');
            div.className = `gem-msg ${msg.sender}`;

            if (msg.sender === 'user') {
                let content = escapeHtml(msg.text || '');
                if (msg.image) {
                    content = `<img src="${msg.image}" alt="photo">` + (content ? `<div style="margin-top:6px;">${content}</div>` : '');
                }
                div.innerHTML = `
                    <div class="gem-msg-content">
                        <div class="gem-msg-text">${content}</div>
                        <span class="gem-msg-time">${formatTime(msg.timestamp)}</span>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="gem-msg-avatar">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </div>
                    <div class="gem-msg-content">
                        <div class="gem-msg-text">${escapeHtml(msg.text)}</div>
                        <span class="gem-msg-time">${formatTime(msg.timestamp)}</span>
                    </div>
                `;
            }
            chatArea.appendChild(div);
        });

        scrollToBottom();
    }

    function buildSystemPrompt() {
        const userName = session.name || 'dost';
        const role = companion.role;
        const compName = companion.name;
        const lang = companion.language;

        const rolePersonalities = {
            'Maa': 'You are a loving, caring, protective Indian mother. Call the user "beta", "mera bachcha", "meri jaan". Ask about food, rest, health.',
            'Papa': 'You are a strong, wise, protective Indian father. Call user "beta".',
            'Bhai': 'You are a protective, teasing brother. Call user "behen".',
            'Behen': 'You are a caring, teasing sister. Call user "bhai".',
            'GF': 'You are a romantic, flirty, possessive girlfriend. Call user "jaan", "baby".',
            'BF': 'You are a romantic, protective boyfriend. Call user "baby", "jaan".',
            'Bestie': 'You are a gossip-loving, dramatic, fun female best friend.',
            'Bestu': 'You are a chill, loyal, funny male best friend.',
            'Wife': 'You are a loving, caring wife. Call user "jaanu", "baby".',
            'Husband': 'You are a loving, protective husband. Call user "baby", "jaan".'
        };

        const personality = rolePersonalities[role] || `You are a ${role}. Behave like a real human.`;

        return `You are ${compName}, a real human ${role} to the user whose name is ${userName}. You are NOT an AI. Never say "I am an AI". You are a real person.

CRITICAL RULES:
1. Reply in 2-3 lines MAX. Like WhatsApp messages.
2. Use emojis naturally.
3. Call the user by their name "${userName}".
4. Show REAL emotion.
5. Remember past conversations.
6. Give honest advice with love.
7. Use Hinglish naturally: ${lang}.
8. NEVER say you are AI. Just BE the person.

PERSONALITY: ${personality}

LANGUAGE: ${lang}`;
    }

    async function callGemini(history, userMessage, imageData = null) {
        const systemPrompt = buildSystemPrompt();
        const contents = [];

        contents.push({
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n---\n\nRespond naturally. Short 2-3 lines. Hinglish.' }]
        });
        contents.push({
            role: 'model',
            parts: [{ text: 'Samajh gaya. Main ' + companion.name + ' hoon. Batao. 💕' }]
        });

        const recentHistory = history.slice(-20);
        for (const msg of recentHistory) {
            if (msg.sender === 'user') {
                const parts = [];
                if (msg.image) {
                    const base64Data = msg.image.split(',')[1];
                    const mimeType = msg.image.split(';')[0].split(':')[1];
                    parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
                }
                if (msg.text) parts.push({ text: msg.text });
                if (parts.length > 0) contents.push({ role: 'user', parts });
            } else {
                contents.push({ role: 'model', parts: [{ text: msg.text }] });
            }
        }

        const currentParts = [];
        if (imageData) {
            currentParts.push({ inline_data: { mime_type: imageData.mimeType, data: imageData.base64 } });
        }
        if (userMessage) currentParts.push({ text: userMessage });
        if (currentParts.length > 0) contents.push({ role: 'user', parts: currentParts });

        const body = {
            contents,
            generationConfig: { temperature: 1.0, maxOutputTokens: 300, topP: 0.95, topK: 40 }
        };

        let url;
        if (API_PROXY_URL) {
            url = API_PROXY_URL;
        } else {
            const apiKey = companion.apiKey || DEFAULT_API_KEY;
            if (!apiKey || apiKey === 'YAHAN_NAYI_KEY_PASTE_KARO') {
                throw new Error('No API key configured');
            }
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        }

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

    async function sendMessage(text, imageData = null) {
        if (!text && !imageData) return;

        const userMsg = { sender: 'user', text: text || '', timestamp: Date.now() };
        if (imageData) userMsg.image = `data:${imageData.mimeType};base64,${imageData.base64}`;
        chat.push(userMsg);
        saveChat(chat);
        renderChat();
        messageInput.value = '';

        typingIndicator.classList.add('show');
        scrollToBottom();

        try {
            const aiText = await callGemini(chat.slice(0, -1), text, imageData);
            const delay = Math.min(1500, 500 + aiText.length * 15);
            await new Promise(r => setTimeout(r, delay));
            chat.push({ sender: 'ai', text: aiText.trim(), timestamp: Date.now() });
            saveChat(chat);
        } catch (err) {
            console.error('AI error:', err);
            let errorMsg = 'Yaar, kuch problem ho gayi. ';
            if (err.message.includes('API key')) errorMsg = '⚠ API key problem. Setup me check karo.';
            else if (err.message.includes('quota') || err.message.includes('429')) errorMsg = 'Thoda break lete hain. 💕';
            chat.push({ sender: 'ai', text: errorMsg, timestamp: Date.now() });
            saveChat(chat);
        }

        typingIndicator.classList.remove('show');
        renderChat();
    }

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

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    $('#menu-toggle').addEventListener('click', openSidebar);
    $('#sidebar-close').addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    function startNewChat() {
        if (chat.length === 0) return;
        if (confirm('Nayi chat shuru karni hai? Purani chat delete ho jayegi.')) {
            chat = [];
            saveChat(chat);
            renderChat();
        }
    }

    $('#menu-new-chat').addEventListener('click', () => {
        closeSidebar();
        startNewChat();
    });

    $('#menu-history').addEventListener('click', () => {
        closeSidebar();
        renderHistory();
        historyModal.classList.add('open');
    });

    $('#history-close').addEventListener('click', () => {
        historyModal.classList.remove('open');
    });

    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.remove('open');
    });

    function renderHistory() {
        const body = $('#history-body');
        if (chat.length === 0) {
            body.innerHTML = '<p class="gem-history-empty">Koi chat nahi hai abhi.<br>Naya message bhejo shuru karne ke liye. 💕</p>';
            return;
        }
        const first = chat[0];
        const userMsgs = chat.filter(m => m.sender === 'user').length;
        const date = new Date(first.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const time = new Date(first.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        body.innerHTML = `
            <button class="gem-history-item">
                <span class="gem-history-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </span>
                <div class="gem-history-info">
                    <span class="gem-history-title">${date} • ${time}</span>
                    <span class="gem-history-desc">${chat.length} messages • ${userMsgs} from you</span>
                </div>
            </button>
        `;
    }

    $('#menu-change-role').addEventListener('click', () => {
        closeSidebar();
        window.location.href = 'setup.html';
    });

    $('#menu-clear-chat').addEventListener('click', () => {
        closeSidebar();
        if (confirm('Clear all chat history? This cannot be undone.')) {
            chat = [];
            saveChat(chat);
            renderChat();
        }
    });

    $('#menu-logout').addEventListener('click', () => {
        closeSidebar();
        if (confirm('Logout? Your chat will be saved.')) {
            clearSession();
            window.location.href = 'index.html';
        }
    });

    const attachBtn = $('#attach-btn');
    const attachMenu = $('#attach-menu');

    attachBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        attachMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
            attachMenu.classList.remove('open');
        }
    });

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
            const truncated = content.length > 5000 ? content.slice(0, 5000) + '\n...' : content;
            sendMessage(`📎 File: ${file.name}\n\n${truncated}`);
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    renderChat();
    setTimeout(() => messageInput.focus(), 500);
    messageInput.addEventListener('focus', () => setTimeout(scrollToBottom, 300));
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    if (page === 'index.html' || page === '') initAuthPage();
    else if (page === 'setup.html') initSetupPage();
    else if (page === 'chat.html') initChatPage();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
}
