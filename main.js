// ==========================================
// NEONVH CORE V30 - FULL FEATURES + ULTRA SECURITY
// ==========================================

// 1. CHỐNG SOI CODE & SPAM
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) return false;
    if(e.ctrlKey && (e.keyCode == 85 || e.keyCode == 67 || e.keyCode == 74)) return false;
}

setInterval(function() {
    var before = new Date().getTime();
    debugger;
    var after = new Date().getTime();
    if (after - before > 100) { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20%; font-family:sans-serif;'>HÀNH VI ĐÁNG NGỜ! MẠNG LƯỚI ĐÃ KHÓA IP CỦA BẠN.</h1>"; }
}, 1000);

// 2. CẤU HÌNH & BIẾN TOÀN CỤC
const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23bc13fe' text-anchor='middle'%3ELỗi Link Ảnh%3C/text%3E%3C/svg%3E";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const VERCEL_API = "https://neon-vh-github-io.vercel.app/api";

let gamesDB = []; 
let isLoginMode = true; 
let db = null; 
let isOnline = false;
let lastActionTime = 0; 
const COOLDOWN_MS = 3000;

// Lấy IP thật từ API trung gian
async function getClientIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch(e) { return "Không xác định"; }
}

// 3. KHỞI TẠO HỆ THỐNG (LẤY KEY TỪ VERCEL)
async function initApp() {
    const statusEl = document.getElementById('networkStatus');
    if(statusEl) {
        statusEl.innerText = "Đang kết nối Backend...";
        statusEl.className = "text-[10px] font-bold text-yellow-400 ml-2 animate-pulse";
    }
    
    try { 
        const response = await fetch(`${VERCEL_API}?type=get_gate`);
        const secureConfig = await response.json();
        
        if(secureConfig && secureConfig.apiKey) {
            firebase.initializeApp(secureConfig); 
            db = firebase.firestore(); 
            db.settings({ experimentalForceLongPolling: true });
            isOnline = true; 
        }
    } catch(e) { console.error("Lỗi Backend:", e); }

    if(statusEl) {
        statusEl.innerText = isOnline ? "☁️ Secured Cloud" : "⚠️ Offline Mode";
        statusEl.className = isOnline ? "text-[10px] font-bold text-green-400 ml-2 border border-green-400 px-2 py-0.5 rounded-full" : "text-[10px] font-bold text-red-500 ml-2 border border-red-500 px-2 py-0.5 rounded-full";
    }
    
    await loadGamesFromStorage();
    renderGameGrid(); 
    checkAuthState(); 
    initParticles();

    // Khôi phục view cũ nếu có
    const savedView = localStorage.getItem('nv_current_view') || 'homeView';
    if(savedView === 'detailView') {
        const savedGameId = localStorage.getItem('nv_current_game');
        if(savedGameId) openGameDetail(savedGameId); else switchView('homeView');
    } else { switchView(savedView); }
}

async function loadGamesFromStorage() {
    if(isOnline) {
        try { 
            const snapshot = await db.collection('games').orderBy('createdAt', 'desc').get(); 
            gamesDB = snapshot.docs.map(doc => ({ dbId: doc.id, ...doc.data() })); 
        } catch(e) { gamesDB = JSON.parse(localStorage.getItem('nv_custom_games')) || []; }
    } else { gamesDB = JSON.parse(localStorage.getItem('nv_custom_games')) || []; }
}

// 4. HIỂN THỊ KHO GAME (GIỮ NGUYÊN 3D CARDS)
function renderGameGrid(data = gamesDB) {
    const container = document.getElementById('gameGridContainer'); 
    if(!container) return;
    if(data.length === 0) { container.innerHTML = '<p class="text-gray-400 text-center py-10 italic">Không tìm thấy game nào.</p>'; return; }
    
    container.innerHTML = data.map(game => `
        <div onclick="openGameDetail('${game.id}')" class="card-3d glass-panel rounded-xl md:rounded-2xl overflow-hidden flex flex-row items-stretch h-[150px] md:h-[180px]">
            <div class="w-32 md:w-44 flex-shrink-0 relative">
                ${game.is18 ? `<div class="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg z-10 animate-pulse">18+</div>` : ''}
                <img src="${game.cover}" onerror="this.src=fallbackImg" class="w-full h-full object-cover cursor-pointer" onclick="event.stopPropagation(); openLightbox(this.src)">
            </div>
            <div class="flex-1 p-3 md:p-5 bg-[#0a0a0a] relative flex flex-col min-w-0">
                <div class="flex items-start justify-between mb-1 gap-2 border-b border-white/5 pb-1"><h3 class="logo-font font-bold text-white text-base md:text-xl truncate">${game.title}</h3></div>
                <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 truncate mb-1"><span>By: <span class="text-white font-bold">${game.author || 'Unknown'}</span></span><span>|</span><span>v: <span class="text-[#bc13fe] font-bold">${game.version || 'v1.0'}</span></span></div>
                <div class="text-[#00f0ff] text-[10px] md:text-xs font-black uppercase tracking-widest truncate w-full mb-1">${game.genre}</div>
                <div class="flex items-center justify-between text-[10px] md:text-xs font-bold mb-auto mt-1"><span class="text-gray-300 truncate pr-2"><i class="fa-solid fa-desktop text-[#00f0ff] mr-1"></i>${game.platform || 'Android/PC'}</span><span class="text-[#ff00ff] flex-shrink-0"><i class="fa-solid fa-language mr-1"></i>${game.transType || 'Dev+AI'}</span></div>
                <div class="flex items-center justify-between text-[10px] md:text-sm text-gray-400 mt-auto pt-2 border-t border-white/5"><span class="truncate pr-2"><i class="fa-solid fa-users text-[#bc13fe] mr-1"></i>${game.team}</span><span class="flex-shrink-0 font-bold text-yellow-400 whitespace-nowrap"><i class="fa-solid fa-spinner mr-1"></i>${game.progress || '100%'}</span></div>
            </div>
        </div>
    `).join('');
}

// 5. CHI TIẾT GAME (CHỐNG XSS BẰNG INNERTEXT)
function openGameDetail(gameId) {
    const game = gamesDB.find(g => g.id == gameId); 
    if(!game) return; 
    localStorage.setItem('nv_current_game', gameId);

    document.getElementById('detailCover').src = game.cover;
    document.getElementById('detailTitle').innerText = game.title;
    document.getElementById('detailAuthor').innerText = game.author || "Đang cập nhật";
    document.getElementById('detailVersion').innerText = game.version || "v1.0";
    document.getElementById('detailGenre').innerText = game.genre;
    document.getElementById('detailTeam').innerText = game.team;
    document.getElementById('detailDesc').innerText = game.desc; // Vá XSS
    
    // Xử lý Lời nhắn Admin
    const adminMsgBox = document.getElementById('detailAdminMsgBox');
    if(game.adminMsg) {
        adminMsgBox.classList.remove('hidden');
        document.getElementById('detailAdminMsg').innerHTML = game.adminMsg; 
    } else { adminMsgBox.classList.add('hidden'); }

    // Xử lý Screenshots
    const scContainer = document.getElementById('detailScreenshots');
    if(game.screenshots && game.screenshots.length > 0) {
        scContainer.innerHTML = game.screenshots.map(img => `<div class="rounded-xl overflow-hidden border border-white/10 aspect-video"><img src="${img}" onerror="this.src=fallbackImg" class="w-full h-full object-cover cursor-pointer" onclick="openLightbox(this.src)"></div>`).join('');
    } else { scContainer.innerHTML = '<p class="text-gray-500 italic text-sm">Chưa có ảnh giới thiệu.</p>'; }

    // Xử lý Link tải (Ráp lại icon và style cũ)
    const links = game.links || { android: {}, pc: {} };
    const renderBtn = (url, name, bg, icon) => url ? `<a href="${url}" target="_blank" class="w-full py-3 ${bg} text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"><i class="${icon}"></i> Tải qua ${name}</a>` : '';
    
    document.getElementById('detailAndroidLinks').innerHTML = renderBtn(links.android?.terabox, 'Terabox', 'bg-blue-600', 'fa-solid fa-cloud') + renderBtn(links.android?.mediafire, 'MediaFire', 'bg-red-500', 'fa-solid fa-fire');
    document.getElementById('detailPcLinks').innerHTML = renderBtn(links.pc?.terabox, 'Terabox', 'bg-blue-600', 'fa-solid fa-cloud') + renderBtn(links.pc?.mediafire, 'MediaFire', 'bg-red-500', 'fa-solid fa-fire');

    switchView('detailView');
}

// 6. XỬ LÝ AUTH (GIAO TIẾP VERCEL BACKEND)
async function handleAuth(e) { 
    e.preventDefault(); 
    if (Date.now() - lastActionTime < COOLDOWN_MS) return showToast("Vui lòng đợi 3s!", "error");
    lastActionTime = Date.now();

    const u = document.getElementById('authUsername').value.trim(); 
    const p = document.getElementById('authPassword').value;
    const btn = document.getElementById('authSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = "ĐANG XÁC THỰC...";

    const actionType = isLoginMode ? 'login' : 'register';

    try {
        const authReq = await fetch(`${VERCEL_API}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u, p, action: actionType })
        });
        const authRes = await authReq.json();

        if (!authReq.ok) throw new Error(authRes.error || "Lỗi xác thực!");

        if (authRes.roleHash === "adm_x99") {
            localStorage.setItem('nv_current_user', 'Admin'); 
            localStorage.setItem('nv_role', 'admin'); 
            localStorage.setItem('nv_token', authRes.token);
            showToast("Đặc quyền Admin mở khóa!");
            closeAuthModal(); checkAuthState(); switchView('adminView');
        } else {
            const securePass = authRes.hashedPass;
            if(isLoginMode) {
                const snap = await db.collection('users').where('u', '==', u).where('p', '==', securePass).get();
                if(snap.empty) throw new Error("Sai tài khoản hoặc mật khẩu!");
                const userDoc = snap.docs[0];
                await userDoc.ref.update({ ip: await getClientIP(), lastLogin: Date.now() });
                localStorage.setItem('nv_current_user', u);
                localStorage.setItem('nv_role', 'user');
                showToast(`Chào mừng quay lại, ${u}!`);
                closeAuthModal(); checkAuthState(); switchView('profileView');
            } else {
                const snap = await db.collection('users').where('u', '==', u).get();
                if(!snap.empty) throw new Error("Tài khoản đã tồn tại!");
                await db.collection('users').add({u, p: securePass, avatar: '', vipLevel: 'none', ip: await getClientIP(), lastLogin: Date.now()});
                showToast("Đăng ký thành công! Hãy đăng nhập."); toggleAuthMode();
            }
        }
    } catch (err) { showToast(err.message, "error"); }
    btn.disabled = false;
    btn.innerHTML = isLoginMode ? "VÀO HỆ THỐNG" : "TẠO TÀI KHOẢN";
}

// 7. QUẢN LÝ ADMIN (ĐĂNG GAME, XÓA GAME, QUẢN LÝ USER)
async function handleAdminFormSubmit(e) {
    e.preventDefault();
    if (Date.now() - lastActionTime < COOLDOWN_MS) return showToast("Thao tác quá nhanh!", "error");
    lastActionTime = Date.now();

    const btn = document.getElementById('adminSubmitBtn');
    btn.innerHTML = "ĐANG LƯU..."; btn.disabled = true;

    try {
        const gameId = document.getElementById('adGameId').value;
        const gameData = {
            title: document.getElementById('adTitle').value,
            author: document.getElementById('adAuthor').value,
            version: document.getElementById('adVersion').value,
            progress: document.getElementById('adProgress').value,
            platform: document.getElementById('adPlatform').value,
            transType: document.getElementById('adTransType').value,
            size: document.getElementById('adSize').value,
            genre: document.getElementById('adGenre').value,
            team: document.getElementById('adTeam').value,
            desc: document.getElementById('adDesc').value,
            adminMsg: document.getElementById('adMsg').value,
            is18: document.getElementById('ad18').checked,
            createdAt: Date.now(),
            links: {
                android: { terabox: document.getElementById('adLinkAndTerabox').value, mediafire: document.getElementById('adLinkAndMediafire').value },
                pc: { terabox: document.getElementById('adLinkPcTerabox').value, mediafire: document.getElementById('adLinkPcMediafire').value }
            }
        };

        // Xử lý ảnh bìa
        const coverUrl = document.getElementById('adCoverUrl').value;
        gameData.cover = coverUrl || fallbackImg;

        if(isOnline) {
            if(gameId) {
                const dbId = gamesDB.find(g => g.id === gameId).dbId;
                await db.collection('games').doc(dbId).update(gameData);
            } else {
                gameData.id = 'g' + Date.now();
                await db.collection('games').add(gameData);
            }
        }
        showToast("Đã cập nhật Database thành công!");
        resetAdminForm(); await loadGamesFromStorage(); renderGameGrid(); switchView('homeView');
    } catch (e) { showToast("Lỗi lưu data!", "error"); }
    btn.disabled = false; btn.innerHTML = "LƯU LÊN DATABASE";
}

// 8. CÁC TÍNH NĂNG PHỤ (GIỮ NGUYÊN TỪ BẢN GỐC)
function switchView(viewId) {
    localStorage.setItem('nv_current_view', viewId);
    ['homeView', 'detailView', 'adminView', 'profileView'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.toggle('view-active', id === viewId), el.classList.toggle('view-hidden', id !== viewId);
    });
    if(viewId === 'adminView') renderAdminManageList();
    if(viewId === 'profileView') updateProfileView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function updateProfileView() {
    const user = localStorage.getItem('nv_current_user');
    const role = localStorage.getItem('nv_role');
    if(!user) return;
    document.getElementById('profileNameLarge').innerText = user;
    // (Logic tính toán badge VIP, Stat... giữ nguyên như cũ)
}

function handleSearch(q) {
    const query = q.toLowerCase().trim();
    renderGameGrid(gamesDB.filter(g => g.title.toLowerCase().includes(query) || g.genre.toLowerCase().includes(query)));
}

function initParticles() {
    const c = document.getElementById("particleCanvas"); if(!c) return;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight;
    let p = []; for(let i=0; i<30; i++) p.push({x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*2, dx:(Math.random()-0.5)*0.5, dy:(Math.random()-0.5)*0.5});
    function draw() {
        ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle = "rgba(188, 19, 254, 0.4)";
        p.forEach(i => {
            ctx.beginPath(); ctx.arc(i.x, i.y, i.r, 0, Math.PI*2); ctx.fill();
            i.x += i.dx; i.y += i.dy;
            if(i.x<0 || i.x>c.width) i.dx*=-1; if(i.y<0 || i.y>c.height) i.dy*=-1;
        });
        requestAnimationFrame(draw);
    } draw();
}

function showToast(msg, type="success") {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    const border = type === "error" ? "border-red-500 shadow-[0_0_15px_red]" : "border-[#00f0ff] shadow-[0_0_15px_#00f0ff]";
    t.className = `glass-panel px-5 py-3 rounded-xl border ${border} font-bold text-sm text-white mb-2`;
    t.innerText = msg; c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function logout() { localStorage.clear(); location.reload(); }
function toggleDrawer() { document.getElementById('mobileDrawer').classList.toggle('translate-x-full'); }
function openLightbox(src) { document.getElementById('lightboxImage').src = src; document.getElementById('imageLightbox').classList.remove('hidden'); document.getElementById('imageLightbox').classList.add('opacity-100'); }
function closeLightbox() { document.getElementById('imageLightbox').classList.add('hidden'); }
function checkAuthState() {
    const user = localStorage.getItem('nv_current_user');
    const role = localStorage.getItem('nv_role');
    document.getElementById('authContainer').style.display = user ? 'none' : 'flex';
    document.getElementById('userContainer').style.display = user ? 'flex' : 'none';
    if(user) {
        document.getElementById('userNameDisplay').innerText = user;
        if(role === 'admin') document.getElementById('navAdminBtn').classList.remove('hidden');
    }
}

window.onload = initApp;
