import * as vscode from 'vscode';
import { registerFormattingCommands } from './commands/formatting';
import { registerClipboardCommands } from './commands/clipboard';
import { registerValidationCommands, validateCurrentEditor } from './validation/validator';
import { registerFormatterProvider } from './providers/formatter';
import { setupEventListeners } from './utils/helper';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    console.log('🎉 JSON Formatter Validator ACTIVATED');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('json-validator');
    context.subscriptions.push(diagnosticCollection);

    // Register all feature modules
    registerFormattingCommands(context);
    registerClipboardCommands(context, diagnosticCollection);
    registerValidationCommands(context, diagnosticCollection);
    registerFormatterProvider(context);

    // Setup event listeners (your existing validation)
    setupEventListeners(context, diagnosticCollection, validateCurrentEditor);

    // ✅ NEW: Auto-format on save event listener
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            const config = vscode.workspace.getConfiguration('json-formatter-validator');
            const formatOnSave = config.get<boolean>('formatOnSave', true);

            if (document.languageId === 'json' && formatOnSave) {
                console.log('💾 Auto-formatting JSON on save:', document.fileName);
                formatJsonForDocument(document);
            }
        })
    );

    // Status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBar.command = 'json-formatter-validator.validate';
    statusBar.text = '$(check) JSON';
    statusBar.show();
    context.subscriptions.push(statusBar);

    console.log('✅ Extension fully loaded - 7 commands + status bar + AUTO-FORMAT ON SAVE');
}

export function deactivate() {
    diagnosticCollection?.clear();
    console.log('Extension deactivated');
}

// ✅ Auto-format function (moved to top-level for easy access)
async function formatJsonForDocument(document: vscode.TextDocument) {
    const config = vscode.workspace.getConfiguration('json-formatter-validator');
    const indentSize = config.get<number>('indentSize', 2);

    const fullText = document.getText();

    try {
        // Validate first
        JSON.parse(fullText);
        const jsonObject = JSON.parse(fullText);
        const formatted = JSON.stringify(jsonObject, null, indentSize);

        // Replace entire document
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            document.lineAt(0).range.start,
            document.lineAt(document.lineCount - 1).range.end
        );
        edit.replace(document.uri, fullRange, formatted);

        await vscode.workspace.applyEdit(edit);
        console.log('Auto-formatted JSON:', document.fileName);
    } catch (error) {
        console.log('Auto-format failed - invalid JSON:', document.fileName);
        // Silent fail - don't interrupt user workflow
    }
}
