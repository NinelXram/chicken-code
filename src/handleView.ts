export const getWebviewContent = () => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>I think your code need to update ^^</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
        ${getStyles()}
      </head>
      <body>
        <div class="main-container">
          <div class="content-container">
            ${getHtmlBody()}
          </div>

          <div class="footer-container">
            <div class="message-container">
              <div class="message-title">Chicken Code hello!</div>
            </div>

            <div class="button-container">
              <button id="clear-cache-button">Clear Cache</button>
              <button id="view-additional-rule-button">View Additional Rule</button>
              <button id="return-button">Return</button>
              <button id="optimize-button">Optimize</button>
            </div>
            <div class="button-container">
              <button id="reset-api-key">Reset Api Key</button>
              <label class="checkbox-label">
                <input type="checkbox" id="on-save-checkbox" />
                On Save
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="on-log-checkbox" />
                On Log
              </label>
            </div>
          </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
        ${getScript()}
      </body>
      </html>
    `;
};

export const getStyles = () => {
  return `
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        #clear-cache-button, #optimize-button, #view-additional-rule-button, #return-button, reset-api-key {
          margin: 4px;
          padding: 4px 8px;
          font-size: 14px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: black;
          color: white;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          margin-left: 8px;
          font-size: 14px;
          color: #ffffff;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 4px;
          width: 16px;
          height: 16px;
        }
        
        .header-container {
          display: flex;
          justify-content: flex-start;
        }

        #return-button {
          display: none;
        }

        .main-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .content-container {
          flex-grow: 1;
          padding: 16px;
        }

        .footer-container {
          display: flex;
          flex-direction: column;
          align-items: center; 
          padding: 16px 0;
        }

        .message-container {
          text-align: center;
          margin-bottom: 10px;
        }

        .message-title {
          font-size: 24px;
          font-weight: bold;
          color: #4caf50;
        }

        .message-subtitle {
          font-size: 16px;
          color: #cccccc;
        }

        .button-container button {
          margin: 4px;
          padding: 4px 8px;
          font-size: 14px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: black;
          color: white;
        }

        .button-container button + button {
          margin-left: 8px;
        }

        .button-container {
          display: flex;
          justify-content: between;
          button:hover {
            background-color: #444;
        }
        }

        #rules-list {
          list-style-type: none;
          padding: 0;
          li {
            margin: 4px 0;
            padding: 4px 8px;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        #rules-list li:hover {
          background-color: #e0e0e0;
          color: black;
          .delete-rule-button {
            visibility: visible;
          }
        }

        .delete-rule-button {
          background: red;
          border-radius: 4px;
          border: none;
          color: white;
          font-size: 15px;
          cursor: pointer;
          visibility: hidden;
        }

        .delete-rule-button:hover {
          background-color: #c9302c;
        }


        .loading-message {
          font-size: 18px;
          font-weight: bold;
          color: #ffffff;
          text-align: center;
        }

        #optimization-list {
          margin-top: 8px;
        }

        .optimization-container.expanded .arrow-icon {
          transform: rotate(90deg);
        }

        .original-code { 
          border: 1px solid #f8d7da;
        }
        .optimized-code { 
          border: 1px solid #d4edda;
        }

        .skip-button:hover {
          background-color: #c9302c;
        }

        .optimization-container {
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }
  
        .optimization-title {
          background-color: black;
          color: #ffffff;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
        }
  
        .optimization-title:hover {
          background-color: #3a3a3a;
        }
  
        .arrow-icon {
          transition: transform 0.3s;
        }
  
        .collapsed .arrow-icon {
          transform: rotate(-90deg);
        }
  
        .optimization-content {
          padding: 8px;
          display: none;
        }
  
        .expanded .optimization-content {
          display: block;
        }
  
        pre {
          background-color: #1e1e1e;
          padding: 4px;
          border-radius: 5px;
          overflow-x: auto;
        }
  
        .button-group {
          position: absolute;
          top: -10px;
          right: 10px;
          display: flex;
          gap: 10px;
        }

        .apply-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 2px 4px;
          cursor: pointer;
          border-radius: 5px;
        }

        .skip-button {
          background-color: #d9534f;
          color: white;
          border: none;
          padding: 2px 4px;
          cursor: pointer;
          border-radius: 5px;
        }

  
        .apply-button:hover {
          background-color: #45a049;
        }
  
        .message-container {
          text-align: center;
          margin-top: 16px;
        }
  
        .message-title {
          font-size: 24px;
          font-weight: bold;
          color: #4caf50;
        }
  
        .message-subtitle {
          font-size: 16px;
          color: #cccccc;
        }
      </style>
    `;
};

export const getHtmlBody = () => {
  return `
      <div id="title">Welcome</div>
      <div id="optimization-list" style="display: block;"></div>
      <div id="additional-rules" style="display: none;">
        <h1>Additional Skip Rules</h1>
        <ul id="rules-list"></ul>
      </div>
    `;
};

export const getScript = () => {
  return `
      <script>
        const vscode = acquireVsCodeApi();
  
        function escapeHTML(unsafe) {
          return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }

        document.getElementById('clear-cache-button').addEventListener('click', () => {
          vscode.postMessage({ command: 'clearCache' });
        });

        document.getElementById('reset-api-key').addEventListener('click', () => {
          vscode.postMessage({ command: 'resetApiKey' });
        });

        document.getElementById('view-additional-rule-button').addEventListener('click', () => {
          vscode.postMessage({ command: 'viewAdditionalRule' });
        });

        document.getElementById('return-button').addEventListener('click', () => {
          vscode.postMessage({ command: 'returnToOptimizations' });
        });

        document.getElementById('optimize-button').addEventListener('click', () => {
          vscode.postMessage({ command: 'optimizeCode' });
        });

        const onSaveCheckbox = document.getElementById('on-save-checkbox');
        onSaveCheckbox.addEventListener('change', (event) => {
          vscode.postMessage({
            command: 'toggleOnSave',
            enabled: event.target.checked
          });
        });

        const onLogCheckbox = document.getElementById('on-log-checkbox')
        onLogCheckbox.addEventListener('change', (event) => {
          vscode.postMessage({
            command: 'toggleOnLog',
            enabled: event.target.checked
          });
        });
  
        window.addEventListener('message', event => {
          const message = event.data;
          
          if (message.command === 'showCache') {
            const cacheContent = document.getElementById('cache-content');
            cacheContent.innerHTML = '<h3>Cache Content:</h3>';
            if (message.cache.length === 0) {
              cacheContent.innerHTML += '<p>Cache is empty.</p>';
            } else {
              cacheContent.innerHTML += '<ul>' + message.cache.map(hash => \`<li>\${hash}</li>\`).join('') + '</ul>';
            }
          }

          if (message.command === 'showLoading') {
            const optimizationList = document.getElementById('optimization-list');
            optimizationList.innerHTML = '<div class="loading-message">Loading, please wait...</div>';
          }

          if (message.command === 'removeOptimization') {
            const optimizationContainer = document.querySelector(\`[data-index="\${message.index}"]\`);
            if (optimizationContainer) {
              optimizationContainer.remove();
            }
          }

          if (message.command === 'viewAdditionalRule') {
            document.getElementById('optimization-list').style.display = 'none';
            document.getElementById('additional-rules').style.display = 'block';

            const rulesList = document.getElementById('rules-list');
            rulesList.innerHTML = '';

            document.getElementById('return-button').style.display = 'block';
            document.getElementById('view-additional-rule-button').style.display = 'none';

            message.rules.forEach((rule, index) => {
              const li = document.createElement('li');
              li.textContent = rule;

              const deleteButton = document.createElement('button');
              deleteButton.classList.add('delete-rule-button');
              deleteButton.textContent = 'Delete';
              deleteButton.addEventListener('click', () => {
                vscode.postMessage({ command: 'deleteAdditionalRule', rule, index });
              });

              li.appendChild(deleteButton);
              rulesList.appendChild(li);
            });
          }

          if (message.command === 'returnToOptimizations') {
            document.getElementById('optimization-list').style.display = 'block';
            document.getElementById('additional-rules').style.display = 'none';
            document.getElementById('return-button').style.display = 'none';
            document.getElementById('view-additional-rule-button').style.display = 'block';
          }

          if (message.command === 'removeOptimization') {
            const container = document.querySelector(\`[data-original-code="\${message.originalCode}"]\`);
            if (container) container.remove();
          }


          if (message.command === 'updateOptimizations') {
            onSaveCheckbox.checked = message.onSave;
            onLogCheckbox.checked = message.onLog;
            const optimizationList = document.getElementById('optimization-list');
            optimizationList.innerHTML = '';
            const title = document.getElementById('title');
            if (message.optimizations.length === 0) {
              title.textContent = 'No optimizations available';
              return;
            }

            title.textContent = 'I think your code need to update ^^';
  
            message.optimizations.forEach((optimization, index) => {
              const optimizationContainer = document.createElement('div');
              optimizationContainer.classList.add('optimization-container');
              optimizationContainer.setAttribute('data-index', index);
  
              const titleText = optimization.codeName ? optimization.codeName : \`Optimization \${index + 1}\`;
  
              optimizationContainer.innerHTML = getOptimizationContent(titleText, optimization, index);

              const title = optimizationContainer.querySelector('.optimization-title');
              title.addEventListener('click', () => {
                const isExpanded = optimizationContainer.classList.toggle('expanded');

                if (isExpanded) {
                  document.querySelectorAll('.optimization-container.expanded').forEach(container => {
                    if (container !== optimizationContainer) {
                      container.classList.remove('expanded');
                    }
                  });
                }

                vscode.postMessage({
                  command: isExpanded ? 'scrollToCode' : 'clearHighlight',
                  originalCode: optimization.codeOriginal
                });
              });
  
              const applyButton = optimizationContainer.querySelector('.apply-button');
              applyButton.addEventListener('click', () => {
                vscode.postMessage({
                  command: 'applyCode',
                  originalCode: optimization.codeOriginal,
                  optimizedCode: optimization.codeOptimized,
                  index: index 
                });
              });

              optimizationContainer.querySelector('.skip-button').addEventListener('click', () => {
                vscode.postMessage({
                  command: 'skipOption',
                  codeOriginal: optimization.codeOriginal,
                  index
                });
              });

              const skipRuleButton = optimizationContainer.querySelector('.skip-rule-button');
              skipRuleButton.addEventListener('click', () => {
                vscode.postMessage({ command: 'skipRule', rule: optimization.codeDescription, codeOriginal: optimization.codeOriginal });
              });
  
              optimizationList.appendChild(optimizationContainer);
            });
  
            document.querySelectorAll('pre code').forEach((block) => {
              hljs.highlightElement(block);
            });
          }
        });
  
        function getOptimizationContent(titleText, optimization, index) {
          const applyButton = optimization.canApply ? '<button class="apply-button">Apply Code</button>' : '<button class="apply-button" style="display: none;"></button>';
          return \`
            <div class="optimization-title">
              <span>\${titleText}</span>
              <span class="arrow-icon">▶</span>
            </div>
            <div class="optimization-content" data-original-code="\${escapeHTML(optimization.codeOriginal)}">
              <pre class="original-code"><code>\${escapeHTML(optimization.codeOriginal)}</code></pre>
              <div class="optimized-code-container" style="position: relative; margin-top: 10px;">
                <pre class="optimized-code"><code>\${escapeHTML(optimization.codeOptimized)}</code></pre>
                <div class="button-group">
                  \${applyButton}
                  <button class="skip-button">Skip</button>
                </div>
              </div>
              <div style="position: relative; margin-top: 10px;">
                <p>\${optimization.codeDescription}</p>
                <button class="skip-rule-button">Skip This Rule</button>
              </div>
            </div>
          \`;
        }

      </script>
    `;
};

export const getLogHtml = (prompt: string, title: string): string => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
  
          .container {
            padding: 16px;
          }
  
          .header {
            background-color: #333;
            color: white;
            padding: 16px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
  
          .log-content {
            background-color: #1e1e1e;
            color: #cfcfcf;
            padding: 16px;
            border-radius: 8px;
            overflow: auto;
            white-space: pre-wrap;
            max-height: 80vh;
          }
        </style>
      </head>
      <body>
        <div class="header">Prompt Log</div>
        <div class="container">
          <div class="log-content">${escapeHTML(prompt)}</div>
        </div>
      </body>
      </html>
    `;
};

export const getApiKeyInputHtml = (): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Key Required</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 16px;
        }
        .container {
          text-align: center;
        }
        .input-container {
          margin-top: 20px;
        }
        input {
          padding: 10px;
          width: 80%;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          color: #fff;
          background-color: #007acc;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        }
        button:hover {
          background-color: #005fa1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Key Required</h1>
        <p>Please enter your API Key to use the extension.</p>
        <p>You can create an API Key at <a href="https://aistudio.google.com/apikey" target="_blank">here</a>.</p>
        <div class="input-container">
          <input type="text" id="api-key-input" placeholder="Paste your API Key here..." />
        </div>
        <button id="submit-button">Save API Key</button>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('submit-button').addEventListener('click', () => {
          const apiKey = document.getElementById('api-key-input').value;
          vscode.postMessage({ command: 'submitApiKey', apiKey });
        });
      </script>
    </body>
    </html>
  `;
};

const escapeHTML = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
