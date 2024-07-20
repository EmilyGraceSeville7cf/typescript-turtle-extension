import * as vscode from 'vscode';

interface Command {
    readonly name: string,
    readonly description: string,
    readonly args?: string[],
    readonly shortcut?: string,
    readonly opposite?: string
}

function newCommand(name: string, description: string, args: string[] = []): Command {
    return { name, description, args }
}

function newCommandSnippet(command: Command, label: string, kind: vscode.CompletionItemKind): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(label, kind);
    completion.insertText = new vscode.SnippetString("(" + command.name);

    if (command.args !== undefined) {
        let index = 1;

        for (const arg of command.args) {
            completion.insertText.appendText(" ")
            completion.insertText.appendPlaceholder(arg, index++)
        }
    }

    completion.insertText.appendText(")")

    const docs: any = new vscode.MarkdownString(command.description);
    completion.documentation = docs;
    docs.baseUri = vscode.Uri.parse('https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle');
    return completion
}

function newVariableSnippet(variable: string, description: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
    completion.insertText = new vscode.SnippetString(`(define ${variable} '(\${1:commands}))`);
    const docs: any = new vscode.MarkdownString(description);
    completion.documentation = docs;
    docs.baseUri = vscode.Uri.parse('https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle');
    return completion
}

function newKeywordSnippet(keyword: string, body: string, description: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
    completion.insertText = new vscode.SnippetString(`(${keyword} ${body})`);
    const docs: any = new vscode.MarkdownString(description);
    completion.documentation = docs;
    docs.baseUri = vscode.Uri.parse('https://conservatory.scheme.org/schemers/Documents/Standards/R5RS/HTML/');
    return completion
}

function newWordSnippet(word: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(word, vscode.CompletionItemKind.Text);
    completion.insertText = new vscode.SnippetString(word);
    return completion
}

const commands = [
    newCommand("move-on", "Move the turtle **on** a specific vector", ["x", "y"]),
    newCommand("move-to", "Move the turtle **to** a specific point", ["x", "y"]),
    { name: "move-forward", description: "Move the turtle **forward** for a specific amount of units", args: ["units"], shortcut: "f", opposite: "move-backward" },
    { name: "move-backward", description: "Move the turtle **backward** for a specific amount of units", args: ["units"], shortcut: "b", opposite: "move-forward" },
    newCommand("move-to-center", "Move the turtle to the **center**"),
    newCommand("move-to-top-left", "Move the turtle to the **top left corner**"),
    newCommand("move-to-top-middle", "Move the turtle to the **top middle side**"),
    newCommand("move-to-top-right", "Move the turtle to the **top right corner**"),
    newCommand("move-to-middle-right", "Move the turtle to the **middle right side**"),
    newCommand("move-to-bottom-right", "Move the turtle to the **bottom right corner**"),
    newCommand("move-to-bottom-middle", "Move the turtle to the **bottom middle side**"),
    newCommand("move-to-bottom-left", "Move the turtle to the **bottom left corner**"),
    newCommand("move-to-middle-left", "Move the turtle to the **middle left side**"),
    { name: "turn-left", description: "Rotate the turtle **left** at a specific amount of degrees", args: ["angle"], shortcut: "l", opposite: "turn-right" },
    { name: "turn-right", description: "Rotate the turtle **right** at a specific amount of degrees", args: ["angle"], shortcut: "r", opposite: "turn-left" },
    newCommand("up", "Make turtle **not draw** on movements"),
    newCommand("down", "Make turtle **draw** on movements"),
    newCommand("black", "Change the turtle drawing color to **black**"),
    newCommand("red", "Change the turtle drawing color to **red**"),
    newCommand("green", "Change the turtle drawing color to **green**"),
    newCommand("yellow", "Change the turtle drawing color to **yellow**"),
    newCommand("blue", "Change the turtle drawing color to **blue**"),
    newCommand("magenta", "Change the turtle drawing color to **magenta**"),
    newCommand("cyan", "Change the turtle drawing color to **cyan**"),
    newCommand("gray", "Change the turtle drawing color to **gray**"),
    newCommand("random-color", "Change the turtle drawing color to a **random one**"),
    newCommand("rgb", "Change the turtle drawing color to a **specific one**", ["red", "green", "blue"]),
    newCommand("rgb-random-color", "Change the turtle drawing color to a **random one**"),
]


interface UserDefinedIdentifier {
    readonly regex: RegExp;
    readonly description: string;
    readonly kind: vscode.CompletionItemKind;
}

function newUserDefinedIdentifier(regex: RegExp, description: string, kind: vscode.CompletionItemKind): UserDefinedIdentifier {
    return { regex, description, kind }
}

function newUserDefinedIdentifierSnippet(identifier: string, specification: UserDefinedIdentifier): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(identifier, specification.kind);
    completion.insertText = new vscode.SnippetString(identifier);
    const docs: any = new vscode.MarkdownString(specification.description);
    completion.documentation = docs;
    docs.baseUri = vscode.Uri.parse('https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle');
    return completion
}

const userDefinedIdentifiers = [
    newUserDefinedIdentifier(/\(\s*define (?<identifier>[a-zA-Z][a-zA-Z0-9\-]+)/, "A possible user defined **variable**", vscode.CompletionItemKind.Variable),
    newUserDefinedIdentifier(/\(\s*define \((?<identifier>[a-zA-Z][a-zA-Z0-9\-]+)/, "A possible user defined **function**", vscode.CompletionItemKind.Function),
    newUserDefinedIdentifier(/(\(\s*\d+\s+\d+\s+\d+\s*\))/, "A possible user defined **color**", vscode.CompletionItemKind.Color),
    newUserDefinedIdentifier(/\((?:move-on|move-to)\s+(-?\d+\s+-?\d+)\)/, "A possible user defined **vector**", vscode.CompletionItemKind.Constant),
]


export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider('scheme', {
        provideCompletionItems(document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext) {
            const commandCompletions = commands.map(command =>
                newCommandSnippet(command, command.name, vscode.CompletionItemKind.Function)
            )

            const snippetCompletions = commands
                .filter(command => command.shortcut !== undefined)
                .map(command => newCommandSnippet(command, command.shortcut!, vscode.CompletionItemKind.Snippet))

            const constants = [45, 90, 135, 180]
            constants.forEach(constant => constants.push(-constant))

            const constantCompletions = constants.map(constant => {
                const completion = new vscode.CompletionItem(constant.toString(), vscode.CompletionItemKind.Constant);
                completion.insertText = new vscode.SnippetString(constant.toString());
                return completion
            })

            const configurationVariable = new vscode.CompletionItem("turtle-configuration", vscode.CompletionItemKind.Variable);
            configurationVariable.insertText = new vscode.SnippetString("(define turtle-configuration '(${1:commands}))");
            const configurationVariableDocs: any = new vscode.MarkdownString("**Commands** for the turtle");
            configurationVariable.documentation = configurationVariableDocs;
            configurationVariableDocs.baseUri = vscode.Uri.parse('https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle');

            const variableCompletions = [
                newVariableSnippet("turtle-configuration", "**Commands** for the turtle"),
                newVariableSnippet("turtle-theme", "**Theme** for the turtle")
            ]

            const keywordCompletions = [
                newKeywordSnippet("if", "${1:condition} ${2:then} ${3:else}", "Check whether a condition is true and do something in regard"),
                newKeywordSnippet("define", "${1:variable} ${2:value}", "**Define** a variable with a specific value"),
                newKeywordSnippet("set!", "${1:variable} ${2:value}", "**Set** a specific value to a variable"),
                newKeywordSnippet("let*", "((${1:variable} ${2:value})) ${3:commands}", "**Define** variables with specific values")
            ]

            const userDefinedIdentifierCompletions = [...new Set(document.getText().split("\n"))]
                .map(line => {
                    const identifier = userDefinedIdentifiers.find(identifier => identifier.regex.test(line))
                    if (identifier === undefined)
                        return null

                    return newUserDefinedIdentifierSnippet(line.match(identifier.regex)![1], identifier)
                }).filter(completion => completion !== null).filter(completion =>
                    keywordCompletions.map(snippet => snippet.label).indexOf(completion.label) === -1 &&
                    variableCompletions.map(snippet => snippet.label).indexOf(completion.label) === -1
                )

            const wordCompletions = [...new Set(document.getText().split(/\W/))].filter(word =>
                keywordCompletions.map(snippet => snippet.label).indexOf(word) === -1
            ).map(word => newWordSnippet(word))

            return commandCompletions.concat(snippetCompletions)
                .concat(constantCompletions)
                .concat(variableCompletions)
                .concat(keywordCompletions)
                .concat(userDefinedIdentifierCompletions)
                .concat(wordCompletions)
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

const patternDiagnostics = [
    newPatternDiagnostic(/\(\s*\d+(\s+\d+)?\s*\)/, "Red, green, blue color components were expected, less were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*\d+(\s+\d+){3,}\s*\)/, "Just red, green, blue color components were expected, more were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\([^()a-zA-Z]*-\d+[^()a-zA-Z]*\)/, "Just positive color components expected, negative were found.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*\)/, "Valid command expected.", vscode.DiagnosticSeverity.Warning),
    newPatternDiagnostic(/\(\s*define\s+turtle-(configuration|theme)\s+\(/, "It's recommended to escape the whole command list with a single quote.", vscode.DiagnosticSeverity.Information),
    newPatternDiagnostic(/\(\s+\S/, "It's recommended to remove spaces right after the opening parenthesis.", vscode.DiagnosticSeverity.Information),
    newPatternDiagnostic(/\S\s+\)/, "It's recommended to remove spaces right before the opening parenthesis.", vscode.DiagnosticSeverity.Information),
].concat(
    commands.filter(command => command.args !== undefined).map(command => {
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
    commands.filter(command => command.args !== undefined).map(command =>
        newPatternDiagnostic(
            new RegExp(`\\(\\s*${command.name}(\\s+-?\\d+)*(\\s+[a-zA-Z]+)(\\s+-?\\d+)*\\)`),
            `'${command.name}' expected integer arguments`,
            vscode.DiagnosticSeverity.Error
        )
    )
).concat([
    newPatternDiagnostic(new RegExp(`\\(\\s*(?!(${commands.map(command => command.name).join("|")})(\\s*\\)|\\s+[^()]*))[^()]*\\)`),
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
