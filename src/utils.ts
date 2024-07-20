import * as vscode from 'vscode';

export function createDocumentation(documentation: string, readMore: string, note?: string) {
    return new vscode.MarkdownString(`${documentation}

[Read more](${readMore}) |
[Is something incorrect?](https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle/issues)` +
        (note !== undefined ? `

*Notice: ${note}*.` : ""));
}
