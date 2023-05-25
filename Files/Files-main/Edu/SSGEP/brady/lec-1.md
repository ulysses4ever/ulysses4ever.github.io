# Introduction to Idris programming

Idris is *Pac-man Complete* PL with **dependent types**.

Topic for PhD: does Space Invaders-complete implies Pac-man Complete?

Dependent Types: types as a *first class* language constructs.

Idris compiled languages (via C, JavaScript, etc.). It tries to produce
binaries which works asymptotically as good as programs without proofs.

Idris has strict evaluation order as we want types to tell us
everything about values.

Idris has nice interactive helper in a form of `vim` (and `emacs`) plugin,
which assist in proof searching (program construction).

Second popular example for dep. types (besides vectors) is `printf`.

Note: dep. types not free you from writing tests. Would be good to have
QuickCheck for types.

When you write types you have to decide how much precise the types should be.
And the answer is now always “as precise as possible”.
