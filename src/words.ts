import * as vscode from 'vscode';
import * as utils from "./utils"

export function createCompletion(word: string): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(word, vscode.CompletionItemKind.Text);
    completion.insertText = new vscode.SnippetString(word);
    completion.documentation = utils.createDocumentation("A **word** typed in the current document", "https://translate.google.ca/?sl=auto&tl=en&op=translate")
    return completion
}
