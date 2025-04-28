# Chicken Code Extension for Visual Studio Code

## 🚀 **Introduction**
Chicken Code is an extension for Visual Studio Code that helps you automatically and efficiently optimize your source code. By leveraging AI from Google Generative Language, Chicken Code analyzes your source code, provides optimization suggestions, and allows you to apply them instantly.

---

## 🧩 **Key Features**

- **Code Analysis and Optimization**: Automatically detects areas for improvement and provides suggestions.
- **User-friendly Interface**: Displays the list of optimizations in the Webview Sidebar.
- **Configuration File Integration**: Reads files like `.eslintrc`, `.prettierrc`, and `tsconfig.json` to follow project rules.
- **Manage Additional Rules**: Easily add, delete, and manage optimization rules.
- **Save and Delete API Key**: Allows users to enter and securely store the API Key.
- **View Optimization History**: Displays skipped optimizations and allows users to review them.

---

## 📦 **Installation**

1. Open Visual Studio Code.
2. Open the **Extensions** tab (Ctrl + Shift + X).
3. Search for **Chicken Code**.
4. Click the **Install** button to install the extension.
5. After installation, you will see the **Chicken Code** icon in the Activity Bar.

---

## 📚 **Usage Guide**

### 1️⃣ **Enter API Key**
- On first use, you will be prompted to enter an API Key.
- The API Key can be obtained from [Google AI Studio](https://aistudio.google.com/apikey).
- Enter the API Key and click **Save**.

### 2️⃣ **Optimize Code**
- Open the file you want to optimize.
- Click the **Optimize** button in the Chicken Code Sidebar.
- Chicken Code will analyze and display optimization suggestions.

### 3️⃣ **Manage Optimizations**
- **Apply Optimization**: Click the **Apply** button to apply the optimization to your source code.
- **Skip Optimization**: Click the **Skip** button to skip the optimization.
- **Add Additional Rules**: Skip specific rules for future optimizations.

### 4️⃣ **View and Manage Additional Rules**
- Click the **View Additional Rule** button to view the list of skipped rules.
- Delete additional rules by clicking the **Delete** button next to the rule.

### 5️⃣ **Clear Cache and API Key**
- Click the **Clear Cache** button to clear all skipped optimizations.
- Click the **Reset API Key** button to delete the API Key from the extension's storage.

---

## ⚙️ **Configuration and Setup**

Chicken Code automatically detects and uses the following configuration files from the project's root directory:
- **ESLint**: `.eslintrc`, `.eslintrc.json`, `.eslintrc.js`
- **Prettier**: `.prettierrc`, `.prettierrc.json`, `.prettierrc.js`
- **TypeScript**: `tsconfig.json`

If these files exist, Chicken Code will adjust its optimizations to comply with the rules and guidelines specified in these files.

---

## 📖 **System Architecture**

### **File Structure**
- **extension.ts**: The main entry point for the extension and registers necessary providers.
- **optimizationResultsProvider.ts**: The main class that manages the Webview and displays optimization suggestions.
- **checkApiKey.ts**: Manages the API Key, including entry and deletion.
- **constants.ts**: Contains constants and prompt templates for different programming languages.
- **fileConfig.ts**: Searches for and reads configuration files from the project.
- **handleView.ts**: Generates HTML, CSS, and JavaScript content for Chicken Code's Webview.
- **service.ts**: Sends requests to the Google Generative Language API to retrieve optimizations.

---

## 🛠️ **NPM Scripts**

| Script         | Description                           |
|----------------|---------------------------------------|
| `yarn compile` | Compiles TypeScript source files      |
| `yarn watch`   | Watches for changes and auto-compiles |
| `yarn package` | Creates a package for the extension   |
| `yarn lint`    | Runs ESLint checks                    |
| `yarn test`    | Runs all tests                        |

---

## 📄 **API Usage**

Chicken Code uses the **Google Generative Language API** to create source code optimizations.

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "contents": [
      {
        "parts": [
          {
            "text": "<Your source code>"
          }
        ]
      }
    ]
  }
  ```
- **Response**: JSON containing the list of optimizations.

---

## 📋 **System Requirements**

- **Visual Studio Code**: Version `^1.93.0` or later.
- **Node.js**: Version `>=14.x`.

---

## 🚨 **Important Notes**

- Your API Key will be stored in VS Code's `globalState`.
- Chicken Code may prompt you to re-enter the API Key if it is invalid.
- Ensure that your configuration files (`.eslintrc`, `.prettierrc`, `tsconfig.json`, etc.) are correctly defined to maximize Chicken Code's capabilities.

---

## 🤝 **Contributions**

We welcome contributions from the community! If you find a bug or have a feature suggestion, please open an issue or submit a pull request on GitHub.

- **GitHub Repository**: [Chicken Code on GitHub](https://github.com/NinelXram/chicken-code)

---

## 📞 **Support**

If you have any questions, feel free to reach out via email: **esdridz@gmail.com**.

---

## 📜 **License**

Chicken Code is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

Thank you for using Chicken Code! 🐔# chicken-code
