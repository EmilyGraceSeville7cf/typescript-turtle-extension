import * as vscode from 'vscode';
import * as utils from "./utils"

export interface Command {
    readonly name: string,
    readonly description: string,
    readonly args?: string[],
    readonly shortcut?: string,
    readonly opposite?: string
}

function __create(commandName: string, commandDescription: string, commandArgs: string[] = []): Command {
    return { name: commandName, description: commandDescription, args: commandArgs }
}

function __createCompletion(command: Command, completionLabel: string, completionKind: vscode.CompletionItemKind): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(completionLabel, completionKind);
    completion.insertText = new vscode.SnippetString("(" + command.name);

    if (command.args !== undefined) {
        let index = 1;

        for (const arg of command.args) {
            completion.insertText.appendText(" ")
            completion.insertText.appendPlaceholder(`${arg}:integer`, index++)
        }
    }

    completion.insertText.appendText(")")
    completion.documentation = utils.createDocumentation(command.description, "https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle?tab=readme-ov-file#configuration-script-commands")
    return completion
}

export function createCommandCompletion(command: Command): vscode.CompletionItem {
    return __createCompletion(command, command.name, vscode.CompletionItemKind.Function)
}

export function createCommandSnippetCompletion(command: Command): vscode.CompletionItem {
    return __createCompletion(command, command.name, vscode.CompletionItemKind.Snippet)
}

export const list = [
    __create("move-on", "Move the turtle **on** a specific vector", ["x", "y"]),
    __create("move-to", "Move the turtle **to** a specific point", ["x", "y"]),
    { name: "move-forward", description: "Move the turtle **forward** for a specific amount of units", args: ["units"], shortcut: "f", opposite: "move-backward" },
    { name: "move-backward", description: "Move the turtle **backward** for a specific amount of units", args: ["units"], shortcut: "b", opposite: "move-forward" },
    __create("move-to-center", "Move the turtle to the **center**"),
    __create("move-to-top-left", "Move the turtle to the **top left corner**"),
    __create("move-to-top-middle", "Move the turtle to the **top middle side**"),
    __create("move-to-top-right", "Move the turtle to the **top right corner**"),
    __create("move-to-middle-right", "Move the turtle to the **middle right side**"),
    __create("move-to-bottom-right", "Move the turtle to the **bottom right corner**"),
    __create("move-to-bottom-middle", "Move the turtle to the **bottom middle side**"),
    __create("move-to-bottom-left", "Move the turtle to the **bottom left corner**"),
    __create("move-to-middle-left", "Move the turtle to the **middle left side**"),
    { name: "turn-left", description: "Rotate the turtle **left** at a specific amount of degrees", args: ["angle"], shortcut: "l", opposite: "turn-right" },
    { name: "turn-right", description: "Rotate the turtle **right** at a specific amount of degrees", args: ["angle"], shortcut: "r", opposite: "turn-left" },
    __create("up", "Make turtle **not draw** on movements"),
    __create("down", "Make turtle **draw** on movements"),
    __create("black", "Change the turtle drawing color to **black**"),
    __create("red", "Change the turtle drawing color to **red**"),
    __create("green", "Change the turtle drawing color to **green**"),
    __create("yellow", "Change the turtle drawing color to **yellow**"),
    __create("blue", "Change the turtle drawing color to **blue**"),
    __create("magenta", "Change the turtle drawing color to **magenta**"),
    __create("cyan", "Change the turtle drawing color to **cyan**"),
    __create("gray", "Change the turtle drawing color to **gray**"),
    __create("random-color", "Change the turtle drawing color to a **random one**"),
    __create("rgb", "Change the turtle drawing color to a **specific one**", ["red", "green", "blue"]),
    __create("rgb-random-color", "Change the turtle drawing color to a **random one**"),
]
