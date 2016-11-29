#load "parser.fsx"

open Parser
open System


type Token = 
  | Comment of string
  | String of string
  | Keyword of string
  | Value of string   /// any simple value: bool, int, float 
  | Operator of string
  | Text of string



let lcBool = 
  pstring "true" 
  <|> pstring "false"

let ucBool = 
  pstring "True" 
  <|> pstring "False"

let pnull = pstring "null"

let keywordP = 
  [
    "let"
    "val"
    "fun"
    "rec"
    "match"
    "with"
    "case"
    "switch"
    "function"
    "type"
    "class"
    "interface"
    "for"
    "while"
    "return"
    "yield"
    "int"
    "float"
    "bool"
    "string"
    "of"
  ] |> List.map pstring |> choice

let unescapedChar = 
  let label = "char"
  satisfy (fun ch -> ch <> '\\' && ch <> '\"')

let escapedChar = 
    [ 
    // (stringToMatch, resultChar)
    ("\\\"",'\"')      // quote
    ("\\\\",'\\')      // reverse solidus 
    ("\\/",'/')        // solidus
    ("\\b",'\b')       // backspace
    ("\\f",'\f')       // formfeed
    ("\\n",'\n')       // newline
    ("\\r",'\r')       // cr
    ("\\t",'\t')       // tab
    ] 
    // convert each pair into a parser
    |> List.map (fun (toMatch,result) -> 
        pstring toMatch >>% result)
    // and combine them into one
    |> choice
let unicodeChar = 
    
  // set up the "primitive" parsers        
  let backslash = pchar '\\'
  let uChar = pchar 'u'
  let hexdigit = anyOf (['0'..'9'] @ ['A'..'F'] @ ['a'..'f'])

  // convert the parser output (nested tuples)
  // to a char
  let convertToChar (((h1,h2),h3),h4) = 
      let str = sprintf "%c%c%c%c" h1 h2 h3 h4
      System.Convert.ToInt32 (str, 16) |> char
      //System.Int32.Parse(str,System.Globalization.NumberStyles.HexNumber) |> char

  // set up the main parser
  backslash  >>. uChar >>. hexdigit .>>. hexdigit .>>. hexdigit .>>. hexdigit
  |>> convertToChar 


let quotedString = 
    let dquote = pstring "\""
    let squote = pstring "\'"

    let jchar = unescapedChar <|> escapedChar <|> unicodeChar 

    // set up the main parser
    (dquote .>>. manyChars jchar .>>. dquote) <|> (squote .>>. manyChars jchar .>>. squote)
    |>> (fun ((q,s),_) -> q + s + q)


let blockComment startc endc = 
    let chars = notP endc (satisfy (fun c -> true))

    // set up the main parser
    startc .>>. manyChars chars .>>. endc
    |>> (fun ((st,cmt),en) -> st + cmt + en)

let ( |>? ) opt f = 
  match opt with
  | None -> ""
  | Some x -> f x


let lineComment startc = 
    let chars = satisfy (fun c -> true)
    let nl = pchar '\n'
    // set up the main parser
    startc .>>. manyChars chars .>>. (opt nl |>> (fun o -> if o = None then "" else "\n"))
    |>> (fun ((st,cmt),en) -> st + cmt + en)

let optSign = opt (pchar '-')

let zero = pstring "0"

let digitOneNine = anyOf ['1'..'9']

let digit = anyOf ['0'..'9']

let point = pchar '.'

let e = pchar 'e' <|> pchar 'E'

let optPlusMinus = opt (pchar '+' <|> pchar '-')


let nonZeroInt = 
  digitOneNine .>>. manyChars digit
  |>> fun (first, rest) -> string first + rest

let intPart = zero <|> nonZeroInt
let fractionPart = point >>. manyChars1 digit
let exponentPart = e >>. optPlusMinus .>>. manyChars1 digit

let convertToString (((optSign,intPart),fractionPart),expPart) = 
    // convert to strings and let .NET parse them! - crude but ok for now.

    let signStr = 
        optSign 
        |>? string   // e.g. "-"

    let fractionPartStr = 
        fractionPart 
        |>? (fun digits -> "." + digits )  // e.g. ".456"

    let expPartStr = 
        expPart 
        |>? fun (optSign, digits) ->
            let sign = optSign |>? string
            "e" + sign + digits          // e.g. "e-12"

    // add the parts together and convert to a float, then wrap in a JNumber
    (signStr + intPart + fractionPartStr + expPartStr)


let pnumber = 
  optSign .>>. intPart .>>. opt fractionPart .>>. opt exponentPart
  |>> convertToString


let valueP = lcBool <|> ucBool <|> pnull <|> pnumber
let operatorP = 
  List.map pchar [ '+'; '-'; '@'; '>'; '<'; '|'; '&'; ':'; '?' ]
  |> choice
  |> many1 |>> charListToStr

let comment =
  choice 
    [ blockComment (pstring "(*") (pstring "*)")
      blockComment (pstring "/*") (pstring "*/")
      blockComment (pstring "{-") (pstring "-}")
      lineComment (pstring "//")
      lineComment (pstring "--")
    ]
  |>> Comment


let specificToken = choice 
                      [
                        keywordP |>> Keyword
                        quotedString |>> String
                        valueP |>> Value
                        comment
                        operatorP |>> Operator
                      ]
let textChar = notP specificToken (satisfy (fun _-> true))
let textP = 
  manyChars textChar 
  |>> Text
let parseToken str =
  match run (specificToken <|> textP) str with
  | Success (t,r) -> (t, r)
  | Failure err -> (Text err, "")

let rec tokenize code =
  match code with 
  | "" -> []
  | _ -> 
    let tk, rest = parseToken code
    tk :: tokenize rest

