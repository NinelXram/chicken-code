import * as vscode from "vscode";
import { testFetchWithApiKey } from "./service";
import { API_KEY_STORAGE_KEY } from "./constants";

export const checkApiKey = async (
  context: vscode.ExtensionContext
): Promise<string | undefined> => {
  let apiKey = context.globalState.get<string>(API_KEY_STORAGE_KEY);

  if (!apiKey) {
    const userResponse = await vscode.window.showInformationMessage(
      "Are you sure you want to delete the API Key?, You can create a new API Key at: https://aistudio.google.com/apikey",
      "Input API Key",
      "Cancel"
    );

    if (userResponse === "Input API Key") {
      apiKey = await promptForApiKey(context);
    }
  }
  return apiKey;
};

const promptForApiKey = async (
  context: vscode.ExtensionContext
): Promise<string> => {
  let apiKey = await vscode.window.showInputBox({
    prompt: "Input your API Key",
    placeHolder: "Paste your API Key here...",
    ignoreFocusOut: true,
    password: true,
  });

  if (!apiKey) {
    return "";
  }

  await testFetchWithApiKey(apiKey)
    .then(async () => {
      await context.globalState.update(API_KEY_STORAGE_KEY, apiKey);
      vscode.window.showInformationMessage(
        "API Key has been saved successfully."
      );
    })
    .catch((error) => {
      vscode.window.showErrorMessage("API Key is invalid. Please try again.");
      apiKey = "";
    });
  return apiKey;
};
export const clearApiKey = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  await context.globalState.update(API_KEY_STORAGE_KEY, undefined);
  vscode.window.showInformationMessage(
    "API Key has been deleted successfully."
  );
};
