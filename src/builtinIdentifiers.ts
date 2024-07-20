const __list = ["*",
    "+",
    "-",
    "/",
    "<",
    "<=",
    "=",
    "=>",
    ">",
    ">=",

    "abs",
    "acos",
    "and",
    "angle",
    "append",
    "apply",
    "asin",
    "assoc",
    "assq",
    "assv",
    "atan",

    "backquote",
    "begin",
    "binding",
    "boolean?",
    "bound",

    "caar",
    "cadr",
    "call",
    "call-with-current-continuation",
    "call-with-input-file",
    "call-with-output-file",
    "call-with-values",
    "car",
    "case",
    "cdddar",
    "cddddr",
    "cdr",
    "ceiling",
    "char->integer",
    "char-alphabetic?",
    "char-ci<=?",
    "char-ci<?",
    "char-ci=?",
    "char-ci>=?",
    "char-ci>?",
    "char-downcase",
    "char-lower-case?",
    "char-numeric?",
    "char-ready?",
    "char-upcase",
    "char-upper-case?",
    "char-whitespace?",
    "char<=?",
    "char<?",
    "char=?",
    "char>=?",
    "char>?",
    "char?",
    "close-input-port",
    "close-output-port",
    "combination",
    "comma",
    "comment",
    "complex?",
    "cond",
    "cons",
    "constant",
    "continuation",
    "cos",
    "current-input-port",
    "current-output-port",

    "define",
    "define-syntax",
    "definition",
    "delay",
    "denominator",
    "display",
    "do",
    "dynamic-wind",

    "else",
    "eof-object?",
    "eq?",
    "equal?",
    "eqv?",
    "error",
    "eval",
    "even?",
    "exact",
    "exact->inexact",
    "exact?",
    "exactness",
    "exp",
    "expt",

    "false",
    "floor",
    "for-each",
    "force",

    "gcd",

    "hygienic",

    "identifier",
    "if",
    "imag-part",
    "immutable",
    "inexact",
    "inexact->exact",
    "inexact?",
    "input-port?",
    "integer->char",
    "integer?",
    "interaction-environment",

    "keyword",

    "lambda",
    "lcm",
    "length",
    "let",
    "let*",
    "let-syntax",
    "letrec",
    "letrec-syntax",
    "library",
    "list",
    "list->string",
    "list->vector",
    "list-ref",
    "list-tail",
    "list?",
    "load",
    "location",
    "log",

    "macro",
    "magnitude",
    "make-polar",
    "make-rectangular",
    "make-string",
    "make-vector",
    "map",
    "max",
    "member",
    "memq",
    "memv",
    "min",
    "modulo",
    "mutable",

    "negative?",
    "newline",
    "not",
    "null-environment",
    "null?",
    "number",
    "number->string",
    "number?",
    "numerator",

    "object",
    "odd?",
    "open-input-file",
    "open-output-file",
    "optional",
    "or",
    "output-port?",

    "pair",
    "pair?",
    "peek-char",
    "port",
    "port?",
    "positive?",
    "predicate",
    "procedure?",
    "promise",

    "quasiquote",
    "quote",
    "quotient",

    "rational?",
    "rationalize",
    "read",
    "read-char",
    "real-part",
    "real?",
    "region",
    "remainder",
    "reverse",
    "round",

    "scheme-report-environment",
    "set!",
    "set-car!",
    "set-cdr!",
    "setcar",
    "sin",
    "sqrt",
    "string",
    "string->list",
    "string->number",
    "string->symbol",
    "string-append",
    "string-ci<=?",
    "string-ci<?",
    "string-ci=?",
    "string-ci>=?",
    "string-ci>?",
    "string-copy",
    "string-fill!",
    "string-length",
    "string-ref",
    "string-set!",
    "string<=?",
    "string<?",
    "string=?",
    "string>=?",
    "string>?",
    "string?",
    "substring",
    "symbol->string",
    "symbol?",
    "syntax-rules",

    "tan",
    "token",
    "transcript-off",
    "transcript-on",
    "true",
    "truncate",
    "type",

    "unbound",
    "unspecified",

    "values",
    "variable",
    "vector",
    "vector->list",
    "vector-fill!",
    "vector-length",
    "vector-ref",
    "vector-set!",
    "vector?",

    "with-input-from-file",
    "with-output-to-file",
    "write",
    "write-char",

    "zero?"]

function __escape(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const list = __list.map(identifier => __escape(identifier))