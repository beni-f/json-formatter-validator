import * as vscode from 'vscode';
import { FullCompilerOutput } from '../compiler/pipeline';

export class CompilerPanel {
    static create(result: FullCompilerOutput) {
        const panel = vscode.window.createWebviewPanel(
            'jsonCompiler',
            'JSON Compiler Output',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        panel.webview.html = `
<!DOCTYPE html>
<html>
<body style="font-family: var(--vscode-font-family); padding: 20px;">
  <h1>🧠 JSON Compiler Pipeline</h1>
  
  <div style="background: var(--vscode-panel-background); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <strong>⏱️ ${result.metadata.duration}</strong> | 
    📊 Complexity: ${result.metadata.complexity} | 
    📦 Size: ${result.metadata.inputSize} chars
  </div>

  <h3>📦 TypeScript Interface</h3>
  <pre>${result.code.typescript}</pre>
  <button onclick="copy('ts')" style="margin-bottom: 20px;">Copy TypeScript</button>

  <h3>🐹 Go Structs</h3>
  <pre>${result.code.go}</pre>
  <button onclick="copy('go')">Copy Go</button>

  <h3>🦀 Rust Structs</h3>
  <pre>${result.code.rust}</pre>
  <button onclick="copy('rust')">Copy Rust</button>

  <script>
    function copy(lang) {
      const pre = event.target.previousElementSibling;
      navigator.clipboard.writeText(pre.textContent);
      vscode.postMessage({ command: 'copied', type: lang });
    }
  </script>
</body>
</html>`;
    }
}
