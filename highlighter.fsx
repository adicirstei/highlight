#load "lexer.fsx"

#r "node_modules/fable-core/Fable.Core.dll"
open Fable.Core
open Fable.Import

let augmentToken tk =
  match tk with
  | Lexer.Comment c -> sprintf "<span class=\"comment\">%s</span>" c
  | Lexer.Value v -> sprintf "<span class=\"value\">%s</span>" v
  | Lexer.Operator o -> sprintf "<span class=\"operator\">%s</span>" o
  | Lexer.String s -> sprintf "<span class=\"string\">%s</span>" s
  | Lexer.Keyword k -> sprintf "<span class=\"keyword\">%s</span>" k
  | Lexer.Text t -> t



let highlight str = 
  Lexer.tokenize str
  |> List.map augmentToken
  |> List.reduce (+)


let codeSnippets = Browser.document.querySelectorAll("pre > code")

for i in [ 0..int (codeSnippets.length) - 1 ] do 
  let e = codeSnippets.[i]
  codeSnippets.[i].innerHTML <- highlight (e.innerHTML)

