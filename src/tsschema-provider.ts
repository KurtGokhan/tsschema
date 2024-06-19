import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
  resolveModuleName,
  sys,
} from "typescript";
import * as TJS from "typescript-json-schema";
import * as vscode from "vscode";

export class TSSchemaProvider implements vscode.TextDocumentContentProvider {
	onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
	onDidChange = this.onDidChangeEmitter.event;
	watchedFiles: { [key: string]: vscode.Uri } = {};
	allUris: vscode.Uri[] = [];

	async provideTextDocumentContent(
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): Promise<string> {
		let fPath = uri.authority + uri.path;
		if (fPath === "/") fPath = "";

		const type = uri.fragment;

		const currentUri = vscode.window.activeTextEditor?.document.uri;

		const currentFile = currentUri?.fsPath;
		const currentFolder = currentFile && dirname(currentFile);

		const basePath =
			currentUri && vscode.workspace.getWorkspaceFolder(currentUri)?.uri.fsPath;
		const relativeTo = fPath.startsWith(".") ? currentFolder : basePath;
		const fullPath = !fPath
			? ""
			: resolve(...([relativeTo, fPath].filter(Boolean) as string[]));

		const relativePath = vscode.workspace.asRelativePath(fullPath);
		this.watchedFiles[relativePath] = uri;
		this.allUris.push(uri);

		const queryConfig = Object.fromEntries(
			uri.query
				.split("&")
				.map((ps) => ps.split("="))
				.filter((pair) => pair[0])
				.map((pair) =>
					pair.length === 1 ? [pair[0], true] : [pair[0], pair[1]],
				)
				.map((pair) =>
					pair.map((val) =>
						val === "false" ? false : val === "true" ? true : val,
					),
				),
		);

		let files = await vscode.workspace.findFiles(
			"tsconfig.json",
			"**/node_modules/**",
			1,
			token,
		);
		let tsconfig = files[0]?.fsPath;

		if (!tsconfig) {
			files = await vscode.workspace.findFiles(
				"tsconfig.*.json",
				"**/node_modules/**",
				1,
				token,
			);
			tsconfig = files[0]?.fsPath;
		}

		let resolvedFileName = fullPath;
		if (tsconfig && fPath && fullPath) {
			const tsconfigDir = dirname(tsconfig);
			const json = parseConfigFileTextToJson(
				tsconfig,
				readFileSync(tsconfig, "utf8"),
			);
			const parsed = parseJsonConfigFileContent(
				json.config,
				sys,
				tsconfigDir,
				{},
				tsconfig,
			);

			const t = resolve(relativeTo, "./index.ts");
			const res = resolveModuleName(fPath, t, parsed.options, sys);
			resolvedFileName = res.resolvedModule?.resolvedFileName || fullPath;
		}

		const schema = await this.generateSchema(
			type,
			resolvedFileName,
			basePath,
			queryConfig,
			tsconfig,
		);

		return JSON.stringify(schema, null, 2);
	}

	private async generateSchema(
		typeName: string,
		fileName: string,
		basePath: string | undefined,
		config: Record<string, unknown>,
		tsconfig: string,
	) {
		try {
			const resolvedConfig: TJS.PartialArgs = {
				ignoreErrors: true,
				...config,
			};

			let program: TJS.Program;
			if (!tsconfig)
				program = TJS.getProgramFromFiles([fileName], {}, basePath);
			else
				program = TJS.programFromConfig(tsconfig, fileName ? [fileName] : undefined);

			const generator = TJS.buildGenerator(
				program,
				resolvedConfig,
				fileName ? [fileName] : undefined,
			);
			const schema = generator?.getSchemaForSymbol(typeName);
			return schema;
		} catch (error) {
			vscode.window.showErrorMessage(
				`Couldn\'t generate schema because program has errors\n${String(error)}`,
			);
			return;
		}
	}

	refreshAllUris() {
		for (const uri of this.allUris) {
			this.onDidChangeEmitter.fire(uri);
		}
	}
}
