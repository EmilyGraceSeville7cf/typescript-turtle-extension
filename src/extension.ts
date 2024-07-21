import * as vscode from 'vscode';
import * as commands from './commands';
import * as variables from './variables';
import * as keywords from './keywords';
import * as words from './words';
import * as constants from './constants';
import * as userDefinedIdentifiers from './userDefinedIdentifiers';
import * as patternDiagnostics from './patternDiagnostics';

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider('scheme', {
        provideCompletionItems(document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {
            return commands.allCompletions
                .concat(variables.allCompletions)
                .concat(keywords.allCompletions)
                .concat(constants.allCompletions)
                .concat(words.createWordCompletionsFor(document))
                .concat(userDefinedIdentifiers.createUserDefinedIdentifierCompletionsFor(document))
        }
    });

    context.subscriptions.push(provider);

    const diagnostics = vscode.languages.createDiagnosticCollection("turtle");
    context.subscriptions.push(diagnostics);

    subscribeToDocumentChanges(context, diagnostics);
}

export function refreshDiagnostics(document: vscode.TextDocument, targetDiagnostics: vscode.DiagnosticCollection): void {
    if (document.languageId !== "scheme")
        return

    const diagnostics: vscode.Diagnostic[] = [];

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        patternDiagnostics.tryCreateDiagnosticFor(document, line, lineIndex, diagnostics);
    }

    targetDiagnostics.set(document.uri, diagnostics);
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, diagnostics: vscode.DiagnosticCollection): void {
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "scheme")
        refreshDiagnostics(vscode.window.activeTextEditor.document, diagnostics);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === "scheme")
                refreshDiagnostics(editor.document, diagnostics);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, diagnostics))
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri))
    );
}
