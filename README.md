# 🚀 WA Bulk Sender (Free & Local)

> 💬 Send personalized WhatsApp messages at scale — safely, locally, and without any premium lock.

---

## 🌐 About the Project

**WA Bulk Sender** is a powerful Chrome Extension that helps you send **bulk WhatsApp messages** directly from WhatsApp Web.

✔ No login system  
✔ No paid unlock  
✔ 100% local processing  
✔ Smart safety & risk system  

🔗 Built & used by:  
👉 https://matoshreecollection.in

---

## ✨ Key Features

### 📩 Messaging Capabilities
- Send messages to:
  - Manual numbers
  - CSV / Excel lists
  - Contacts / Chats / Groups / Labels
- Use dynamic placeholders:
  - `{{FirstName}}`, `{{Name}}`, etc.
- Attach:
  - Images, Videos, Docs, Audio, Stickers

---

### ⚡ Smart Automation
- Random delays & batching
- Daily send limits
- Auto skip duplicates
- Pause / Resume / Stop anytime

---

### 🧠 Safety & Risk System
- Local restriction-risk estimator
- Based on:
  - Message pace
  - Failures
  - Consent coverage
- Manual block/report input support
- Failure-based auto stop system

---

### 📊 Campaign Control
- Live monitor inside WhatsApp Web
- Export results (CSV)
- Retry failed numbers
- Save audience presets
- Campaign history tracking

---

## 📂 Project Structure

```
WA-Bulk-Sender/
│
├── data/                # Local data storage
├── scripts/             # Core logic
├── styles/              # UI styling
├── third_party/         # External libraries (WPPConnect)
│
├── popup.html           # Extension popup
├── studio.html          # Main dashboard
├── manifest.json        # Chrome extension config
├── README.md
```

---

## 🛠️ Installation Guide

### Step 1: Download Project
Clone or download this repo:
```
git clone https://github.com/swarajfugare/WA-Bulk-Sender.git
```

---

### Step 2: Load in Chrome

1. Open Chrome  
2. Go to:
```
chrome://extensions
```
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select your project folder

---

## 🚀 How to Use

### Step-by-Step Workflow

1. Open extension popup  
2. Open **Studio Page**  
3. Login to WhatsApp:
   👉 https://web.whatsapp.com  
4. Refresh WhatsApp data  
5. Choose audience  
6. Add message + placeholders  
7. (Optional) Import file  
8. Set delays & limits  
9. Check safety summary  
10. Start sending 🚀  

---

## 📄 Import Format

Minimum column required:
```
WhatsApp Number
```

Optional:
```
FirstName, LastName, Name, CustomField
```

### Example CSV:
```
WhatsApp Number,FirstName,CustomField
+919876543210,Swaraj,Offer
```

### Message Example:
```
Hello {{FirstName}}, your {{CustomField}} is ready.
```

---

## ⚠️ Important Notes

- Keep WhatsApp Web **open while sending**
- This tool is:
  - ❌ Not official WhatsApp
  - ⚠️ Use responsibly
- Risk % is:
  - 🔹 Only an estimate
  - 🔹 Not WhatsApp’s real score

---

## 🔐 Safety Tips

✔ Use slow sending speed  
✔ Avoid spammy messages  
✔ Always use consent-based data  
✔ Start with small batches  

---

## 📦 Version

**Current Version:** `0.9.0`

---

## 📜 License

This project is licensed under the **MIT License**

---

## 👨‍💻 Developer

**Swaraj Fugare**

---

## ❤️ Support

If this project helps you:

⭐ Star the repository  
🔗 Share with others  
🌐 Visit: https://matoshreecollection.in  

---

## 🚀 Future Updates

- AI message personalization
- Better analytics dashboard
- Smart scheduling
- Multi-language support

---

> ⚡ Build. Automate. Grow.
