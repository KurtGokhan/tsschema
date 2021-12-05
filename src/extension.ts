import * as vscode from 'vscode';
import { TSSchemaProvider } from './tsschema-provider';


export function activate({ subscriptions }: vscode.ExtensionContext) {
  const customScheme = 'tsschema';
  const provider = new TSSchemaProvider();

  const onSave = (e: vscode.TextDocument) => {
    const relativePath = vscode.workspace.asRelativePath(e.uri);
    const uri = provider.watchedFiles[relativePath];
    if (uri) {
      provider.onDidChangeEmitter.fire(uri);
    }
  };

  subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(customScheme, provider));
  subscriptions.push(vscode.workspace.onDidSaveTextDocument(onSave));
}

export function deactivate() { }
