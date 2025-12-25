import * as vscode from 'vscode';

export function registerClipboardCommands(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection) {
    context.subscriptions.push(
        vscode.commands.registerCommand('json-formatter-validator.copyFormatted', copyFormattedJson),
        vscode.commands.registerCommand('json-formatter-validator.clearErrors', () => clearErrors(diagnosticCollection)),
        vscode.commands.registerCommand('json-formatter-validator.toggleComments', toggleCommentsMode)
    );
}

function copyFormattedJson() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'json') return;

    try {
        const text = editor.document.getText();
        const jsonObject = JSON.parse(text);
        const formatted = JSON.stringify(jsonObject, null, 2);
        vscode.env.clipboard.writeText(formatted);
        vscode.window.showInformationMessage('Formatted JSON copied');
    } catch {
        vscode.window.showErrorMessage('Invalid JSON - cannot copy');
    }
}

function clearErrors(diagnosticCollection: vscode.DiagnosticCollection) {
    diagnosticCollection.clear();
    vscode.window.showInformationMessage('🧹 Errors cleared');
}

async function toggleCommentsMode() {
    const config = vscode.workspace.getConfiguration('json-formatter-validator');
    const allowComments = config.get<boolean>('allowComments', true);
    await config.update('allowComments', !allowComments, vscode.ConfigurationTarget.Workspace);
    vscode.window.showInformationMessage(`Comments ${allowComments ? 'DISABLED' : 'ENABLED'}`);
}
