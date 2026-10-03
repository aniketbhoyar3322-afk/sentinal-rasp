const API_URL = "http://127.0.0.1:5000/api/risk-score";
const POLL_URL = "http://127.0.0.1:5000/api/latest-telemetry";

async function evaluateRisk() {
    const payload = {
        integrity: document.getElementById('integrity').checked,
        hook: document.getElementById('hook').checked,
        syscall: document.getElementById('syscall').checked,
        overlay: document.getElementById('overlay').checked,
        adb: document.getElementById('adb').checked,
        developer: document.getElementById('developer').checked
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            updateUI(data);
            updateBackendStatus(true);
        }
    } catch (e) {
        updateBackendStatus(false);
    }
}

// Live Polling: Receives terminal input (0 or 1) and ticks UI checkboxes live
async function pollTerminalUpdates() {
    try {
        const res = await fetch(POLL_URL);
        if (res.ok) {
            const data = await res.json();
            if (data && data.signals) {
                Object.keys(data.signals).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) el.checked = data.signals[key];
                });
                updateUI(data);
                updateBackendStatus(true);
            }
        }
    } catch (e) {
        updateBackendStatus(false);
    }
}

function updateUI(data) {
    const scoreEl = document.getElementById('risk-score-display');
    const progressBar = document.getElementById('risk-progress-bar');
    const statusBadge = document.getElementById('status-badge');
    const statusSubtext = document.getElementById('status-subtext');
    const policyEl = document.getElementById('policy-display');
    const terminalEl = document.getElementById('terminal-output');

    if (!scoreEl) return;

    // 1. Score & Progress Bar
    scoreEl.innerText = data.score;
    progressBar.style.width = `${data.score}%`;

    // 2. Banking App Permission Elements
    const capLogin = document.getElementById('bank-cap-login');
    const capBalance = document.getElementById('bank-cap-balance');
    const capTransfer = document.getElementById('bank-cap-transfer');

    const textLogin = document.getElementById('text-cap-login');
    const textBalance = document.getElementById('text-cap-balance');
    const textTransfer = document.getElementById('text-cap-transfer');

    // TIER 1: CLEAN / LOW RISK (< 40)
    if (data.score < 40) {
        scoreEl.className = "text-6xl font-black tracking-tight text-emerald-400 transition-colors duration-500";
        progressBar.className = "bg-emerald-400 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        statusBadge.innerText = data.status || "ALLOWED";
        statusSubtext.innerText = "Banking Session Active: Full Operational Access.";

        // Permissions: Full Access
        setCapStyle(capLogin, textLogin, true, "ALLOWED");
        setCapStyle(capBalance, textBalance, true, "ALLOWED");
        setCapStyle(capTransfer, textTransfer, true, "ALLOWED");

    // TIER 2: MODERATE RISK (40 - 69)
    } else if (data.score < 70) {
        scoreEl.className = "text-6xl font-black tracking-tight text-amber-400 transition-colors duration-500";
        progressBar.className = "bg-amber-400 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30";
        statusBadge.innerText = data.status || "RESTRICTED";
        statusSubtext.innerText = "Suspicious Environment: Sensitive Actions Locked.";

        // Permissions: Login ALLOWED, Balance & Transfers BLOCKED
        setCapStyle(capLogin, textLogin, true, "ALLOWED");
        setCapStyle(capBalance, textBalance, false, "BLOCKED");
        setCapStyle(capTransfer, textTransfer, false, "BLOCKED");

    // TIER 3: HIGH RISK (70+)
    } else {
        scoreEl.className = "text-6xl font-black tracking-tight text-rose-500 transition-colors duration-500";
        progressBar.className = "bg-rose-500 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/30";
        statusBadge.innerText = data.status || "HIGH RISK";
        statusSubtext.innerText = "Session Terminated: Application Access Denied.";

        // Permissions: All BLOCKED
        setCapStyle(capLogin, textLogin, false, "BLOCKED");
        setCapStyle(capBalance, textBalance, false, "BLOCKED");
        setCapStyle(capTransfer, textTransfer, false, "BLOCKED");
    }

    policyEl.innerText = data.policy || "Enforcing default security policy.";
    terminalEl.innerText = JSON.stringify(data, null, 2);
    
    if (window.lucide) lucide.createIcons();
}

function setCapStyle(boxEl, textEl, isAllowed, labelText) {
    if (!boxEl || !textEl) return;
    if (isAllowed) {
        boxEl.className = "p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all text-center";
        textEl.className = "text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mt-1";
    } else {
        boxEl.className = "p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 transition-all text-center opacity-80";
        textEl.className = "text-[10px] font-bold text-rose-400 uppercase tracking-wider block mt-1";
    }
    textEl.innerText = labelText;
}

function setPreset(type) {
    const presets = {
        clean: { integrity: false, hook: false, syscall: false, overlay: false, adb: false, developer: false },
        suspicious: { integrity: true, hook: false, syscall: false, overlay: true, adb: false, developer: false },
        compromised: { integrity: true, hook: true, syscall: true, overlay: true, adb: true, developer: true }
    };

    const target = presets[type];
    if (!target) return;

    Object.keys(target).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) checkbox.checked = target[key];
    });

    evaluateRisk();
}

function updateBackendStatus(isConnected) {
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');
    if (dot && text) {
        dot.className = isConnected ? "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" : "w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping";
        text.innerText = isConnected ? "API Connected" : "API Offline";
    }
}

// Poll every 500ms for live terminal updates
setInterval(pollTerminalUpdates, 500);
