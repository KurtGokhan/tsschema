import { dirname, resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import * as vscode from 'vscode';


export function activate({ subscriptions }: vscode.ExtensionContext) {
  const customScheme = 'tsschema';

  const watchFiles: { [key: string]: vscode.Uri } = {};

  const onSave = (e: vscode.TextDocument) => {
    const relativePath = vscode.workspace.asRelativePath(e.uri);
    const uri = watchFiles[relativePath];
    if (uri) {
      tsschemaProvider.onDidChangeEmitter.fire(uri);
    }
  };

  const tsschemaProvider = new class implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
      const path = uri.authority + uri.path;
      const type = uri.fragment;

      const settings: TJS.PartialArgs = {
        required: true,
      };

      const compilerOptions: TJS.CompilerOptions = {
        strictNullChecks: true,
      };

      const currentUri = vscode.window.activeTextEditor?.document.uri;

      const currentFile = currentUri?.fsPath;
      const currentFolder = currentFile && dirname(currentFile);

      const basePath = currentUri && vscode.workspace.getWorkspaceFolder(currentUri)?.uri.fsPath;
      const relativeTo = path.startsWith('.') ? currentFolder : basePath;
      const fullPath = resolve(...[relativeTo, path].filter(Boolean) as string[]);

      const program = TJS.getProgramFromFiles([fullPath], compilerOptions, basePath);
      const generator = TJS.buildGenerator(program, settings);
      const schema = TJS.generateSchema(program, type, settings, [], generator!);

      const relativePath = vscode.workspace.asRelativePath(fullPath);
      watchFiles[relativePath] = uri;

      return JSON.stringify(schema);
    }
  };

  subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(customScheme, tsschemaProvider));
  subscriptions.push(vscode.workspace.onDidSaveTextDocument(onSave));
}

export function deactivate() { }
