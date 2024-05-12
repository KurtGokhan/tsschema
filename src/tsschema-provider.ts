import { dirname, resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import * as vscode from 'vscode';


export class TSSchemaProvider implements vscode.TextDocumentContentProvider {
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;
  watchedFiles: { [key: string]: vscode.Uri } = {};
  allUris: vscode.Uri[] = [];

  async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
    let path = uri.authority + uri.path;
    if (path === '/') path = '';

    const type = uri.fragment;

    const currentUri = vscode.window.activeTextEditor?.document.uri;

    const currentFile = currentUri?.fsPath;
    const currentFolder = currentFile && dirname(currentFile);

    const basePath = currentUri && vscode.workspace.getWorkspaceFolder(currentUri)?.uri.fsPath;
    const relativeTo = path.startsWith('.') ? currentFolder : basePath;
    const fullPath = !path ? '' : resolve(...[relativeTo, path].filter(Boolean) as string[]);

    const relativePath = vscode.workspace.asRelativePath(fullPath);
    this.watchedFiles[relativePath] = uri;
    this.allUris.push(uri);

    const queryConfig = Object.fromEntries(
      uri.query.split('&')
        .map(ps => ps.split('='))
        .filter(pair => pair[0])
        .map(pair => pair.length === 1 ? [pair[0], true] : [pair[0], pair[1]])
        .map(pair => pair.map(val => val === 'false' ? false : val === 'true' ? true : val)));

    const schema = await this.generateSchema(type, fullPath, basePath, queryConfig, token);

    return JSON.stringify(schema, null, 2);
  }

  private async generateSchema(typeName: string, fileName: string, basePath: string | undefined, config: any, token: vscode.CancellationToken) {
    let files = await vscode.workspace.findFiles('tsconfig.json', '**/node_modules/**', 1, token);
    let tsconfig = files[0]?.fsPath;

    if (!tsconfig) {
      files = await vscode.workspace.findFiles('tsconfig.*.json', '**/node_modules/**', 1, token);
      tsconfig = files[0]?.fsPath;
    }

    try {
      const resolvedConfig: TJS.PartialArgs = {
        ignoreErrors: true,
        ...config,
      };

      let program: TJS.Program;
      if (!tsconfig) program = TJS.getProgramFromFiles([fileName], {}, basePath);
      else program = TJS.programFromConfig(tsconfig);

      const generator = TJS.buildGenerator(program, resolvedConfig);
      const schema = generator?.getSchemaForSymbol(typeName);
      return schema;
    } catch (error) {
      vscode.window.showErrorMessage('Couldn\'t generate schema because program has errors\n' + String(error));
      return;
    }
  }

  refreshAllUris() {
    this.allUris.forEach(uri => this.onDidChangeEmitter.fire(uri));
  }
};
