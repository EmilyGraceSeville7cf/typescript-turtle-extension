import * as vscode from 'vscode';
import * as commands from './commands';
import * as variables from './variables';
import * as keywords from './keywords';
import * as words from './words';
import * as constants from './constants';
import * as userDefinedIdentifiers from './userDefinedIdentifiers';

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


interface PatternDiagnostic {
    readonly regex: RegExp;
    readonly description: string;
    readonly severity: vscode.DiagnosticSeverity;
}

function newPatternDiagnostic(regex: RegExp, description: string, severity: vscode.DiagnosticSeverity): PatternDiagnostic {
    return { regex, description, severity }
}

const allCommandNames = commands.list.map(command => command.name).concat(
    keywords.list.map(keyword => keyword.name)
)

const patternDiagnostics = [
    newPatternDiagnostic(/\(\s*\d+(\s+\d+)?\s*\)/, "Red, green, blue color components were expected, less were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*\d+(\s+\d+){3,}\s*\)/, "Just red, green, blue color components were expected, more were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\([^()a-zA-Z]*-\d+[^()a-zA-Z]*\)/, "Just positive color components expected, negative were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*\)/, "Valid command expected.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*define\s+turtle-(configuration|theme)\s+\(/, "It's recommended to escape the whole command list with a single quote.", vscode.DiagnosticSeverity.Information),
    newPatternDiagnostic(/\(\s+\S/, "It's recommended to remove spaces right after the opening parenthesis.", vscode.DiagnosticSeverity.Information),
    newPatternDiagnostic(/\S\s+\)/, "It's recommended to remove spaces right before the opening parenthesis.", vscode.DiagnosticSeverity.Information),
].concat(
    commands.list.filter(command => command.args !== undefined).map(command => {
        let regex = `\\(\\s*${command.name}((\\s+-?\\d+){0,${command.args!.length - 1}}|(\\s+-?\\d+){${command.args!.length + 1},})\\s*\\)`

        const diagnostic = newPatternDiagnostic(
            new RegExp(regex),
            `'${command.name}' expected exactly ${command.args?.length} arguments.`,
            vscode.DiagnosticSeverity.Error
        )
        return diagnostic
    }
    )
).concat(
    commands.list.filter(command => command.args !== undefined).map(command =>
        newPatternDiagnostic(
            new RegExp(`\\(\\s*${command.name}(\\s+-?\\d+)*(\\s+[a-zA-Z]+)(\\s+-?\\d+)*\\)`),
            `'${command.name}' expected integer arguments`,
            vscode.DiagnosticSeverity.Error
        )
    )
).concat([
    newPatternDiagnostic(new RegExp(`\\(\\s*(?!(${allCommandNames.join("|")})(\\s*\\)|\\s+[^()]*))[^()]*\\)`),
        "Unknown command.",
        vscode.DiagnosticSeverity.Error)
])

export function refreshDiagnostics(document: vscode.TextDocument, targetDiagnostics: vscode.DiagnosticCollection): void {
    if (document.languageId !== "scheme")
        return

    const diagnostics: vscode.Diagnostic[] = [];

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        tryCreateDiagnostic(line, lineIndex, diagnostics);
    }

    targetDiagnostics.set(document.uri, diagnostics);
}

function tryCreateDiagnostic(line: vscode.TextLine, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
    const patternDiagnostic = patternDiagnostics.find(patternDiagnostic => patternDiagnostic.regex.test(line.text))
    if (patternDiagnostic === undefined)
        return

    const index = line.text.search(patternDiagnostic.regex);
    const match = line.text.match(patternDiagnostic.regex)![0]
    const range = new vscode.Range(lineIndex, index, lineIndex, index + match.length);

    const diagnostic = new vscode.Diagnostic(range, patternDiagnostic.description,
        patternDiagnostic.severity);
    diagnostic.code = "turtle";
    diagnostics.push(diagnostic);
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
