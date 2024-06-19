import { extname } from 'node:path';
import * as vscode from 'vscode';
import { TSSchemaProvider } from './tsschema-provider';


export async function activate({ subscriptions }: vscode.ExtensionContext) {
  const customScheme = 'tsschema';
  const provider = new TSSchemaProvider();

  const extensions = ['.ts', '.tsx', '.mts', '.mtsx', '.cts', '.ctsx', '.ets', '.etsx'];

  const onSave = (e: vscode.TextDocument) => {
    const relativePath = vscode.workspace.asRelativePath(e.uri);
    const uri = provider.watchedFiles[relativePath];
    if (uri) {
      provider.onDidChangeEmitter.fire(uri);
    }

    const isTsConfig = e.uri.path.match(/tsconfig\.(\w+\.)?json$/);

    if (isTsConfig || extensions.includes(extname(e.uri.path))) {
      provider.refreshAllUris();
    }
  };

  subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(customScheme, provider));
  subscriptions.push(vscode.workspace.onDidSaveTextDocument(onSave));
}

export function deactivate() { }
