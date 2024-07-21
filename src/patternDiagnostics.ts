import * as vscode from 'vscode';
import * as builtinIdentifiers from './builtinIdentifiers';
import * as commands from './commands'
import * as keywords from './keywords';
import * as userDefinedIdentifiers from './userDefinedIdentifiers';
import * as variables from './keywords';

export interface PatternDiagnostic {
    readonly regex: RegExp;
    readonly description: string;
    readonly severity: vscode.DiagnosticSeverity;
}

function __create(regex: RegExp, description: string, severity: vscode.DiagnosticSeverity): PatternDiagnostic {
    return { regex, description, severity }
}

const __stylePatternDiagnostics = [
    __create(/\(\s*define\s+turtle-(configuration|theme)\s+\(/, "It's recommended to escape the whole command list with a single quote.", vscode.DiagnosticSeverity.Information),
    __create(/\(\s+\S/, "It's recommended to remove spaces right after the opening parenthesis.", vscode.DiagnosticSeverity.Information),
    __create(/\S\s+\)/, "It's recommended to remove spaces right before the opening parenthesis.", vscode.DiagnosticSeverity.Information),
]

const __contextUnawarePatternDiagnostics = [
    __create(/\(\s*\d+(\s+\d+)?\s*\)/, "Red, green, blue color components were expected, less were found.", vscode.DiagnosticSeverity.Warning),
    __create(/\(\s*\d+(\s+\d+){3,}\s*\)/, "Just red, green, blue color components were expected, more were found.", vscode.DiagnosticSeverity.Warning),
    __create(/\([^()a-zA-Z]*-\d+[^()a-zA-Z]*\)/, "Just positive color components expected, negative were found.", vscode.DiagnosticSeverity.Warning),
    __create(/\(\s*\)/, "Valid command expected.", vscode.DiagnosticSeverity.Warning),
    __create(/list\s*<\s*[^ ()]*\s*>/, "T[] syntax is expected instead of list<T>.", vscode.DiagnosticSeverity.Warning),
]

const __argumentCountPatternDiagnostics = commands.list
    .filter(command => command.args !== undefined)
    .map(command => {
        let regex = `\\(\\s*${command.name}((\\s+-?\\d+){0,${command.args!.length - 1}}|(\\s+-?\\d+){${command.args!.length + 1},})\\s*\\)`

        const diagnostic = __create(
            new RegExp(regex),
            `'${command.name}' expected exactly ${command.args?.length} arguments.`,
            vscode.DiagnosticSeverity.Error
        )
        return diagnostic
    })

const __argumentTypePatternDiagnostics = commands.list
    .filter(command => command.args !== undefined)
    .map(command =>
        __create(
            new RegExp(`\\(\\s*${command.name}(\\s+-?\\d+)*(\\s+[a-zA-Z]+)(\\s+-?\\d+)*\\)`),
            `'${command.name}' expected integer arguments`,
            vscode.DiagnosticSeverity.Error
        )
    )

export function tryCreateDiagnosticFor(document: vscode.TextDocument, line: vscode.TextLine, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
    const alternatives = builtinIdentifiers.list.concat(
        commands.list.map(command => command.name)
    ).concat(
        keywords.list.map(keyword => keyword.name)
    ).concat(
        userDefinedIdentifiers.createUserDefinedIdentifierCompletionsFor(document)
            .filter(userDefinedIdentifier =>
                [
                    vscode.CompletionItemKind.Variable,
                    vscode.CompletionItemKind.Function
                ].indexOf(userDefinedIdentifier.kind!) !== -1).map(userDefinedIdentifier => userDefinedIdentifier.label as string)
    ).concat(
        variables.list.map(variable => variable.name)
    ).join("|")

    const allPatternDiagnostics = __stylePatternDiagnostics
        .concat(__contextUnawarePatternDiagnostics)
        .concat(__argumentCountPatternDiagnostics)
        .concat(__argumentTypePatternDiagnostics)
        .concat(__argumentTypePatternDiagnostics)

    const patternDiagnostic = allPatternDiagnostics.concat(
        __create(new RegExp(`\\(\\s*(?!(${alternatives})(\\s*\\)|\\s+[^()]*))[^()]*\\)`),
            "Unknown command or identifier, possibly unknown built-in or defined externally.",
            vscode.DiagnosticSeverity.Warning)
    ).find(patternDiagnostic => patternDiagnostic.regex.test(line.text))

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
