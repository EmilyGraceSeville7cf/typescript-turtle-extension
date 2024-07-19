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

function createSnippet(command: Command, label: string, kind: vscode.CompletionItemKind): vscode.CompletionItem {
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

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider('scheme', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            const commandCompletions = commands.map(command =>
                createSnippet(command, command.name, vscode.CompletionItemKind.Function)
            )

            const snippetCompletions = commands
                .filter(command => command.shortcut !== undefined)
                .map(command => createSnippet(command, command.shortcut!, vscode.CompletionItemKind.Snippet))

            const constants = [45, 90, 135, 180]
            constants.forEach(constant => constants.push(-constant))

            const constantCompletions = constants.map(constant => {
                const completion = new vscode.CompletionItem(constant.toString(), vscode.CompletionItemKind.Constant);
                completion.insertText = new vscode.SnippetString(constant.toString());
                return completion
            })

            return commandCompletions.concat(snippetCompletions).concat(constantCompletions)
        }
    });

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('scheme', new FromMoveForwardToMoveBackward(), {
            providedCodeActionKinds: FromMoveForwardToMoveBackward.providedCodeActionKinds
        }),
        vscode.languages.registerCodeActionsProvider('scheme', new FromMoveBackwardToMoveForward(), {
            providedCodeActionKinds: FromMoveForwardToMoveBackward.providedCodeActionKinds
        })
    );

    context.subscriptions.push(provider);
}

export class FromMoveForwardToMoveBackward implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        if (!this.isReplaceableCommand(document, range))
            return;

        const fix = this.createFix(document, range);

        return [
            fix
        ];
    }

    private isReplaceableCommand(document: vscode.TextDocument, range: vscode.Range): boolean {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.startsWith("move-forward")
    }

    private createFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const command = commands.find(command => command.name === "move-forward")!
        const replacement = command.opposite!

        const fix = new vscode.CodeAction(`Replace with '${replacement}'`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, replacement.length! - 1)), replacement);
        return fix;
    }
}

export class FromMoveBackwardToMoveForward implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        if (!this.isReplaceableCommand(document, range))
            return;

        const fix = this.createFix(document, range);

        return [
            fix
        ];
    }

    private isReplaceableCommand(document: vscode.TextDocument, range: vscode.Range): boolean {
        const start = range.start;
        const line = document.lineAt(start.line);
        return line.text.startsWith("move-backward")
    }

    private createFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        const command = commands.find(command => command.name === "move-backward")!
        const replacement = command.opposite!

        const fix = new vscode.CodeAction(`Replace with '${replacement}'`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, replacement.length! - 1)), replacement);
        return fix;
    }
}
