open System

type Result<'a> =
  | Success of 'a
  | Failure of string

type Parser<'T> = Parser of (string -> Result<'T * string>)

let satisfy pred =
  let innerFn str =
    if String.IsNullOrEmpty str then
      Failure "No more input"
    else
      let first = str.[0]
      if pred first  then 
        let remaining = str.[1..]

        Success (first, remaining)
      else 
        let msg = sprintf "Unexpected '%c'." first 
        Failure msg     
  Parser innerFn


let pchar charToMatch = 
  let innerFn str = 
    if String.IsNullOrEmpty str then
      Failure "No more input"
    else
      let first = str.[0]
      if first = charToMatch then 
        let remaining = str.[1..]

        Success (charToMatch, remaining)
      else 
        let msg = sprintf "Expecting '%c'. Got '%c'" charToMatch first 
        Failure msg
  Parser innerFn

let run (Parser innerFn) input = 
  innerFn input

let andThen p1 p2 = 
  let innerFn str =
    let r1 = run p1 str
    match r1 with
    | Failure err -> Failure err
    | Success (v1, rest1) -> 
      let r2 = run p2 rest1
      match r2 with
      | Failure err2 -> Failure err2
      | Success (v2, rest2) -> Success ((v1,v2), rest2)
  Parser innerFn

let ( .>>. ) = andThen

let orElse p1 p2 = 
  let innerFn str =
    let r1 = run p1 str
    match r1 with
    | Failure err -> 
      run p2 str
    | Success _ -> 
      r1
  Parser innerFn


let ( <|> ) = orElse

let choice listOfParsers = List.reduce (<|>) listOfParsers

let anyOf listOfChars =
  listOfChars
  |> List.map pchar
  |> choice


let mapP fn p =
  let innerFn str = 
    match run p str with
    | Success (v, rest) -> Success (fn v, rest)
    | Failure err -> Failure err
  Parser innerFn

let ( <!> ) = mapP
let ( |>> ) x f = mapP f x

let returnP v = 
  let innerFn input =
    Success (v, input)
  Parser innerFn

let applyP fP xP =
  (fP .>>. xP)
  |> mapP (fun (f,x) -> f x)

let ( <*> ) = applyP

let lift2 f xP yP =
    returnP f <*> xP <*> yP


let rec sequence parserList =
  let cons head tail = head :: tail
  let consP = lift2 cons
  match parserList with
  | [] -> returnP []
  | head :: tail -> consP head (sequence tail)

let charListToStr charList = 
     String(List.toArray charList)

let pstring str = 
  str
  |> Seq.map pchar
  |> Seq.toList
  |> sequence
  |> mapP charListToStr

let rec parseZeroOrMore parser input =
  let firstResult = run parser input
  match firstResult with
  | Failure err -> ([], input)
  | Success (firstValue, inputAfterFirstParse) ->
    let (subsequentValues, remainingInput) = 
      parseZeroOrMore parser inputAfterFirstParse
    let values = firstValue :: subsequentValues
    (values, remainingInput)

let many parser = 
  let innerFn input =
    Success (parseZeroOrMore parser input)
  Parser innerFn

let many1 parser =
  let innerFn input =
    let firstResult = run parser input
    match firstResult with
    | Failure err -> Failure err
    | Success (firstValue, inputAfterFirstParse) -> 
      let (subsequentValues, remainingInput) =
        parseZeroOrMore parser inputAfterFirstParse
      let values = firstValue :: subsequentValues
      Success (values, remainingInput)
  Parser innerFn


let opt p =
  let some = p |>> Some
  let none = returnP None
  some <|> none


let (.>>) p1 p2 =
  p1 .>>. p2
  |> mapP (fun (x,y) -> x)


let (>>.) p1 p2 =
  p1 .>>. p2
  |> mapP (fun (x,y) -> y)


let pint =
  let resultToInt (sign, digitList) =
    let i = String(List.toArray digitList) |> int
    match sign with
    | Some c -> -i
    | None -> i

  let digit = anyOf ['0'..'9']
  let digits = many1 digit

  opt (pchar '-') .>>. digits
  |> mapP resultToInt


let (>>%) p x =
  p |>> (fun _ -> x)


let manyChars cp =
    many cp
    |>> charListToStr


let manyChars1 cp =
    many1 cp
    |>> charListToStr

let notP p1 p2 = 
  let innerFn str =
    let r = run p1 str
    match r with 
    | Success _ -> Failure "Unexpected input"
    | Failure _ -> run p2 str
  Parser innerFn


let whitespaceChar = anyOf [' '; '\t'; '\n']
let whitespace = many whitespaceChar 
