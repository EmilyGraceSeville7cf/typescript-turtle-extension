import * as vscode from 'vscode';
import * as utils from "./utils"

export interface Keyword {
    readonly name: string,
    readonly description: string,
    readonly body: string;
    readonly addParenthesis: boolean;
    readonly shortcut?: string;
}

function __create(keywordName: string, keywordDescription: string, keywordBody: string): Keyword {
    return { name: keywordName, description: keywordDescription, body: keywordBody, addParenthesis: true }
}

function __createCompletion(keyword: Keyword, completionLabel: string, completionKind: vscode.CompletionItemKind): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(completionLabel, completionKind);
    let insertText = `${keyword.name} ${keyword.body}`;
    if (keyword.addParenthesis)
        insertText = `(${insertText})`
    completion.insertText = new vscode.SnippetString(insertText);
    completion.documentation = utils.createDocumentation(keyword.description, "https://conservatory.scheme.org/schemers/Documents/Standards/R5RS/HTML/")
    return completion
}

function __createKeywordCompletion(keyword: Keyword): vscode.CompletionItem {
    return __createCompletion(keyword, keyword.name, vscode.CompletionItemKind.Keyword)
}

function __createKeywordSnippetCompletion(keyword: Keyword): vscode.CompletionItem | null {
    if (keyword.shortcut === undefined)
        return null

    return __createCompletion(keyword, keyword.shortcut, vscode.CompletionItemKind.Snippet)
}

export const list = [
    __create("if", "**Check** whether a specific condition is true", "${1:condition} ${2:then} ${3:else}"),
    { name: "define", description: "**Define** a variable with a specific value", body: "${1:variable} ${2:value}", addParenthesis: true, shortcut: "d" },
    __create("set!", "**Set** a specific value to a variable", "${1:variable} ${2:value}"),
    __create("let*", "**Define** variables with specific values", "((${1:variable} ${2:value})) ${3:commands}"),
    __create("begin", "**Group** specific commands", "${1:commands}"),
    { name: "@author", description: "Define a code **author**", body: "- ${1:author}", addParenthesis: false },
    { name: "@description", description: "Define a code **description**", body: "- ${1:description}", addParenthesis: false },
    { name: "@year", description: "Define a code **description**", body: "- ${1:year}", addParenthesis: false },
    { name: "@signature", description: "Define a specific function **signature**", body: "- ${1:function} ${2:types}", addParenthesis: false },
]

export const keywordCompletions = list.map(keyword => __createKeywordCompletion(keyword))
export const keywordSnippetCompletions = list.map(keyword => __createKeywordSnippetCompletion(keyword))
    .filter(completion => completion !== null)
export const allCompletions = keywordCompletions.concat(keywordSnippetCompletions)
