import * as vscode from 'vscode';
import * as utils from "./utils"
import * as commands from "./commands"
import * as keywords from "./keywords"
import * as variables from "./variables"
import * as userDefinedIdentifiers from "./userDefinedIdentifiers"

function __createCompletion(word: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(word, vscode.CompletionItemKind.Text);
    completion.insertText = new vscode.SnippetString(word);
    completion.documentation = utils.createDocumentation("A **word** typed in the current document", "https://translate.google.ca/?sl=auto&tl=en&op=translate")
    return completion
}

export function createWordCompletionsFor(document: vscode.TextDocument): vscode.CompletionItem[] {
    return listFor(document).map(word => __createCompletion(word))
}

export function listFor(document: vscode.TextDocument): string[] {
    return [...new Set(document.getText().split(/\W/))].filter(word =>
        commands.list.map(command => command.name).indexOf(word) === -1 &&
        keywords.list.map(keyword => keyword.name).indexOf(word) === -1 &&
        variables.list.map(variable => variable.name).indexOf(word) === -1 &&
        userDefinedIdentifiers.listFor(document).indexOf(word) === -1
    )
}
