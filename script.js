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

// Live polling: Reads 0/1 inputs from terminal and ticks UI checkboxes automatically
async function pollTerminalUpdates() {
    try {
        const res = await fetch(POLL_URL);
        if (res.ok) {
            const data = await res.json();
            if (data && data.signals) {
                // Auto-tick or untick checkboxes based on terminal flags (1 or 0)
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

    scoreEl.innerText = data.score;
    progressBar.style.width = `${data.score}%`;

    if (data.score < 40) {
        scoreEl.className = "text-6xl font-black tracking-tight text-emerald-400 transition-colors";
        progressBar.className = "bg-emerald-400 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        statusBadge.innerText = data.status || "ALLOWED";
        statusSubtext.innerText = "Banking Session Active: No Threat Detected.";
    } else if (data.score < 70) {
        scoreEl.className = "text-6xl font-black tracking-tight text-amber-400 transition-colors";
        progressBar.className = "bg-amber-400 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30";
        statusBadge.innerText = data.status || "RESTRICTED";
        statusSubtext.innerText = "Suspicious Telemetry: Step-up Auth Required.";
    } else {
        scoreEl.className = "text-6xl font-black tracking-tight text-rose-500 transition-colors";
        progressBar.className = "bg-rose-500 h-full transition-all duration-500 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/30";
        statusBadge.innerText = data.status || "HIGH RISK";
        statusSubtext.innerText = "Banking Session Blocked: Device Compromised.";
    }

    policyEl.innerText = data.policy || "Enforcing default security policy.";
    terminalEl.innerText = JSON.stringify(data, null, 2);
}

function updateBackendStatus(isConnected) {
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');
    if (dot && text) {
        dot.className = isConnected ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" : "w-2 h-2 rounded-full bg-rose-500 animate-ping";
        text.innerText = isConnected ? "API Connected" : "API Offline";
    }
}

// Start polling every 500ms for instant real-time sync
setInterval(pollTerminalUpdates, 500);
