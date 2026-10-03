# 🛡️ SentinelRASP

> **Autonomous Runtime Application Self-Protection (RASP) & Dynamic Risk Engine for Banking Applications**

SentinelRASP is a real-time application security shield built for high-security financial environments. It continuously ingests low-level mobile device telemetry (package tampering, dynamic hooking, kernel syscall anomalies, screen overlays, ADB debugging) and calculates a real-time risk score (0–100) to enforce granular banking capabilities dynamically.

---

## 🚀 Key Features

- **⚡ Low-Latency Telemetry Engine**: Monitors dynamic memory inspection, hooking tools (Frida/Xposed), root bypasses, and overlay hijacking.
- **🏦 Tiered Banking Enforcement Matrix**:
  - **LOW RISK (0–39)**: Full Banking Access (*Login, Balance View, & Money Transfers Allowed*).
  - **MODERATE RISK (40–69)**: Restricted Access (*App Login Allowed; Balance & Money Transfers Blocked*).
  - **HIGH RISK (70–100)**: Session Lockdown (*Complete Session Termination & Incident Response*).
- **🤖 Kimi LLM AI Mitigation**: Generates contextual, threat-specific remediation policies on the fly based on incoming attack vectors.
- **📊 Real-Time Animated Dashboard**: Dynamic UI built with Tailwind CSS, Lucide Icons, and automated 500ms polling for telemetry synchronization.
- **🖥️ Judge-Facing Telemetry CLI**: Terminal input console (`cli_demo.py`) for live 0/1 signal injection.

---

## 🏗️ System Architecture
