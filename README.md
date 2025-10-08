# 🧠 GitHub Commit Activity Generator

This Node.js script automatically generates **backdated Git commits** to visually fill your GitHub contribution graph.  
It creates random commits spread over the past year — ideal for learning Git, experimenting with automation, or visualizing commit patterns.

---

## 🚀 Features

- ✨ Automatically creates and timestamps commits across the past year
- 🎲 Uses **randomized dates** for a natural-looking activity pattern
- 🤖 Fully automated commit + push using `simple-git`
- 🔗 Works with any repository (local or remote)
- ⚡ Configurable commit frequency and date ranges

---

## 🛠️ Tech Stack

- **Node.js** – Runtime environment
- **moment.js** – Flexible date/time manipulation
- **jsonfile** – Writing temporary commit data
- **simple-git** – Automating git commands
- **random** – Randomizing commit placement

---

## 📦 Installation

### 1. Clone this repository
```bash
git clone https://github.com/VishalChavan7/commit-activity-generator.git
cd commit-activity-generator
```

### 2. Initialize npm & install dependencies
```bash
npm init -y
npm install jsonfile moment simple-git random
```

### 3. Verify your git remote (optional)
```bash
git remote -v
```

---

## ⚙️ Usage

### Basic Usage

1. Save the script as `index.js` in your repository
2. Run the script:
   ```bash
   node index.js
   ```

3. The script will:
   - 📅 Randomly generate commit dates for the last year
   - 📝 Create a JSON file (`data.json`)
   - 💾 Commit those changes automatically
   - 🚀 Push to your current GitHub repository

### Customization

You can adjust the number of commits by editing the function call at the bottom of `index.js`:

```javascript
makeCommits(200); // Change 200 to your desired number
```

---

## 🧩 Example Output

After running, your terminal will display commit timestamps:

```
2024-12-15T08:45:31+05:30
2024-12-18T09:12:04+05:30
2024-12-22T14:30:15+05:30
2025-01-05T11:20:42+05:30
...
```

Your GitHub contribution graph will update within a few minutes after pushing! 📊

---

## ⚠️ Important Notes

- 🔐 Ensure your local repository is connected to a remote GitHub repository
- 🎯 **Educational Purpose Only** – This tool is intended for learning Git automation and visualization
- ⏱️ GitHub updates contribution graphs every few minutes after push
- 🚫 **Do not use this to mislead** – Avoid using this for artificial profile metrics
- 📋 The generated `data.json` file is used as a placeholder for commits
