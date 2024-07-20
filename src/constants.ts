import * as vscode from 'vscode';

function __createCompletion(constant: number) {
    const completion = new vscode.CompletionItem(constant.toString(), vscode.CompletionItemKind.Constant);
    completion.insertText = new vscode.SnippetString(constant.toString());
    return completion
}

let constants = [45, 90, 135, 180]
export const allCompletions = constants.concat(constants.map(constant => -constant)).map(constant => __createCompletion(constant))
