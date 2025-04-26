import * as vscode from "vscode";
import { OptimizationResultsProvider } from "./optimizationResultsProvider";
import { OptimizeCodeLensProvider } from "./optimizationResultsProvider";
import { checkApiKey, clearApiKey } from "./checkApiKey";
import { ON_SAVE_KEY } from "./constants";

export async function activate(context: vscode.ExtensionContext) {
  let debounceTimer: NodeJS.Timeout | undefined;
  const apiKey = await checkApiKey(context);
  const optimizationProvider = new OptimizationResultsProvider(context, apiKey);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "chickenCodeOptimizationResultsView",
      optimizationProvider
    )
  );
  if (!apiKey) {
    return;
  }

  let saveTimeout: NodeJS.Timeout;
  const debounceTime = 1500;

  let disposable = vscode.workspace.onDidSaveTextDocument(async () => {
    const onSave = context.globalState.get<boolean>(ON_SAVE_KEY);
    if (!onSave) {
      return;
    }
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      optimizationProvider.startOptimization();
    }, debounceTime);
  });

  const optimizeCodeLensProvider = new OptimizeCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      {
        scheme: "file",
      },
      optimizeCodeLensProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.optimizeSelectedCode",
      async (range: vscode.Range) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        const selectedText = editor.document.getText(range);
        if (selectedText) {
          await optimizationProvider.startOptimization(selectedText);
        }
      }
    )
  );

  const selectionChangedDisposable =
    vscode.window.onDidChangeTextEditorSelection(
      (event: vscode.TextEditorSelectionChangeEvent) => {
        // Hủy timer cũ
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        // Đặt lại timer mới
        debounceTimer = setTimeout(() => {
          // Đến đây coi như user đã "dừng" thao tác bôi đen
          const editor = event.textEditor;
          if (!editor) {
            return;
          }
          const selections = event.selections;

          // Vùng chọn đầu tiên
          if (selections.length > 0) {
            const range = selections[0];
            const selectedText = editor.document.getText(range);
            if (selectedText) {
              optimizeCodeLensProvider.updateSelection(range);
            } else {
              optimizeCodeLensProvider.updateSelection(null);
            }
          }
        }, 300); // Tạo deboune 300ms để chờ user dừng thao tác thay vì mỗi lần thay đổi selection
      }
    );

  context.subscriptions.push(selectionChangedDisposable);
  context.subscriptions.push(disposable);
}
