import * as vscode from 'vscode';
import * as utils from "./utils"

export interface Variable {
    readonly name: string,
    readonly description: string,
    readonly shortcut?: string;
}

function __create(variableName: string, variableDescription: string): Variable {
    return { name: variableName, description: variableDescription }
}

function __createCompletion(variable: Variable, completionLabel: string, completionKind: vscode.CompletionItemKind): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(completionLabel, completionKind);
    completion.insertText = new vscode.SnippetString(variable.name);
    completion.documentation = utils.createDocumentation(variable.description, "https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle?tab=readme-ov-file#usage")
    return completion
}

function __createVariableCompletion(variable: Variable): vscode.CompletionItem {
    return __createCompletion(variable, variable.name, vscode.CompletionItemKind.Variable)
}

function __createVariableSnippetCompletion(variable: Variable): vscode.CompletionItem | null {
    if (variable.shortcut === undefined)
        return null

    return __createCompletion(variable, variable.shortcut, vscode.CompletionItemKind.Snippet)
}

export const list = [
    { name: "turtle-configuration", description: "A **drawing** code", shortcut: "c" },
    __create("turtle-theme", "A **theme** code")
]

export const variableCompletions = list.map(variable => __createVariableCompletion(variable))
export const variableSnippetCompletions = list.map(variable => __createVariableSnippetCompletion(variable))
    .filter(completion => completion !== null)
export const allCompletions = variableCompletions.concat(variableSnippetCompletions)
