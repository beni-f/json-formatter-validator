import * as vscode from 'vscode';
import { JsonCompilerPipeline } from '../compiler/pipeline';
import { CompilerPanel } from '../ui/compiler-panel';

export function registerCompileCommand(context: vscode.ExtensionContext) {
    const pipeline = new JsonCompilerPipeline();

    context.subscriptions.push(
        vscode.commands.registerCommand('json-formatter-validator.compileJson', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'json') {
                vscode.window.showErrorMessage('Open a JSON file first');
                return;
            }

            try {
                const jsonObj = JSON.parse(editor.document.getText());
                const result = pipeline.compile(jsonObj);
                CompilerPanel.create(result);
                vscode.window.showInformationMessage(`✅ Compiled in ${result.metadata.duration}`);
            } catch (e) {
                vscode.window.showErrorMessage('Invalid JSON');
            }
        })
    );
}
