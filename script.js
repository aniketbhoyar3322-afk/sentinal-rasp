const API_URL = "http://127.0.0.1:5000/api/risk-score";

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

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        updateUI(data);
        updateBackendStatus(true);
    } catch (error) {
        console.error("API Error:", error);
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

    // 1. Update Score & Progress Bar
    scoreEl.innerText = data.score;
    progressBar.style.width = `${data.score}%`;

    // 2. Dynamic Color & Status Styling
    if (data.score < 40) {
        scoreEl.className = "text-6xl font-black tracking-tight text-emerald-400 transition-colors";
        progressBar.className = "bg-emerald-400 h-full transition-all duration-700 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
        statusBadge.innerText = data.status || "ALLOWED";
        statusSubtext.innerText = "Device clean. Full operational access granted.";
    } else if (data.score < 70) {
        scoreEl.className = "text-6xl font-black tracking-tight text-amber-400 transition-colors";
        progressBar.className = "bg-amber-400 h-full transition-all duration-700 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30";
        statusBadge.innerText = data.status || "RESTRICTED";
        statusSubtext.innerText = "Suspicious activity detected. Step-up auth required.";
    } else {
        scoreEl.className = "text-6xl font-black tracking-tight text-rose-500 transition-colors";
        progressBar.className = "bg-rose-500 h-full transition-all duration-700 ease-out";
        statusBadge.className = "inline-flex items-center px-4 py-2 rounded-xl text-base font-extrabold tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/30";
        statusBadge.innerText = data.status || "HIGH RISK";
        statusSubtext.innerText = "Critical security breach. Session terminated.";
    }

    // 3. Update Policy Text & Terminal Stream
    policyEl.innerText = data.policy || "No remediation action provided.";
    terminalEl.innerText = JSON.stringify(data, null, 2);
}

function setPreset(type) {
    const presets = {
        clean: { integrity: false, hook: false, syscall: false, overlay: false, adb: false, developer: false },
        suspicious: { integrity: true, hook: false, syscall: false, overlay: true, adb: true, developer: false },
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

    if (isConnected) {
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        text.innerText = "API Connected";
        text.className = "text-slate-300";
    } else {
        dot.className = "w-2 h-2 rounded-full bg-rose-500 animate-ping";
        text.innerText = "API Offline";
        text.className = "text-rose-400 font-semibold";
    }
}