import * as vscode from 'vscode';
import { parseJsonError } from '../utils/helpers';

export function registerValidationCommands(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection) {
    context.subscriptions.push(
        vscode.commands.registerCommand('json-formatter-validator.validate', () => validateJson(diagnosticCollection))
    );
}

export function validateJson(diagnosticCollection: vscode.DiagnosticCollection) {
    validateCurrentEditor(diagnosticCollection, true);
}

export function validateCurrentEditor(diagnosticCollection: vscode.DiagnosticCollection, forceFeedback = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'json') return;

    diagnosticCollection.clear();
    const document = editor.document;
    const text = document.getText().trim();

    try {
        JSON.parse(text);
        diagnosticCollection.set(document.uri, []);
        if (forceFeedback) {
            vscode.window.showInformationMessage('JSON is VALID');
        }
    } catch (error) {
        const diagnostics = parseJsonError(error as Error, document);
        diagnosticCollection.set(document.uri, diagnostics);
        if (forceFeedback) {
            vscode.window.showErrorMessage(`${(error as Error).message}`);
        }
    }
}
