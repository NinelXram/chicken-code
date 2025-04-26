import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const CONFIG_FILES = [
  // ESLint config files
  ".eslintrc",
  ".eslintrc.json",
  ".eslintrc.js",
  ".eslintrc.cjs",
  // Prettier config files
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.js",
  ".prettierrc.cjs",
  // TSConfig file
  "tsconfig.json",
  // EditorConfig file
  ".editorconfig",
  // Best Practices
  "best-practices.md",
];

const getCurrentFilePath = (): string | undefined => {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return undefined;
  }
  return activeEditor.document.fileName;
};

const findConfigFileForCurrentFile = (
  fileName: string
): Record<string, string | undefined> => {
  let currentDir = path.dirname(fileName);
  const appliedConfigs: Record<string, string | undefined> = {};

  while (currentDir) {
    for (const configFile of CONFIG_FILES) {
      const configPath = path.join(currentDir, configFile);
      if (fs.existsSync(configPath)) {
        if (!appliedConfigs[configFile]) {
          appliedConfigs[configFile] = configPath;
        }
      }
    }

    const parentDir = path.dirname(currentDir);
    if (currentDir === parentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return appliedConfigs;
};

const readConfigFileContent = async (
  filePath: string
): Promise<string | null> => {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    return null;
  }
};

export const checkAppliedConfigFiles = async () => {
  const currentFile = getCurrentFilePath();
  if (!currentFile) {
    vscode.window.showInformationMessage("⚠️ No file is currently open.");
    return;
  }

  const appliedConfigs = findConfigFileForCurrentFile(currentFile);
  if (Object.keys(appliedConfigs).length === 0) {
    vscode.window.showInformationMessage("❌ No config file found.");
    return;
  }

  const bestPractices = appliedConfigs["best-practices.md"]
    ? await readConfigFileContent(appliedConfigs["best-practices.md"])
    : null;

  const eslintConfig = appliedConfigs[".eslintrc"]
    ? await readConfigFileContent(appliedConfigs[".eslintrc"])
    : null;

  const prettierConfig = appliedConfigs[".prettierrc"]
    ? await readConfigFileContent(appliedConfigs[".prettierrc"])
    : null;

  const tsConfig = appliedConfigs["tsconfig.json"]
    ? await readConfigFileContent(appliedConfigs["tsconfig.json"])
    : null;

  const editorConfig = appliedConfigs[".editorconfig"]
    ? await readConfigFileContent(appliedConfigs[".editorconfig"])
    : null;

  const contextParts: string[] = [];

  if (bestPractices) {
    contextParts.push(`
**Best Practices** You must follow the best practices mentioned in the following file:

\`\`\`md
${bestPractices}
\`\`\`
`);
  }

  if (eslintConfig) {
    contextParts.push(`
**ESLint Config**:
\`\`\`
${eslintConfig}
\`\`\`
    `);
  }

  if (prettierConfig) {
    contextParts.push(`
**Prettier Config**:
\`\`\`
${prettierConfig}
\`\`\`
    `);
  }

  if (tsConfig) {
    contextParts.push(`
**TSConfig**:
\`\`\`
${tsConfig}
\`\`\`
    `);
  }

  if (editorConfig) {
    contextParts.push(`
**EditorConfig**:
\`\`\`
${editorConfig}
\`\`\`
    `);
  }

  const additionalContext = `
### **Configuration Guidelines**

The following configurations must be respected when optimizing the code:

${contextParts.join("\n\n")}

----------

  `;

  if (contextParts.length > 0) {
    vscode.window.showInformationMessage(
      "✅ Have got the information of config files."
    );
  } else {
    vscode.window.showInformationMessage("❌ No config file found.");
  }

  return additionalContext;
};
