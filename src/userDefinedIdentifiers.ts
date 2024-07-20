import * as vscode from 'vscode';
import * as utils from "./utils"
import * as commands from "./commands"
import * as keywords from "./keywords"
import * as variables from "./variables"

interface UserDefinedIdentifier {
    readonly regex: RegExp;
    readonly description: string;
    readonly kind: vscode.CompletionItemKind;
}

function __create(userDefinedIdentifierRegex: RegExp, userDefinedIdentifierDescription: string, userDefinedIdentifierKind: vscode.CompletionItemKind): UserDefinedIdentifier {
    return { regex: userDefinedIdentifierRegex, description: userDefinedIdentifierDescription, kind: userDefinedIdentifierKind }
}

function __createCompletion(userDefinedIdentifier: UserDefinedIdentifier, completionLabel: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(completionLabel, userDefinedIdentifier.kind);
    completion.insertText = new vscode.SnippetString(completionLabel);
    completion.documentation = utils.createDocumentation(userDefinedIdentifier.description, "https://conservatory.scheme.org/schemers/Documents/Standards/R5RS/HTML/")
    return completion
}

const userDefinedIdentifiers = [
    __create(/\(\s*define (?<identifier>[a-zA-Z][a-zA-Z0-9\-]+)/, "A possible user defined **variable**", vscode.CompletionItemKind.Variable),
    __create(/\(\s*define \((?<identifier>[a-zA-Z][a-zA-Z0-9\-]+)/, "A possible user defined **function**", vscode.CompletionItemKind.Function),
    __create(/(\(\s*\d+\s+\d+\s+\d+\s*\))/, "A possible user defined **color**", vscode.CompletionItemKind.Color),
    __create(/\((?:move-on|move-to)\s+(-?\d+\s+-?\d+)\)/, "A possible user defined **vector**", vscode.CompletionItemKind.Constant),
]

export function createUserDefinedIdentifierCompletionsFor(document: vscode.TextDocument): vscode.CompletionItem[] {
    return [...new Set(document.getText().split("\n"))]
        .map(line => {
            const identifier = userDefinedIdentifiers.find(identifier => identifier.regex.test(line))
            if (identifier === undefined)
                return null

            return __createCompletion(identifier, line.match(identifier.regex)![1])
        }).filter(completion => completion !== null)
        .filter(identifier =>
            commands.list.map(command => command.name).indexOf(identifier.label as string) === -1 &&
            keywords.list.map(keyword => keyword.name).indexOf(identifier.label as string) === -1 &&
            variables.list.map(variable => variable.name).indexOf(identifier.label as string) === -1
        )
}

export function listFor(document: vscode.TextDocument): string[] {
    return createUserDefinedIdentifierCompletionsFor(document).map(completion =>
        completion.label as string
    )
}
