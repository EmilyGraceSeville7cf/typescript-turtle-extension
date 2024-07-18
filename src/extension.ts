import * as vscode from 'vscode';

interface CommandData {
    name: string,
    description: string,
    args?: string[],
    shortcut?: string,
    opposite?: string
}

function createSnippet(command: CommandData, label: string, kind: vscode.CompletionItemKind): vscode.CompletionItem {
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

const commands: CommandData[] = [
    { name: "move-on", description: "Move the turtle on a specific vector", args: ["x", "y"] },
    { name: "move-to", description: "Move the turtle to a specific point", args: ["x", "y"] },
    { name: "move-forward", description: "Move the turtle forward for a specific amount of units", args: ["units"], shortcut: "f", opposite: "move-backward" },
    { name: "move-backward", description: "Move the turtle backward for a specific amount of units", args: ["units"], shortcut: "b", opposite: "move-forward" },
    { name: "move-to-center", description: "Move the turtle to the center" },
    { name: "move-to-top-left", description: "Move the turtle to the top left corner" },
    { name: "move-to-top-middle", description: "Move the turtle to the top middle side" },
    { name: "move-to-top-right", description: "Move the turtle to the top right corner" },
    { name: "move-to-middle-right", description: "Move the turtle to the middle right side" },
    { name: "move-to-bottom-right", description: "Move the turtle to the bottom right corner" },
    { name: "move-to-bottom-middle", description: "Move the turtle to the bottom middle side" },
    { name: "move-to-bottom-left", description: "Move the turtle to the bottom left corner" },
    { name: "move-to-middle-left", description: "Move the turtle to the middle left side" },
    { name: "turn-left", description: "Rotate the turtle left at a specific amount of degrees", args: ["angle"], shortcut: "l", opposite: "turn-right" },
    { name: "turn-right", description: "Rotate the turtle right at a specific amount of degrees", args: ["angle"], shortcut: "r", opposite: "turn-left" },
    { name: "up", description: "Make turtle not draw on movements" },
    { name: "down", description: "Make turtle draw on movements" },
    { name: "black", description: "Change the turtle drawing color to black" },
    { name: "red", description: "Change the turtle drawing color to red" },
    { name: "green", description: "Change the turtle drawing color to green" },
    { name: "yellow", description: "Change the turtle drawing color to yellow" },
    { name: "blue", description: "Change the turtle drawing color to blue" },
    { name: "magenta", description: "Change the turtle drawing color to magenta" },
    { name: "cyan", description: "Change the turtle drawing color to cyan" },
    { name: "gray", description: "Change the turtle drawing color to gray" },
    { name: "random-color", description: "Change the turtle drawing color to a random one" },
    { name: "rgb", description: "Change the turtle drawing color to a specific one", args: ["red", "green", "blue"] },
    { name: "rgb-random-color", description: "Change the turtle drawing color to a random one" },
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
