# Turtle support

## Description

Provides support for [Turtle configs][turtle].

[turtle]: https://github.com/EmilyGraceSeville7cf/tinyscheme-turtle?tab=readme-ov-file#configuration-script-commands

![screenshot](https://raw.githubusercontent.com/EmilyGraceSeville7cf/typescript-turtle-extension/main/assets/intellisence-screenshot.jpg)
![screenshot](https://raw.githubusercontent.com/EmilyGraceSeville7cf/typescript-turtle-extension/main/assets/diagnostics-screenshot.jpg)

## Features

- [x] Completions for Turtle commands, and some basic Scheme constructs
- [x] RegExp-based completions for:
  - user-defined variables
  - user-defined commands (with their arguments and types included)
  - user-defined colors (number triples)
  - user-defined vectors (number pairs)
  - built-in variables
  - built-in commands
- [x] RegExp-based warnings for:
  - non-existing commands
  - incorrect RGB colors
  - incorrect argument count
  - incorrect code style
- [x] Completions for `@author`, `@description` and `@year` keywords to explain
  the author who has written some code, it's description and the year the code
  was written respectively.
- [x] Completion for `@signature` keyword for explaining expected argument types
  for functions
