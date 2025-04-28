import * as vscode from "vscode";
import { checkAppliedConfigFiles } from "./fileConfig";
import {
  getApiKeyInputHtml,
  getLogHtml,
  getWebviewContent,
} from "./handleView";
import { fetchOptimizationResults, testFetchWithApiKey } from "./service";
import {
  ADDITIONAL_RULES_KEY,
  API_KEY_STORAGE_KEY,
  DATA_OPTIMIZE_KEY,
  ON_LOG_KEY,
  ON_SAVE_KEY,
  promtWithLangMap,
  SKIP_KEY,
} from "./constants";

export class OptimizationResultsProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private apiKey: string | undefined;
  private optimizations: any[] = [];
  private readonly highlightDecoration: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      backgroundColor: "black",
      borderRadius: "2px",
      border: "0.5px solid rgba(255, 215, 0, 0.8)",
    });
  private additionalContext: string = "";

  public showLoadingIndicator() {
    if (this._view) {
      this._view.webview.postMessage({ command: "showLoading" });
    }
  }

  public hideLoadingIndicator() {
    if (this._view) {
      this._view.webview.postMessage({ command: "hideLoading" });
    }
  }

  constructor(
    private readonly context: vscode.ExtensionContext,
    apiKey: string | undefined
  ) {
    this.apiKey = apiKey;
  }

  async loadAdditionalContext() {
    const context = await checkAppliedConfigFiles();
    this.additionalContext = context ?? "";
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    if (this.apiKey === "") {
      webviewView.webview.html = getApiKeyInputHtml();
    } else {
      webviewView.webview.html = getWebviewContent();
    }

    webviewView.onDidChangeVisibility(() => {
      if (!webviewView.visible) {
        const currentData = this.optimizations;
        this.context.workspaceState.update(DATA_OPTIMIZE_KEY, currentData);
        this.clearHighlight();
      } else {
        const savedData = this.context.workspaceState.get<any[]>(
          DATA_OPTIMIZE_KEY,
          []
        );
        if (savedData && savedData.length > 0) {
          this.optimizations = savedData;
        }
        this.updateWebview();
      }
    });

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "submitApiKey":
          testFetchWithApiKey(message.apiKey)
            .then(async () => {
              await this.context.globalState.update(
                API_KEY_STORAGE_KEY,
                message.apiKey
              );
              this.apiKey = message.apiKey;
              vscode.window.showInformationMessage(
                "API Key has been saved successfully."
              );
              webviewView.webview.html = getWebviewContent();
            })
            .catch((error) => {
              vscode.window.showErrorMessage(
                "API Key not valid. Please try again."
              );
            });
          break;
        case "resetApiKey":
          await this.context.globalState.update(API_KEY_STORAGE_KEY, "");
          this.apiKey = "";
          vscode.window.showInformationMessage(
            "API Key has been deleted successfully."
          );
          webviewView.webview.html = getApiKeyInputHtml();
          break;
        case "showMessage":
          vscode.window.showInformationMessage(message.text);
          break;
        case "removeOptimization":
          this.removeOptimization(message.originalCode);
          break;

        case "applyCode":
          this.applyOptimization(
            message.originalCode,
            message.optimizedCode
          ).then(() => {
            this._view?.webview.postMessage({
              command: "removeOptimization",
              index: message.index,
            });
          });
          break;

        case "skipOption":
          this.skipOptimization(message.codeOriginal);
          this._view?.webview.postMessage({
            command: "removeOptimization",
            index: message.index,
          });
          break;
        case "viewCache":
          {
            const skippedOptions =
              this.context.globalState.get<string[]>(SKIP_KEY) || [];
            this._view?.webview.postMessage({
              command: "showCache",
              cache: skippedOptions,
            });
          }
          break;
        case "clearCache":
          this.context.globalState.update(SKIP_KEY, []);
          vscode.window.showInformationMessage("Cache cleared successfully.");
          this.setOptimizations(this.optimizations);
          break;

        case "viewAdditionalRule":
          const additionalRules = this.context.globalState.get<string[]>(
            ADDITIONAL_RULES_KEY,
            []
          );
          this._view?.webview.postMessage({
            command: "viewAdditionalRule",
            rules: additionalRules,
          });
          break;
        case "deleteAdditionalRule":
          const updatedRules = this.context.globalState
            .get<string[]>(ADDITIONAL_RULES_KEY, [])
            .filter((rule) => rule !== message.rule);
          this.context.globalState.update(ADDITIONAL_RULES_KEY, updatedRules);
          updatedRules.length === 0
            ? this._view?.webview.postMessage({
                command: "returnToOptimizations",
              })
            : this._view?.webview.postMessage({
                command: "viewAdditionalRule",
                rules: updatedRules,
              });

          break;

        case "returnToOptimizations":
          this._view?.webview.postMessage({
            command: "returnToOptimizations",
          });
          break;
        case "scrollToCode":
          this.scrollToCode(message.originalCode);
          break;
        case "optimizeCode":
          this.startOptimization();
          break;
        case "clearHighlight":
          this.clearHighlight(message.originalCode);
          break;
        case "skipRule":
          const currentSkippedRules =
            this.context.globalState.get<string[]>(ADDITIONAL_RULES_KEY) || [];
          if (message.rule && !currentSkippedRules.includes(message.rule)) {
            currentSkippedRules.push(message.rule);
            this.context.globalState.update(
              ADDITIONAL_RULES_KEY,
              currentSkippedRules
            );
            this.removeOptimization(message.codeOriginal);
            vscode.window.showInformationMessage(
              `Rule '${message.rule}' has been skipped.`
            );
          }
          break;
        case "toggleOnLog":
          this.context.globalState.update(ON_LOG_KEY, message.enabled);
          break;
        case "toggleOnSave":
          this.context.globalState.update(ON_SAVE_KEY, message.enabled);
          break;
      }
    });

    this.updateWebview();
  }

  async startOptimization(selectedText?: string) {
    const lang = vscode.window.activeTextEditor?.document.languageId;
    if (!lang || !(lang in promtWithLangMap)) {
      vscode.window.showErrorMessage("Language not supported.");
      return;
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Optimizing code...",
        cancellable: false,
      },
      async () => {
        this.showLoadingIndicator();
        await this.loadAdditionalContext();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage(
            "No file is currently open for optimization."
          );
          return;
        }
        const content = selectedText || editor.document.getText();

        const additionalSkipRules = this.context.globalState.get<string[]>(
          ADDITIONAL_RULES_KEY,
          []
        );

        const promptEn = `${
          promtWithLangMap[lang as keyof typeof promtWithLangMap]
        }

${this.additionalContext}


### **Skip Cases**

Do **not** consider the following issues:
${additionalSkipRules.map((rule) => `- Skip: ${rule}`).join("\n")}
- Case-Specific Requirements: If an optimization is specific to a case that matches a known pattern or use case, ensure that it is explicitly noted so it can be added to the skip list for future optimizations.

### **How to Provide Feedback**

If optimization opportunities exist, provide feedback in the following format:

\`\`\`json
[
  {
    "codeOriginal": "const HelloWorld = 'Hello World';\n\nconst greeting = 'Hi';",
    "codeOptimized": "const HelloWorld = 'Hello World'; const greeting = 'Hi';",
    "codeName": "Line break removal",
    "codeDescription": "Unnecessary line break between variable declarations was removed to reduce code size and improve compactness.",
  },
  {
    "codeOriginal": "const ProductManagementSystem = 'PMS';",
    "codeOptimized": "const productManagementSystem = 'PMS';",
    "codeName": "Variable name shortening",
    "codeDescription": "Renamed 'ProductManagementSystem' to 'productManagementSystem' to follow camelCase convention and reduce name length.",
  }
]
\`\`\`

----------

### **Code Snippet to Optimize**
${content}

----------

### **Instructions for Optimization**
1. **Review** the code snippet above and identify any possible improvements.
2. **Provide Feedback** using the format listed in the "How to Provide Feedback" section.
3. **Apply Configuration Rules** as listed in the Prettier and TypeScript config files.

If the code does not require optimization, explicitly state that no optimization is necessary.
`;

        const prompt = promptEn;

        this.showPromptLog(prompt);
        try {
          const result = await fetchOptimizationResults(
            prompt,
            this.apiKey ?? ""
          );

          await this.handleApiResponse(result);
        } catch (error) {
          vscode.window.showErrorMessage("Error when calling API: " + error);
        } finally {
          this.hideLoadingIndicator();
        }
      }
    );
  }

  showPromptLog(prompt: string) {
    const onLog = this.context.globalState.get<boolean>(ON_LOG_KEY);
    if (!onLog) {
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "promptLog",
      "Prompt Log",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = getLogHtml(prompt, "Prompt Log");
  }

  showResultLog(result: string) {
    const onLog = this.context.globalState.get<boolean>(ON_LOG_KEY);
    if (!onLog) {
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "resultLog",
      "Result Log",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = getLogHtml(result, "Result Log");
  }

  async handleApiResponse(apiResponse: any) {
    try {
      const contentText = apiResponse.candidates[0].content.parts[0].text;
      this.showResultLog(contentText);
      const jsonStart = contentText.indexOf("[");
      const jsonEnd = contentText.lastIndexOf("]");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("JSON array not found in content.");
      }

      const jsonString = contentText.substring(jsonStart, jsonEnd + 1);
      const optimizationResults = JSON.parse(jsonString);
      if (!Array.isArray(optimizationResults)) {
        throw new Error("JSON parsing did not return a valid array.");
      }
      this.setOptimizations(optimizationResults);

      vscode.window.showInformationMessage(
        "Optimization results have been displayed in the Chicken Code Sidebar."
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        "Error when handling API result: " + error
      );
    }
  }

  getRangeCodeInFile(originalCode: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file is open to scroll to the code.");
      return null;
    }

    const documentText = editor.document.getText();

    const escapeSpecialChars = (code: string) =>
      code.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const normalizedOriginalCode = escapeSpecialChars(originalCode).replace(
      /\s+/g,
      "\\s+"
    );
    const regex = new RegExp(normalizedOriginalCode, "g");

    const match = regex.exec(documentText);

    if (!match) {
      vscode.window.showWarningMessage("Code snippet not found in document.");
      return null;
    }
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    const startPosition = editor.document.positionAt(startIndex);
    const endPosition = editor.document.positionAt(endIndex);
    const range = new vscode.Range(startPosition, endPosition);
    return range;
  }

  scrollToCode(originalCode: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file is open to scroll to the code.");
      return;
    }
    const range = this.getRangeCodeInFile(originalCode);
    if (!range) {
      vscode.window.showWarningMessage("Code snippet not found in document.");
      this.clearHighlight();
      return;
    }

    editor.setDecorations(this.highlightDecoration, [range]);

    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  }

  removeOptimization(originalCode: string) {
    this.optimizations = this.optimizations.filter(
      (opt) => opt.codeOriginal !== originalCode
    );
    this.updateWebview();
  }

  clearHighlight(originalCode?: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    if (originalCode) {
      const documentText = editor.document.getText();

      const escapeSpecialChars = (code: string) =>
        code.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

      const normalizedOriginalCode = escapeSpecialChars(originalCode).replace(
        /\s+/g,
        "\\s+"
      );
      const regex = new RegExp(normalizedOriginalCode, "g");
      const match = regex.exec(documentText);

      if (match) {
        editor.setDecorations(this.highlightDecoration, []);
      }
    } else {
      editor.setDecorations(this.highlightDecoration, []);
    }
  }

  skipOptimization(codeOriginal: string) {
    const currentSkippedOptions =
      this.context.globalState.get<string[]>(SKIP_KEY) || [];
    const hash = this.hashCode(codeOriginal);
    if (!currentSkippedOptions.includes(hash)) {
      currentSkippedOptions.push(hash);
      this.context.globalState.update(SKIP_KEY, currentSkippedOptions);
    }
  }

  hashCode(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  }

  setOptimizations(optimizations: any[] = []): void {
    vscode.commands
      .executeCommand("workbench.view.extension.chickenCodeOptimizer")
      .then(() => {
        const skippedOptions =
          this.context.globalState.get<string[]>(SKIP_KEY) || [];
        this.optimizations = optimizations
          .filter(
            (opt) => !skippedOptions.includes(this.hashCode(opt.codeOriginal))
          )
          .map((opt) => {
            return {
              ...opt,
              canApply: !!this.getRangeCodeInFile(opt.codeOriginal),
            };
          });
        this.updateWebview();
      });
  }

  updateWebview() {
    if (this._view) {
      // vscode.window.showInformationMessage(
      //   `Optimizations: ${this.optimizations}`
      // );
      this._view.webview.postMessage({
        command: "updateOptimizations",
        optimizations: this.optimizations,
        onSave: this.context.globalState.get<boolean>(ON_SAVE_KEY),
        onLog: this.context.globalState.get<boolean>(ON_LOG_KEY),
      });
    }
  }

  async applyOptimization(originalCode: string, optimizedCode: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage(
        "No file is open to apply optimized code."
      );
      return;
    }
    const range = this.getRangeCodeInFile(originalCode);
    if (!range) {
      vscode.window.showWarningMessage("Code snippet not found in document.");
      return;
    }
    editor
      .edit((editBuilder) => {
        editBuilder.replace(range, optimizedCode);
      })
      .then((success) => {
        if (success) {
          vscode.window.showInformationMessage(
            "Optimization applied successfully!"
          );
        } else {
          vscode.window.showErrorMessage("Cannot apply optimization.");
          throw new Error("Cannot apply optimization.");
        }
      });
    this.clearHighlight();
  }
}
