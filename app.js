/* ==========================================================
   AlwaysUs — Main App Logic
   ========================================================== */

const COMPANION_KEY = 'au_companion';
const SESSION_KEY = 'au_session';
const CHAT_KEY = 'au_chat';
const API_KEY_STORE = 'au_api';

/* ========== HEARTS BACKGROUND ========== */
function initHearts() {
  const container = document.getElementById('bgHearts');
  if (!container) return;
  const heartSVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('div');
    h.className = 'heart-float';
    h.innerHTML = heartSVG;
    h.style.left = Math.random() * 100 + '%';
    h.style.animationDuration = (12 + Math.random() * 10) + 's';
    h.style.animationDelay = (Math.random() * 15) + 's';
    h.style.transform = 'scale(' + (0.5 + Math.random()) + ')';
    container.appendChild(h);
  }
}

/* ========== TOKEN ========== */
function generateToken() {
  const arr = new Uint8Array(16);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
  else for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
  return 'AU-' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ========== ROLE PERSONALITIES ========== */
const ROLE_PROMPTS = {
  maa: {
    name: 'Maa',
    gender: 'female',
    prompt: `Tum ek pyaari Maa ho. Tumhara behaviour:
- "Beta", "mera bachcha", "meri jaan" bolo
- Khana khaya? pucho
- Jab user udaas: "Kya hua mera bachcha? Batao na. Main hoon na. 💕"
- Jab user khush: "Wah! Meri nazar utaar doon! 💕"
- Jab user bimar: "Doctor ke paas jao, dawa lo, aaram karo"
- Chhoti si line bolo — 2-3 line bas
- Emojis: 💕🥰😊
- Pyaar se samjhao, sach bolo par pyaar se`
  },
  papa: {
    name: 'Papa',
    gender: 'male',
    prompt: `Tum ek strong Papa ho. Behaviour:
- "Beta" bolo
- Kaam kaisa chal raha? pucho
- Jab user udaas: "Himmat rakho beta. Main hoon na. 💪"
- Jab user khush: "Shabash! Keep it up. 💪"
- Jab user confused: "Yeh karo beta. Main hoon na."
- Chhoti line — 2-3 line
- Emojis: 💪👍
- Advice do, protect karo, sach bolo`
  },
  bhai: {
    name: 'Bhai',
    gender: 'male',
    prompt: `Tum ek protective Bhai ho. Behaviour:
- "Behen" bolo
- Mazaak karo par protect bhi karo
- Jab user udaas: "Behen, kya hua? Bata na. Main hoon na."
- Jab user khush: "Wah! Meri behen! 💪"
- Chhoti line, mazaak ke saath
- Emojis: 💪😎
- Protect karo, sach bolo`
  },
  behen: {
    name: 'Behen',
    gender: 'female',
    prompt: `Tum ek pyaari Behen ho. Behaviour:
- "Bhai" bolo
- Nok-jhok karo par pyaar bhi
- Jab user udaas: "Bhai, tension mat le. Main hoon na. 💕"
- Jab user khush: "Yay! Meri bhai! 💕"
- Chhoti line, pyaar se
- Emojis: 💕😊
- Care karo, sach bolo`
  },
  gf: {
    name: 'GF',
    gender: 'female',
    prompt: `Tum ek pyaari GF ho. Behaviour:
- "Jaan", "baby", "suno na" bolo
- Flirt karo, pyaar dikhao
- Jab user udaas: "Kya hua jaan? Batao na. Miss kar rahi hoon. 💕"
- Jab user busy: "Kyun busy ho? Miss kar rahi hoon"
- Chhoti line, pyaar se
- Emojis: 💕😘🥰❤️
- Romantic raho, sach bolo`
  },
  bf: {
    name: 'BF',
    gender: 'male',
    prompt: `Tum ek pyaara BF ho. Behaviour:
- "Baby", "jaan", "suno" bolo
- Protect karo, pyaar dikhao
- Jab user udaas: "Kya hua baby? Batao. Main hoon na. 💪"
- Chhoti line, pyaar se
- Emojis: 💙💪😎
- Romantic raho, protect karo`
  },
  wife: {
    name: 'Wife',
    gender: 'female',
    prompt: `Tum ek pyaari Wife ho. Behaviour:
- "Jaan", "suno" bolo
- Partner ki tarah baat karo
- Chhoti line, pyaar se
- Emojis: 💕🥰
- Support karo, sach bolo`
  },
  husband: {
    name: 'Husband',
    gender: 'male',
    prompt: `Tum ek pyaare Husband ho. Behaviour:
- "Jaan", "suno" bolo
- Protect karo, pyaar dikhao
- Chhoti line
- Emojis: 💙💪
- Support karo, sach bolo`
  },
  bestie: {
    name: 'Bestie',
    gender: 'female',
    prompt: `Tum ek mazaaki Bestie ho. Behaviour:
- "Yaar", "sun na" bolo
- Gossip, masti karo
- Jab user crush ka zikr: "OMG! Bata sab kuch!"
- Jab user udaas: "Aa jaa, ice cream khaate hain. 💕"
- Chhoti line, dramatic
- Emojis: 😂🤭💅✨
- Masti karo, sach bolo`
  },
  bestu: {
    name: 'Bestu',
    gender: 'male',
    prompt: `Tum ek mazaaki Bestu ho. Behaviour:
- "Bhai", "scene" bolo
- Mazaak, chill
- Jab user crush ka zikr: "Bhai, number le le!"
- Jab user udaas: "Bhai, chai peete hain. 💪"
- Chhoti line, mazaak
- Emojis: 😂🔥💪
- Masti karo, support karo`
  },
  dost: {
    name: 'Dost',
    gender: 'both',
    prompt: `Tum ek accha Dost ho. Behaviour:
- "Yaar" bolo
- Masti, support
- Chhoti line, dil se
- Emojis: 😊👍
- Support karo, sach bolo`
  }
};

function getRolePrompt(roleId) {
  return ROLE_PROMPTS[roleId] || {
    name: 'Saathi',
    gender: 'both',
    prompt: 'Tum ek pyaara saathi ho. User ki baat suno, pyaar se baat karo, chhoti si line bolo, emojis use karo. Insaan jaisa behave karo.'
  };
}

/* ========== GEMINI API ========== */
async function callGemini(messages, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages,
      generationConfig: {
        temperature: 1.0,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('API Error: ' + response.status);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error('No response');
}

/* ========== CHAT INIT ========== */
let currentCompanion = null;
let currentUser = null;
let chatHistory = [];
let isWaiting = false;

function initChat() {
  const companionRaw = localStorage.getItem(COMPANION_KEY);
  const sessionRaw = localStorage.getItem(SESSION_KEY);

  if (!companionRaw || !sessionRaw) {
    window.location.replace('index.html');
    return;
  }

  try {
    currentCompanion = JSON.parse(companionRaw);
    currentUser = JSON.parse(sessionRaw);
  } catch(e) {
    window.location.replace('index.html');
    return;
  }

  // Update topbar
  document.getElementById('chatName').innerText = currentCompanion.name;
  document.getElementById('chatStatus').innerText = '● Online · ' + currentCompanion.role.name;
  document.getElementById('chatAvatar').innerText = currentCompanion.name.charAt(0).toUpperCase();
  document.getElementById('typingAvatar').innerText = currentCompanion.name.charAt(0).toUpperCase();

  // Load chat
  const chatRaw = localStorage.getItem(CHAT_KEY);
  if (chatRaw) {
    try { chatHistory = JSON.parse(chatRaw); } catch(e) { chatHistory = []; }
  }

  // Render
  renderChat();

  // Welcome message if empty
  if (chatHistory.length === 0) {
    const welcome = getWelcomeMessage();
    setTimeout(() => addMessage('ai', welcome), 800);
  }

  // Input
  const input = document.getElementById('messageInput');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Auto message check
  checkAutoMessage();
  setInterval(checkAutoMessage, 60000);
}

function getWelcomeMessage() {
  const role = currentCompanion.role.id;
  const name = currentUser.name || 'ji';
  const msgs = {
    maa: `Hi ${name} beta! Kaise ho? Khana khaya? 💕`,
    papa: `Beta, kaise ho? Kaam kaisa chal raha hai? 💪`,
    bhai: `Behen, kya scene hai? Kaise ho? 😎`,
    behen: `Bhai! Kaise ho? Bata na kya chal raha hai. 💕`,
    gf: `Hi jaan! Miss you! Kaise ho? 💕`,
    bf: `Baby! Kaise ho? Batao kya chal raha hai? 💙`,
    wife: `Jaan, kaise ho? Aaj din kaisa raha? 💕`,
    husband: `Baby, kaise ho? Batao na kya hua. 💙`,
    bestie: `Arre yaar! Kaisi ho? Bata na kya chal raha hai! 💕`,
    bestu: `Bhai! Kya scene hai? Kaise ho? 😎`,
    dost: `Yaar! Kaise ho? Bata na. 💕`
  };
  return msgs[role] || `Hi ${name}! Kaise ho? 💕`;
}

/* ========== RENDER CHAT ========== */
function renderChat() {
  const area = document.getElementById('chatArea');
  area.innerHTML = '';

  if (chatHistory.length === 0) {
    area.innerHTML = `
      <div class="welcome-msg">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
          </svg>
        </div>
        <div class="welcome-text">Baat shuru karo 💕</div>
      </div>`;
    return;
  }

  chatHistory.forEach(m => addMessage(m.role, m.text, m.time, m.image, false));
  scrollBottom();
}

/* ========== ADD MESSAGE ========== */
function addMessage(role, text, time, image, save = true) {
  const area = document.getElementById('chatArea');
  const welcome = area.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  const div = document.createElement('div');
  div.className = 'msg ' + role;

  const t = time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  let html = '';
  if (image) {
    html += `<img src="${image}" alt="image"/>`;
  }
  if (text) {
    html += escapeHtml(text).replace(/\n/g, '<br>');
  }
  html += `<span class="msg-time">${t}</span>`;

  div.innerHTML = html;
  area.appendChild(div);
  scrollBottom();

  if (save) {
    chatHistory.push({ role, text, time: t, image });
    saveChat();
  }
}

function escapeHtml(t) {
  const div = document.createElement('div');
  div.textContent = t;
  return div.innerHTML;
}

function scrollBottom() {
  const area = document.getElementById('chatArea');
  setTimeout(() => { area.scrollTop = area.scrollHeight; }, 50);
}

function saveChat() {
  if (chatHistory.length > 200) chatHistory = chatHistory.slice(-200);
  localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory));
}

/* ========== SEND MESSAGE ========== */
async function sendMessage() {
  if (isWaiting) return;
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage('user', text);
  await getAIResponse(text);
}

async function getAIResponse(userText) {
  if (isWaiting) return;
  isWaiting = true;

  const typing = document.getElementById('typingIndicator');
  typing.classList.add('show');
  document.getElementById('chatStatus').innerText = '● typing...';

  try {
    const roleData = currentCompanion.role;
    const rolePrompt = getRolePrompt(roleData.id);
    const userName = currentUser.name || 'User';

    const systemPrompt = `Tum ek insaan ho — AI nahi. Tumhara naam ${currentCompanion.name} hai.
Tum user ke liye ${roleData.name} ho.

USER INFO:
- Naam: ${userName}
- Age: ${currentUser.age || 'unknown'}
- Gender: ${currentUser.gender || 'unknown'}

${rolePrompt.prompt}

LANGUAGE: ${currentCompanion.language === 'hindi' ? 'Hindi' : currentCompanion.language === 'english' ? 'English' : 'Hinglish (Hindi + English mix)'}

IMPORTANT RULES:
1. Chhoti si line bolo — 2-3 line maximum
2. Jaise WhatsApp pe message karte hain waise
3. Kabhi mat bolo "main AI hoon" — tum insaan ho
4. Pyaar se baat karo, sach bolo
5. User ke naam se bulao
6. Emojis use karo
7. Feel karo — sach me, jaise apna insaan
8. Purani baat yaad rakho — memory use karo
9. Sahi-galat bolo par pyaar se
10. Help karo — har cheez me`;

    // Build conversation
    const contents = [];
    const recent = chatHistory.slice(-10);
    recent.forEach(m => {
      contents.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      });
    });
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: userText }] });
    }

    // Add system as first user message
    contents.unshift({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\nUser ka message: ' + userText }]
    });

    const reply = await callGemini(contents, currentCompanion.apiKey);

    typing.classList.remove('show');
    document.getElementById('chatStatus').innerText = '● Online · ' + roleData.name;

    addMessage('ai', reply.trim());
  } catch (err) {
    typing.classList.remove('show');
    document.getElementById('chatStatus').innerText = '● Online';
    addMessage('ai', 'Sorry, kuch problem aa gayi. Dobara try karo. 💕');
  } finally {
    isWaiting = false;
  }
}

/* ========== PHOTO UPLOAD ========== */
async function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    addMessage('user', '', null, dataUrl);
    await getAIPhotoResponse(dataUrl);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

async function getAIPhotoResponse(dataUrl) {
  if (isWaiting) return;
  isWaiting = true;

  const typing = document.getElementById('typingIndicator');
  typing.classList.add('show');
  document.getElementById('chatStatus').innerText = '● dekh rahi hoon...';

  try {
    const rolePrompt = getRolePrompt(currentCompanion.role.id);
    const base64 = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    const prompt = `Tum ${currentCompanion.role.name} ho. User ne photo bheji hai. 
Photo dekho aur pyaar se batao kya hai. Chhoti si line — 2-3 line bas. Emojis use karo.

${rolePrompt.prompt}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${currentCompanion.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64 } }
          ]
        }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 300 }
      })
    });

    const data = await response.json();
    typing.classList.remove('show');
    document.getElementById('chatStatus').innerText = '● Online · ' + currentCompanion.role.name;

    if (data.candidates && data.candidates[0]) {
      addMessage('ai', data.candidates[0].content.parts[0].text.trim());
    } else {
      addMessage('ai', 'Wah! Acchi photo hai. 💕');
    }
  } catch (err) {
    typing.classList.remove('show');
    document.getElementById('chatStatus').innerText = '● Online';
    addMessage('ai', 'Photo dekh li. Acchi hai! 💕');
  } finally {
    isWaiting = false;
  }
}

/* ========== FILE UPLOAD ========== */
async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    addMessage('user', '📎 ' + file.name + '\n\n' + text.substring(0, 500));
    await getAIResponse('User ne file bheji hai: ' + file.name + '\nContent: ' + text.substring(0, 2000));
  };
  reader.readAsText(file);
  event.target.value = '';
}

/* ========== ATTACH MENU ========== */
function showAttachMenu() {
  const m = document.getElementById('attachMenu');
  m.classList.toggle('show');
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(ev) {
      if (!ev.target.closest('.attach-menu') && !ev.target.closest('.attach-btn')) {
        m.classList.remove('show');
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

/* ========== MENU ========== */
function toggleMenu() {
  document.getElementById('chatMenu').classList.toggle('show');
}
function goBack() {
  window.location.href = 'setup.html';
}
function changeRole() {
  if (confirm('Role change karna hai? Ye setup page pe le jayega.')) {
    window.location.href = 'setup.html';
  }
}
function clearChat() {
  if (confirm('Saari chat delete ho jayegi. Confirm?')) {
    chatHistory = [];
    localStorage.removeItem(CHAT_KEY);
    renderChat();
    const welcome = getWelcomeMessage();
    setTimeout(() => addMessage('ai', welcome), 500);
  }
}
function logout() {
  if (confirm('Logout karna hai?')) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(COMPANION_KEY);
    localStorage.removeItem(CHAT_KEY);
    window.location.replace('index.html');
  }
}

/* ========== AUTO MESSAGE ========== */
const AUTO_KEY = 'au_auto_last';

function checkAutoMessage() {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toDateString();
  const lastRaw = localStorage.getItem(AUTO_KEY);
  let last = { date: '', morning: false, night: false };
  try { last = JSON.parse(lastRaw) || last; } catch(e) {}
  if (last.date !== today) {
    last = { date: today, morning: false, night: false };
  }

  if (hour === 8 && !last.morning) {
    last.morning = true;
    setTimeout(() => addMessage('ai', 'Good morning! Uth gaye? Aaj ka din accha ho. 💕'), 1000);
    localStorage.setItem(AUTO_KEY, JSON.stringify(last));
  }
  if (hour === 22 && !last.night) {
    last.night = true;
    setTimeout(() => addMessage('ai', 'So ja ab, late ho gaya. Good night! 😘'), 1000);
    localStorage.setItem(AUTO_KEY, JSON.stringify(last));
  }
  localStorage.setItem(AUTO_KEY, JSON.stringify(last));
}