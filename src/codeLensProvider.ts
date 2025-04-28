import * as vscode from 'vscode';

export class OptimizeCodeLensProvider implements vscode.CodeLensProvider {
    private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
    private currentSelection: vscode.Range | null = null;
  
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this.onDidChangeCodeLensesEmitter.event;
  
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
      const codeLenses: vscode.CodeLens[] = [];
      if (this.currentSelection) {
        codeLenses.push(new vscode.CodeLens(this.currentSelection, {
          title: "$(zap) Optimize $(zap)",
          command: "extension.optimizeSelectedCode",
          arguments: [this.currentSelection]
        }));
      }
      return codeLenses;
    }
  
    refresh() {
      this.onDidChangeCodeLensesEmitter.fire();
    }
  
    updateSelection(range: vscode.Range | null) {
      this.currentSelection = range;
      this.refresh();
    }
  }
  