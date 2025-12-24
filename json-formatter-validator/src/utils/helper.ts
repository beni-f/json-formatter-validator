import * as vscode from 'vscode';
import { validateCurrentEditor } from '../validation/validator';

export function setupEventListeners(
    context: vscode.ExtensionContext, 
    diagnosticCollection: vscode.DiagnosticCollection, 
    validateFn: typeof validateCurrentEditor
) {
    const debouncedValidate = debounce((event: vscode.TextDocumentChangeEvent) => {
        if (event.document.languageId === 'json') {
            validateFn(diagnosticCollection);
        }
    }, 300);

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(debouncedValidate),
        vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
            if (doc.languageId === 'json') {
                console.log('💾 Auto-validating on save:', doc.fileName);
                validateFn(diagnosticCollection, true);
            }
        })
    );
}

export function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
    });
    return sorted;
}

export function parseJsonError(error: Error, document: vscode.TextDocument): vscode.Diagnostic[] {
    const message = error.message;
    
    const lineMatch = message.match(/line (\d+) column (\d+)/);
    if (lineMatch) {
        const line = parseInt(lineMatch[1]) - 1;
        const col = parseInt(lineMatch[2]) - 1;
        const range = new vscode.Range(line, col, line, col + 20);
        return [new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)];
    }
    
    return [new vscode.Diagnostic(
        new vscode.Range(0, 0, document.lineCount, 0), 
        message, 
        vscode.DiagnosticSeverity.Error
    )];
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
