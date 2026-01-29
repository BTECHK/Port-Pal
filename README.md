<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

# 🛡️ Port Pal: Secure Local Port Authority

**View this project in Google AI Studio:** [https://ai.studio/apps/drive/15xxmWdr6xu6vi2xPIzfnP5CPDYGr3AIa](https://ai.studio/apps/drive/15xxmWdr6xu6vi2xPIzfnP5CPDYGr3AIa)

</div>

---

### ⚠️ Proof of Concept

**Note:** This is a **Proof of Concept (PoC)** tool designed for local "Vibe Coding" workflows. It demonstrates how to use OS-level file locking and socket binding to manage localhost ports securely. It is intended for personal development environments and should be reviewed before enterprise deployment.

---

## 🚀 Overview

**Port Pal** is a "zero-friction" infrastructure utility for Vibe Coders. It acts as an automated Air Traffic Controller for your localhost ports, preventing the dreaded `EADDRINUSE: address already in use` error while you rapidly prototype with AI agents.

It consists of two parts:

1. **The Engine (`port_pal.py`):** A secure, atomic CLI tool that assigns ports and updates your `.env` file.
2. **The Dashboard (`dashboard.py`):** A cyber-styled, read-only visualization of your active ports.

---

## 📦 Installation (Run Locally)

This tool runs on **Python**, so we use `pip` instead of `npm`.

### 1. Prerequisites

* Python 3.8+ installed on your machine.
* (Optional) A virtual environment.

### 2. Setup

Clone the repository or download the files.

```bash
# Install dependencies for the Dashboard (The CLI has NO external dependencies)
pip install -r requirements.txt

```

### 3. API Keys (Optional)

If you are extending this with Gemini capabilities later:

* Rename `.env.example` to `.env.local` (if provided).
* Add your key: `GEMINI_API_KEY=your_key_here`.

---

## 🕹️ Usage: The CLI (Engine)

This is the tool your AI Agents (Cursor, Claude, Windsurf) should use.

**Basic Command:**
Assign a port for a web app and write it to your `.env` file:

```bash
python port_pal.py --name my-blog --type web --env ./.env

```

**Output:** `3001` (Prints ONLY the port number).

| Argument | Description | Default |
| --- | --- | --- |
| `--name` | **Required.** Unique ID for the project (e.g., `project-alpha`). | `None` |
| `--env` | **Required.** Path to the target `.env` file. | `None` |
| `--type` | The port range to search (`web`, `api`, `streamlit`, `db`). | `web` |

---

## 📊 Usage: The Dashboard

Launch the visual interface to see what ports are active.

```bash
streamlit run dashboard.py

```

* **Auto-Refresh:** The dashboard updates automatically when `ports.json` changes.
* **Read-Only:** It visualizes data but cannot modify it, ensuring security.

---

## 🔒 Security Architecture

Port Pal follows a **"Shift Left"** security model:

1. **Input Sanitization:** The `--env` path is strictly validated. Attempts to write to system directories (`/etc/`, `C:\Windows`) or use directory traversal (`..`) will trigger a `SecurityError` and exit.
2. **Least Privilege:** The script detects if it is being run as `root`/`sudo` and immediately aborts.
3. **XSS Prevention:** The dashboard uses `html.escape()` on all user-supplied data before rendering, preventing script injection attacks via project names.

---

## 🤖 For AI Agents

Add this to your `.cursorrules` or `AGENTS.md` to teach your AI how to use Port Pal:

```markdown
## Port Management Tool
I have installed a tool called `Port Pal` to manage local ports.
WHEN you need to assign a port for a new project:
1. DO NOT guess a port number (e.g., don't just pick 3000).
2. RUN this command: `python3 port_pal.py --name [project_name] --type [web|api] --env ./.env`
3. USE the integer output from that command as the PORT.

```

<img width="1508" height="830" alt="image" src="https://github.com/user-attachments/assets/93eeae6f-671d-4b17-a72d-70bdb59bbe73" />

