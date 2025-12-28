import * as vscode from 'vscode';
import { sortObjectKeys } from '../utils/helper';

export function registerFormattingCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('json-formatter-validator.format', formatJson),
        vscode.commands.registerCommand('json-formatter-validator.minify', minifyJson),
        vscode.commands.registerCommand('json-formatter-validator.sortKeys', sortKeysCommand)
    );
}

async function formatJson() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'json') {
        vscode.window.showWarningMessage('Open a JSON file first');
        return;
    }

    const config = vscode.workspace.getConfiguration('json-formatter-validator');
    const indentSize = config.get<number>('indentSize', 2);

    const { document, selection } = editor;
    const fullText = selection.isEmpty ? document.getText() : document.getText(selection);
    
    try {
        JSON.parse(fullText);
        const jsonObject = JSON.parse(fullText);
        const formatted = JSON.stringify(jsonObject, null, indentSize);
        
        await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            const range = selection.isEmpty 
                ? new vscode.Range(0, 0, document.lineCount, 0)
                : selection;
            editBuilder.replace(range, formatted);
        });
        
        vscode.window.showInformationMessage(`Formatted with ${indentSize} spaces`);
    } catch (error) {
        vscode.window.showErrorMessage(`Invalid JSON: ${(error as Error).message}`);
    }
}

async function minifyJson() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'json') return;

    const fullText = editor.document.getText();
    try {
        JSON.parse(fullText);
        const jsonObject = JSON.parse(fullText);
        const minified = JSON.stringify(jsonObject);
        
        await editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), minified);
        });
        vscode.window.showInformationMessage('JSON minified');
    } catch (error) {
        vscode.window.showErrorMessage('Invalid JSON');
    }
}

async function sortKeysCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'json') return;

    const fullText = editor.document.getText();
    try {
        const jsonObject = JSON.parse(fullText);
        const sorted = sortObjectKeys(jsonObject);
        const formatted = JSON.stringify(sorted, null, 2);
        
        await editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(0, 0, editor.document.lineCount, 0), formatted);
        });
        vscode.window.showInformationMessage('Keys sorted alphabetically');
    } catch (error) {
        vscode.window.showErrorMessage('Invalid JSON');
    }
}
