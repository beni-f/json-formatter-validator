import * as vscode from 'vscode';

export function registerFormatterProvider(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: 'json', scheme: 'file' },
      new JsonFormatterProvider()
    )
  );
}

class JsonFormatterProvider implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    textDocument: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const config = vscode.workspace.getConfiguration(
      'json-formatter-validator'
    );
    const text = textDocument.getText();
    const indentSize = config.get<number>('indentSize', 2);

    try {
      JSON.parse(text);
      const jsonObject = JSON.parse(text);
      const formatted = JSON.stringify(jsonObject, null, indentSize);

      const range = new vscode.Range(
        textDocument.positionAt(0),
        textDocument.lineAt(textDocument.lineCount - 1).range.end
      );
      return [vscode.TextEdit.replace(range, formatted)];
    } catch {
      return [];
    }
  }
}
