# EDLs

DSLs are everywhere. Specific problem domain. Props:

* high abstraction,
* declarative (*what* and not *how*),
* not Turing-complete.

Examples: Email filtering, music playlists.

Idris supports for creating *verified* DSLs.

## Example 0: Arithmetic Expressions (with conditionals)

Using abstract syntax (later figure out how to do this better).
First consider simple `Expr` type, only `Int`'s. Then `Bool`'s + `Int`'s.
 Naive approach: lots of cases for PM. The solution — GADTs.

### Error message reflections

Writing DSLs you can impact on (tune) the error messages. Compare
error messages for

> "Hello" + 4

in Haskell and in Idris ("String is not a numerical value" in the latter case).

## Example 1: STLC

Dichotomy: object lang. and target lang. First define (object lang.'s) types
and an interpreter for them to Idris' types.

Now expressions also carry context: a vector of types (using De Bruijn indeces).

### Partial evaluation

Get recursive function in object language and turn it into rec. fun. in target
language

PE gets deeper when use `[static]` marker in the type of a function.
It tells Idris that the argument is goone to be known on compile time.

## Example 2: Door operation protocol

Door is either open or closed. We can open / close / knock-in-a-closed-door.

### Unique types (a-la Clean PL)

We use monadic syntax sugar to demonstrate door protocol. And we incounter
a problem: we can use the same state more than once. We use
`UniqueType`-types: their values are only used once.

### Implicit values

Introduced to make DSLs less noisy.

All this usefull when implementing communication protocols.

    echo : Protocol [A, B] ()
    echo = do msg <- Send A B String
              Send B A (Literal msg)

Here we try to get **typed Erlang**. We also have developed as a student
project an Erlang backend for Idris.

Think about changing protocol (say, add a thing). You'll have to change nearly every
bit. But in n typed languages it will be pointed to you by compiler. Again,
error messages are quite approachable thanks to *error message reflection*.

