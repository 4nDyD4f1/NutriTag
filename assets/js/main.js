/* =============================================
   NutriTag v2.0 — Main Application Logic
   ============================================= */

// ==========================================
// DATA LAYER & CONSTANTS
// ==========================================

const STORAGE_KEYS = {
  victims: 'nutritag_v2_victims',
  mealLogs: 'nutritag_v2_meals',
  shelter: 'nutritag_v2_shelter'
};

const SHELTERS = [
  { id: 'S01', name: 'Posko Utama Balai Kota', unit: 'BPBD Pusat', lat: -6.200000, lng: 106.816666, count: 145 },
  { id: 'S02', name: 'Shelter Alpha-1', unit: 'Disaster Relief Unit', lat: -6.215000, lng: 106.845000, count: 82 },
  { id: 'S03', name: 'Posko Darurat GOR', unit: 'PMI Cabang', lat: -6.185000, lng: 106.825000, count: 210 },
  { id: 'S04', name: 'Tenda Pengungsian SD 04', unit: 'Relawan Mandiri', lat: -6.225000, lng: 106.805000, count: 45 }
];

const QUICK_MEALS = [
  { name: 'Rice + Chicken', icon: '🍗', cal: 450, prot: 30, carb: 55, fat: 12, calcium: 40 },
  { name: 'Rice + Egg + Veggies', icon: '🥚', cal: 380, prot: 18, carb: 50, fat: 14, calcium: 60 },
  { name: 'Porridge (Child)', icon: '🥣', cal: 250, prot: 10, carb: 40, fat: 6, calcium: 120 },
  { name: 'Rice + Tempeh + Tofu', icon: '🫘', cal: 420, prot: 22, carb: 58, fat: 10, calcium: 150 },
  { name: 'Bread + Milk', icon: '🥛', cal: 320, prot: 12, carb: 45, fat: 10, calcium: 200 }
];

const MOTIVATION_MESSAGES = {
  wilting: ["Don't worry, every little bite helps your tree grow! 🌱", "Your tree is waiting for you — finish your meal today! 💪"],
  growing: ["Great start! Your tree is growing. Keep eating well! 🌿", "You're doing amazing! A few more meals and your tree will bloom! 🎉"],
  blooming: ["Beautiful! Your tree is blooming! You're almost there! 🌸", "Wonderful progress! Your nutrition is on track today! ✨"],
  fruiting: ["AMAZING! Your tree is full of fruit! 100% nutrition achieved! 🍎🎉", "You're a nutrition champion! Your tree is thriving! 🏆🌳"]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let state = {
  victims: [],
  mealLogs: [],
  currentShelter: null,
  currentUserRole: null, // 'panitia' | 'pengguna'
  pohonUser: null, // Logged in user for Pohon
  scanTarget: null,
  lastRegistered: null,
  scannerInstance: null,
  scannerActive: false,
  loginScannerInstance: null,
  loginScannerActive: false,
  map: null
};

function loadState() {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.victims);
    const m = localStorage.getItem(STORAGE_KEYS.mealLogs);
    if (v) state.victims = JSON.parse(v);
    if (m) state.mealLogs = JSON.parse(m);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.victims, JSON.stringify(state.victims));
    localStorage.setItem(STORAGE_KEYS.mealLogs, JSON.stringify(state.mealLogs));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// ==========================================
// UTILITIES
// ==========================================

function generateId() {
  return 'NT' + Date.now().toString(36).toUpperCase().substring(0, 4) + Math.random().toString(36).substring(2, 4).toUpperCase();
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast-notification');
  toast.textContent = message;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ==========================================
// APP INITIALIZATION & LANDING PAGE
// ==========================================

function initApp() {
  loadState();
  seedDemoData();
  
  // Render Map
  initMap();
  renderShelterList();
  
  // Hide Loading Screen
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.style.display = 'none', 500); // Wait for transition
    }
  }, 1500); // 1.5s artificial delay for effect
}

function initMap() {
  if (state.map) return;
  state.map = L.map('leaflet-map').setView([-6.200000, 106.816666], 12);
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);

  SHELTERS.forEach(s => {
    const marker = L.marker([s.lat, s.lng]).addTo(state.map);
    
    // Popup
    const popupContent = `
      <div class="shelter-popup">
        <h4>${s.name}</h4>
        <p>${s.unit} • ${s.count} Pengungsi</p>
        <button onclick="selectShelter('${s.id}')">Pilih Posko Ini</button>
      </div>
    `;
    marker.bindPopup(popupContent);
  });
}

function renderShelterList() {
  const container = document.getElementById('shelter-list');
  container.innerHTML = SHELTERS.map(s => `
    <div class="shelter-card" onclick="selectShelter('${s.id}')">
      <div class="shelter-card-icon">📍</div>
      <div class="shelter-card-info">
        <h3>${s.name}</h3>
        <p>${s.unit}</p>
        <div class="shelter-count">${s.count} Pengungsi Terdaftar</div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// NAVIGATION & AUTH
// ==========================================

function selectShelter(id) {
  const shelter = SHELTERS.find(s => s.id === id);
  if (!shelter) return;
  
  state.currentShelter = shelter;
  
  // Update Role Page
  document.getElementById('role-shelter-name').textContent = shelter.name;
  
  // Update Sidebar
  document.getElementById('sidebar-shelter-name').textContent = shelter.name;
  document.getElementById('sidebar-shelter-unit').textContent = shelter.unit;
  document.getElementById('sidebar-avatar').textContent = shelter.name.substring(0, 2).toUpperCase();
  
  // Transition to Role Page
  document.getElementById('landing-page').classList.add('hidden');
  document.getElementById('role-page').classList.remove('hidden');
}

function backToLanding() {
  document.getElementById('role-page').classList.add('hidden');
  document.getElementById('landing-page').classList.remove('hidden');
}

function showLogin(role) {
  document.getElementById('role-page').classList.add('hidden');
  if (role === 'panitia') {
    document.getElementById('login-panitia-page').classList.remove('hidden');
  } else {
    document.getElementById('login-pengguna-page').classList.remove('hidden');
  }
}

function backToRole() {
  document.getElementById('login-panitia-page').classList.add('hidden');
  document.getElementById('login-pengguna-page').classList.add('hidden');
  document.getElementById('role-page').classList.remove('hidden');
  
  // Clear inputs
  document.getElementById('login-panitia-pass').value = '';
  document.getElementById('login-user-id').value = '';
  document.getElementById('login-user-pin').value = '';

  if (state.loginScannerActive) stopLoginScanner();
}

function loginPanitia() {
  const pass = document.getElementById('login-panitia-pass').value;
  if (pass !== 'admin123') {
    showToast('Password salah. Gunakan: admin123', 'error');
    return;
  }
  
  state.currentUserRole = 'panitia';
  enterApp();
}

function loginPengguna() {
  const id = document.getElementById('login-user-id').value.trim().toUpperCase();
  const pin = document.getElementById('login-user-pin').value.trim();
  
  if (!id || !pin) { showToast('Masukkan ID dan PIN.', 'error'); return; }
  
  const victim = state.victims.find(v => v.id.toUpperCase() === id && v.pin === pin);
  if (!victim) {
    showToast('ID atau PIN tidak ditemukan.', 'error');
    return;
  }
  
  state.pohonUser = victim;
  state.currentUserRole = 'pengguna';
  if (state.loginScannerActive) stopLoginScanner();
  enterApp();
}

function toggleLoginMethod(method) {
  const manualBtn = document.getElementById('tab-login-manual');
  const qrBtn = document.getElementById('tab-login-qr');
  const manualSec = document.getElementById('login-manual-section');
  const qrSec = document.getElementById('login-qr-section');

  if (method === 'manual') {
    manualBtn.style.background = 'var(--card)';
    manualBtn.style.color = 'var(--text)';
    manualBtn.style.boxShadow = 'var(--shadow-sm)';
    qrBtn.style.background = 'transparent';
    qrBtn.style.color = 'var(--text-muted)';
    qrBtn.style.boxShadow = 'none';
    
    manualSec.classList.remove('hidden');
    qrSec.classList.add('hidden');
    if (state.loginScannerActive) stopLoginScanner();
  } else {
    qrBtn.style.background = 'var(--card)';
    qrBtn.style.color = 'var(--text)';
    qrBtn.style.boxShadow = 'var(--shadow-sm)';
    manualBtn.style.background = 'transparent';
    manualBtn.style.color = 'var(--text-muted)';
    manualBtn.style.boxShadow = 'none';
    
    qrSec.classList.remove('hidden');
    manualSec.classList.add('hidden');
  }
}

function toggleLoginScanner() {
  state.loginScannerActive ? stopLoginScanner() : startLoginScanner();
}

function startLoginScanner() {
  const el = document.getElementById('login-qr-reader');
  document.getElementById('login-qr-placeholder').style.display = 'none';
  el.style.display = 'block';
  
  state.loginScannerInstance = new Html5Qrcode('login-qr-reader');
  state.loginScannerInstance.start({facingMode:'environment'}, {fps:10, qrbox:200}, (txt) => {
    onLoginQRScanned(txt); 
    stopLoginScanner();
  }, () => {}).then(() => {
    state.loginScannerActive = true;
    document.getElementById('btn-login-scan').innerHTML = '⏹️ Stop Scan';
    document.getElementById('btn-login-scan').classList.replace('btn-success', 'btn-danger');
  });
}

function stopLoginScanner() {
  if (state.loginScannerInstance && state.loginScannerActive) {
    state.loginScannerInstance.stop().then(() => {
      state.loginScannerActive = false; 
      state.loginScannerInstance = null;
      document.getElementById('login-qr-reader').style.display = 'none';
      document.getElementById('login-qr-placeholder').style.display = '';
      const btn = document.getElementById('btn-login-scan');
      btn.innerHTML = '📷 Mulai Scan';
      btn.classList.replace('btn-danger', 'btn-success');
    });
  }
}

function onLoginQRScanned(text) {
  const match = text.match(/^NUTRITAG:(.+)$/);
  if (match) {
    const id = match[1];
    const victim = state.victims.find(x => x.id === id);
    if (victim) { 
      showToast(`Login berhasil sebagai ${victim.name}!`, 'success');
      state.pohonUser = victim;
      state.currentUserRole = 'pengguna';
      enterApp();
    } else {
      showToast('QR tidak terdaftar.', 'error');
    }
  } else {
    showToast('Format QR tidak valid.', 'error');
  }
}

function enterApp() {
  // Hide fullscreen pages
  document.querySelectorAll('.fullscreen-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('app-container').classList.remove('hidden');
  
  renderSidebarNav();
  
  if (state.currentUserRole === 'panitia') {
    navigateTo('registration');
  } else {
    navigateTo('pohon');
  }
}

function logoutApp() {
  state.currentUserRole = null;
  state.pohonUser = null;
  
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('landing-page').classList.remove('hidden');
  
  // Clear inputs
  document.getElementById('login-panitia-pass').value = '';
  document.getElementById('login-user-id').value = '';
  document.getElementById('login-user-pin').value = '';
  
  if(state.scannerActive) stopScanner();
}

function renderSidebarNav() {
  const container = document.getElementById('sidebar-nav-container');
  let navHtml = '';
  
  if (state.currentUserRole === 'panitia') {
    navHtml = `
      <button class="nav-item" id="nav-registration" onclick="navigateTo('registration')">
        <span class="nav-icon">👥</span><span>Registration</span>
      </button>
      <button class="nav-item" id="nav-kitchen" onclick="navigateTo('kitchen')">
        <span class="nav-icon">📷</span><span>Kitchen Scan</span>
      </button>
      <button class="nav-item" id="nav-monitoring" onclick="navigateTo('monitoring')">
        <span class="nav-icon">📊</span><span>Monitoring Dashboard</span>
      </button>
    `;
  } else {
    navHtml = `
      <button class="nav-item active" id="nav-pohon" onclick="navigateTo('pohon')">
        <span class="nav-icon">🌳</span><span>Kebun Virtual</span>
      </button>
    `;
  }
  container.innerHTML = navHtml;
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById('page-' + page);
  if (targetPage) targetPage.classList.add('active');

  const navItem = document.getElementById('nav-' + page);
  if (navItem) navItem.classList.add('active');

  if (page === 'kitchen') renderKitchenPage();
  if (page === 'pohon') renderPohonPage();
  if (page === 'monitoring') renderMonitoringPage();
  if (page === 'registration') renderRegistrationTable();

  if (page !== 'kitchen' && state.scannerActive) stopScanner();
}


// ==========================================
// CORE NUTRITION LOGIC
// ==========================================

function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

function getBMICategory(bmi, age) {
  if (age < 5) return bmi < 14 ? 'underweight' : (bmi > 18 ? 'overweight' : 'normal');
  if (age <= 12) return bmi < 14.5 ? 'underweight' : (bmi > 21 ? 'overweight' : 'normal');
  return bmi < 18.5 ? 'underweight' : (bmi >= 25 ? 'overweight' : 'normal');
}

function calculateDailyTargets(weight, heightCm, age, gender) {
  let bmr;
  if (age < 1) bmr = weight * 95;
  else if (age < 3) bmr = weight * 85;
  else if (age < 5) bmr = weight * 80;
  else if (age <= 10) bmr = ((gender === 'male' ? 19.59 : 16.97) * weight) + ((gender === 'male' ? 130.3 : 161.8) * (heightCm / 100)) + (gender === 'male' ? 414.9 : 371.2) * 1.3;
  else if (age <= 12) bmr = ((gender === 'male' ? 16.25 : 8.365) * weight) + ((gender === 'male' ? 137.2 : 465) * (heightCm / 100)) + (gender === 'male' ? 515.5 : 200) * 1.3;
  else bmr = ((10 * weight) + (6.25 * heightCm) - (5 * age) + (gender === 'male' ? 5 : -161)) * 1.3;

  const calories = Math.round(bmr);
  return {
    calories,
    protein: Math.round((calories * 0.20) / 4),
    carbs: Math.round((calories * 0.55) / 4),
    fat: Math.round((calories * 0.25) / 9),
    calcium: age < 1 ? 260 : (age <= 3 ? 700 : (age <= 18 ? 1300 : 1000))
  };
}

// ==========================================
// INTAKE & TREE STATE LOGIC
// ==========================================

function getTodayIntake(victimId) {
  const today = getToday();
  const logs = state.mealLogs.filter(l => l.victimId === victimId && l.date === today);
  return logs.reduce((sum, l) => ({
    calories: sum.calories + (l.nutrition.calories || 0),
    protein: sum.protein + (l.nutrition.protein || 0),
    carbs: sum.carbs + (l.nutrition.carbs || 0),
    fat: sum.fat + (l.nutrition.fat || 0),
    calcium: sum.calcium + (l.nutrition.calcium || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, calcium: 0 });
}

function getNutritionPercentage(victimId) {
  const victim = state.victims.find(v => v.id === victimId);
  if (!victim) return 0;
  const intake = getTodayIntake(victimId);
  const t = victim.dailyTargets;
  const pcts = [
    Math.min(100, (intake.calories / t.calories) * 100),
    Math.min(100, (intake.protein / t.protein) * 100),
    Math.min(100, (intake.carbs / t.carbs) * 100),
    Math.min(100, (intake.fat / t.fat) * 100),
    Math.min(100, (intake.calcium / t.calcium) * 100)
  ];
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

function getTreeState(percentage) {
  if (percentage < 25) return 'wilting';
  if (percentage < 50) return 'growing';
  if (percentage < 75) return 'blooming';
  return 'fruiting';
}

function getNextStageInfo(percentage) {
  if (percentage < 25) return { stage: 'Growing', nextThreshold: 25 };
  if (percentage < 50) return { stage: 'Blooming', nextThreshold: 50 };
  if (percentage < 75) return { stage: 'Bearing Fruit', nextThreshold: 75 };
  return { stage: 'Fully Matured!', nextThreshold: 100 };
}


// ==========================================
// PAGE: REGISTRATION (PANITIA)
// ==========================================

function calculateAndRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const age = parseInt(document.getElementById('reg-age').value);
  const gender = document.getElementById('reg-gender').value;
  const weight = parseFloat(document.getElementById('reg-weight').value);
  const height = parseFloat(document.getElementById('reg-height').value);

  if (!name || !gender || !weight || !height || isNaN(age)) {
    showToast('Harap lengkapi semua field.', 'error'); return;
  }

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi, age);
  const targets = calculateDailyTargets(weight, height, age, gender);
  
  const victim = {
    id: generateId(),
    pin: generatePin(),
    name, age, gender, weight, height, bmi, bmiCategory,
    isChild: age <= 12, isToddler: age < 5,
    dailyTargets: targets,
    package: bmiCategory === 'overweight' ? 'A' : (bmiCategory === 'normal' ? 'B' : 'C'),
    registeredAt: new Date().toISOString(),
    leafCount: 0
  };

  state.victims.push(victim);
  state.lastRegistered = victim;
  saveState();

  updateProfilePanel(victim);
  showRegistrationResult(victim);
  renderRegistrationTable();

  ['reg-name', 'reg-age', 'reg-gender', 'reg-weight', 'reg-height'].forEach(id => document.getElementById(id).value = '');
  showToast(`${name} registered successfully!`, 'success');
}

function updateProfilePanel(victim) {
  document.getElementById('profile-bmi').textContent = victim.bmi;
  document.getElementById('profile-bmi').classList.remove('pending');
  document.getElementById('profile-bmi-status').textContent = victim.bmiCategory.toUpperCase();
  document.getElementById('profile-bmi-status').style.color = victim.bmiCategory === 'underweight' ? 'var(--danger)' : (victim.bmiCategory === 'overweight' ? 'var(--warning-dark)' : 'var(--success)');
  document.getElementById('profile-calories').textContent = victim.dailyTargets.calories;
  document.getElementById('profile-calories').classList.remove('pending');
  document.getElementById('btn-generate-qr').disabled = false;
}

function showRegistrationResult(victim) {
  const div = document.getElementById('registration-result');
  div.classList.remove('hidden');
  document.getElementById('result-name-display').textContent = victim.name;
  document.getElementById('result-id').textContent = victim.id;
  document.getElementById('result-pin').textContent = victim.pin;
  
  document.getElementById('result-macros').innerHTML = `
    <div class="card-stat blue animate-in"><div class="stat-label">BMI</div><div class="stat-value blue">${victim.bmi}</div></div>
    <div class="card-stat green animate-in"><div class="stat-label">Calories</div><div class="stat-value green">${victim.dailyTargets.calories}</div></div>
    <div class="card-stat amber animate-in"><div class="stat-label">Protein</div><div class="stat-value amber">${victim.dailyTargets.protein}</div></div>
  `;
}

function renderRegistrationTable() {
  document.getElementById('victim-count-display').textContent = `${state.victims.length} residents`;
  document.getElementById('victim-table-body').innerHTML = state.victims.map(v => `
    <tr>
      <td><b>${v.name}</b> ${v.isChild ? '<span class="badge badge-child">Child</span>' : ''}<br><small style="color:var(--text-muted)">${v.id}</small></td>
      <td><span class="badge ${v.bmiCategory==='normal'?'badge-success':'badge-danger'}">${v.bmi}</span></td>
      <td>${v.dailyTargets.calories} kcal</td>
      <td>Pkg ${v.package}</td>
      <td><button class="btn btn-outline btn-sm" onclick="printQRFor('${v.id}')">🖨️ Print</button></td>
    </tr>
  `).join('');
}


// ==========================================
// PAGE: POHON VIRTUAL (PENGGUNA)
// ==========================================

function renderPohonPage() {
  if (!state.pohonUser) return;
  const victim = state.victims.find(v => v.id === state.pohonUser.id);
  if (!victim) return;

  const pct = getNutritionPercentage(victim.id);
  const treeState = getTreeState(pct);
  const intake = getTodayIntake(victim.id);
  const info = getNextStageInfo(pct);

  // Tree Visual Updates
  document.getElementById('kebun-leaf-count').textContent = victim.leafCount || 0;
  
  const badge = document.getElementById('pohon-stage-badge');
  badge.className = `pohon-stage-badge ${treeState}`;
  document.getElementById('pohon-stage-text').textContent = treeState.charAt(0).toUpperCase() + treeState.slice(1) + ' Stage';
  
  const img = document.getElementById('pohon-tree-img');
  img.src = `assets/images/tree_${treeState}.png`;
  img.className = `pohon-tree-img ${treeState}`;

  document.getElementById('pohon-next-stage').textContent = info.stage;
  document.getElementById('pohon-progress-text').textContent = `${pct}%`;
  document.getElementById('pohon-progress-fill').style.width = `${pct}%`;

  const msgs = MOTIVATION_MESSAGES[treeState];
  document.getElementById('pohon-motivation').textContent = msgs[Math.floor(Math.random() * msgs.length)];

  // Daily Nutrition Side Panel
  const t = victim.dailyTargets;
  const nutrients = [
    { name: 'Calories', current: intake.calories, target: t.calories, unit: 'kcal', icon: '🔥' },
    { name: 'Protein', current: intake.protein, target: t.protein, unit: 'g', icon: '🥩' },
    { name: 'Veggies (Carbs)', current: intake.carbs, target: t.carbs, unit: 'g', icon: '🥦' },
    { name: 'Fat', current: intake.fat, target: t.fat, unit: 'g', icon: '🥑' }
  ];

  document.getElementById('daily-nutrition-list').innerHTML = nutrients.map(n => {
    const p = Math.min(100, Math.round((n.current / n.target) * 100));
    let statusClass = 'low'; let statusText = 'Needs More';
    if (p >= 100) { statusClass = 'excellent'; statusText = 'Excellent!'; }
    else if (p >= 60) { statusClass = 'good'; statusText = `Good (${n.current}${n.unit})`; }
    else { statusText = `Needs More (${n.current}${n.unit})`; }

    return `
      <div class="nutrition-status-item ${statusClass === 'excellent' ? 'excellent' : ''}">
        <div class="nsi-left">
          <div class="nsi-icon">${n.icon}</div>
          <div class="nsi-name">${n.name}</div>
        </div>
        <div class="nsi-status ${statusClass}">${statusText}</div>
      </div>
    `;
  }).join('');

  // Community Forest Side Panel
  const container = document.getElementById('community-forest-grid');
  if (state.victims.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);grid-column:1/-1;text-align:center;">Belum ada penghuni lain.</p>';
  } else {
    // Show top 6 others + self
    let others = state.victims.filter(v => v.id !== victim.id).slice(0, 5);
    let displayList = [victim, ...others];
    
    container.innerHTML = displayList.map(v => {
      const vPct = getNutritionPercentage(v.id);
      const ts = getTreeState(vPct);
      const isMe = v.id === victim.id;
      return `
        <div class="forest-item ${v.isChild ? 'is-child' : ''} ${isMe ? 'is-me' : ''}">
          <img src="assets/images/tree_${ts}.png" alt="Tree">
          <div class="forest-name">${isMe ? 'My Tree' : v.name}</div>
        </div>
      `;
    }).join('');
  }
}


// ==========================================
// QR GENERATION
// ==========================================

function generateAndPrintQR() {
  if (!state.lastRegistered) return;
  printQRFor(state.lastRegistered.id);
}

function printQRFor(id) {
  const v = state.victims.find(x => x.id === id);
  if(!v) return;
  
  const preview = document.getElementById('qr-preview');
  preview.innerHTML = ''; preview.classList.add('has-qr');
  new QRCode(preview, { text: `NUTRITAG:${v.id}`, width: 140, height: 140 });

  const printQr = document.getElementById('print-qr');
  printQr.innerHTML = '';
  new QRCode(printQr, { text: `NUTRITAG:${v.id}`, width: 120, height: 120 });
  
  document.getElementById('print-name').textContent = v.name;
  document.getElementById('print-meta').textContent = `${v.bmiCategory.toUpperCase()} | Pkg ${v.package} | ${v.dailyTargets.calories} kcal`;
  document.getElementById('print-id').textContent = v.id;
  document.getElementById('print-pin').textContent = v.pin;
  
  setTimeout(() => window.print(), 300);
}


// ==========================================
// KITCHEN SCAN (PANITIA)
// ==========================================

function renderKitchenPage() {
  document.getElementById('quick-meals-list').innerHTML = QUICK_MEALS.map(m => `
    <div class="meal-log-item" style="cursor:pointer;" onclick="fillQuickMeal(${m.cal},${m.prot},${m.carb},${m.fat},${m.calcium},'${m.name}')">
      <div class="meal-log-icon">${m.icon}</div>
      <div class="meal-log-info"><div class="meal-log-name">${m.name}</div><div class="meal-log-detail">P:${m.prot}g C:${m.carb}g</div></div>
      <div class="meal-log-kcal">${m.cal} kcal</div>
    </div>
  `).join('');
  if (state.scanTarget) showScannedProfile(state.scanTarget);
}

function toggleScanner() { state.scannerActive ? stopScanner() : startScanner(); }

function startScanner() {
  const el = document.getElementById('qr-reader');
  el.style.display = 'block';
  state.scannerInstance = new Html5Qrcode('qr-reader');
  state.scannerInstance.start({facingMode:'environment'}, {fps:10, qrbox:200}, (txt) => {
    onQRScanned(txt); stopScanner();
  }, () => {}).then(() => {
    state.scannerActive = true;
    document.getElementById('btn-start-scan').textContent = '⏹️ Stop Scanner';
  });
}

function stopScanner() {
  if (state.scannerInstance && state.scannerActive) {
    state.scannerInstance.stop().then(() => {
      state.scannerActive = false; state.scannerInstance = null;
      document.getElementById('qr-reader').style.display = 'none';
      document.getElementById('btn-start-scan').textContent = '📷 Start Scanner';
    });
  }
}

function onQRScanned(text) {
  const match = text.match(/^NUTRITAG:(.+)$/);
  if (match) {
    const v = state.victims.find(x => x.id === match[1]);
    if (v) { state.scanTarget = v; showScannedProfile(v); showToast(`Scanned: ${v.name}`, 'success'); }
  }
}

function manualScanLookup() {
  const id = document.getElementById('manual-scan-input').value.trim().toUpperCase();
  const v = state.victims.find(x => x.id === id);
  if(v) { state.scanTarget = v; showScannedProfile(v); }
}

function fillQuickMeal(cal, prot, carb, fat, calc, name) {
  document.getElementById('meal-cal').value=cal; document.getElementById('meal-prot').value=prot;
  document.getElementById('meal-carb').value=carb; document.getElementById('meal-fat').value=fat;
  document.getElementById('meal-calcium').value=calc; document.getElementById('meal-items').value=name;
}

function showScannedProfile(v) {
  document.getElementById('scanned-profile-section').classList.remove('hidden');
  document.getElementById('scan-avatar').textContent = v.name[0];
  document.getElementById('scan-name').textContent = v.name;
  document.getElementById('scan-meta').textContent = `${v.age}y • ${v.weight}kg • ID: ${v.id}`;
  
  const t = v.dailyTargets;
  document.getElementById('scan-targets').innerHTML = `
    <div class="macro-item"><div class="macro-item-value">${t.calories}</div><div class="macro-item-label">kcal</div></div>
    <div class="macro-item"><div class="macro-item-value">${t.protein}</div><div class="macro-item-label">Prot</div></div>
    <div class="macro-item"><div class="macro-item-value">${t.carbs}</div><div class="macro-item-label">Carb</div></div>
    <div class="macro-item"><div class="macro-item-value">${t.fat}</div><div class="macro-item-label">Fat</div></div>
    <div class="macro-item"><div class="macro-item-value">${t.calcium}</div><div class="macro-item-label">Calc</div></div>
  `;
  updateScanProgress(v);
}

function updateScanProgress(v) {
  const intake = getTodayIntake(v.id);
  document.getElementById('scan-progress-bars').innerHTML = `
    <div class="progress-group"><div class="progress-label"><span>Calories</span><span>${intake.calories}/${v.dailyTargets.calories}</span></div><div class="progress-bar"><div class="progress-fill green" style="width:${Math.min(100,(intake.calories/v.dailyTargets.calories)*100)}%"></div></div></div>
  `;
}

function logMeal() {
  if (!state.scanTarget) return;
  const cal = parseFloat(document.getElementById('meal-cal').value);
  if (!cal) { showToast('Masukkan kalori', 'error'); return; }
  
  state.mealLogs.push({
    id: generateId(), victimId: state.scanTarget.id, date: getToday(),
    mealType: document.getElementById('meal-type').value,
    items: document.getElementById('meal-items').value || 'Meal',
    nutrition: {
      calories: cal, protein: parseFloat(document.getElementById('meal-prot').value)||0,
      carbs: parseFloat(document.getElementById('meal-carb').value)||0, fat: parseFloat(document.getElementById('meal-fat').value)||0,
      calcium: parseFloat(document.getElementById('meal-calcium').value)||0
    }
  });
  state.scanTarget.leafCount = (state.scanTarget.leafCount || 0) + 1;
  saveState();
  updateScanProgress(state.scanTarget);
  showToast('Meal logged!', 'success');
}


// ==========================================
// MONITORING (PANITIA)
// ==========================================

function renderMonitoringPage() {
  const total = state.victims.length;
  const children = state.victims.filter(v => v.isChild).length;
  const alerts = state.victims.filter(v => {
    const pct = getNutritionPercentage(v.id);
    return (v.isToddler && pct<50) || (v.isChild && pct<60) || (v.bmiCategory==='underweight' && pct<50);
  });
  
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-children').textContent = children;
  document.getElementById('stat-alerts').textContent = alerts.length;
  document.getElementById('stat-fed').textContent = total ? Math.round(state.victims.reduce((s,v)=>s+getNutritionPercentage(v.id),0)/total)+'%' : '0%';

  document.getElementById('alerts-container').innerHTML = alerts.map(v => `
    <div class="alert-card danger">
      <div class="alert-card-icon">🚨</div>
      <div class="alert-card-content">
        <div class="alert-card-title">${v.name} ${v.isChild?'(Child)':''}</div>
        <div class="alert-card-desc">Nutrition at ${getNutritionPercentage(v.id)}%. Requires attention.</div>
      </div>
    </div>
  `).join('');

  renderMonitoringTable();
}

function renderMonitoringTable() {
  const f = document.getElementById('filter-status').value;
  let arr = f === 'all' ? state.victims : state.victims.filter(v => v.bmiCategory === f);
  
  document.getElementById('monitoring-table-body').innerHTML = arr.map(v => {
    const pct = getNutritionPercentage(v.id);
    const ts = getTreeState(pct);
    const alert = (v.isToddler && pct<50) || (v.isChild && pct<60) || (v.bmiCategory==='underweight' && pct<50);
    return `
      <tr class="${alert?'alert-row':''}">
        <td><b>${v.name}</b><br><small style="color:var(--text-muted)">${v.id}</small></td>
        <td>${v.age}</td>
        <td><span class="badge ${v.bmiCategory==='normal'?'badge-success':'badge-danger'}">${v.bmi}</span></td>
        <td>${v.dailyTargets.calories}</td>
        <td><div class="progress-bar" style="width:100px"><div class="progress-fill green" style="width:${pct}%"></div></div></td>
        <td>${ts}</td>
        <td>${alert?'<span class="badge badge-danger">Alert</span>':'OK'}</td>
      </tr>
    `;
  }).join('');
}


// ==========================================
// INIT DEMO DATA
// ==========================================

function seedDemoData() {
  if(state.victims.length > 0) return;
  const arr = [
    {n:'Ayu Lestari', a:8, g:'female', w:22, h:120},
    {n:'Budi Santoso', a:3, g:'male', w:12, h:90},
    {n:'Rian Hidayat', a:28, g:'male', w:72, h:165}
  ];
  arr.forEach(d => {
    const bmi = calculateBMI(d.w, d.h);
    const bc = getBMICategory(bmi, d.a);
    state.victims.push({
      id: generateId(), pin: '1234', name: d.n, age: d.a, gender: d.g, weight: d.w, height: d.h,
      bmi, bmiCategory: bc, isChild: d.a<=12, isToddler: d.a<5, dailyTargets: calculateDailyTargets(d.w,d.h,d.a,d.g),
      package: 'B', registeredAt: new Date().toISOString(), leafCount: Math.floor(Math.random()*5)
    });
  });
  
  // Add some demo meals so percentages aren't zero
  state.mealLogs.push({
    id: 'm1', victimId: state.victims[0].id, date: getToday(), mealType: 'breakfast', items: 'Rice',
    nutrition: { calories: 800, protein: 20, carbs: 100, fat: 20, calcium: 300 } // Should make it bloom
  });

  saveState();
}

document.addEventListener('DOMContentLoaded', initApp);
