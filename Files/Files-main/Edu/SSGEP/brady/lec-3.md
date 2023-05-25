# EDLs: State, Side Effects and Resources

Monad transformers — kind of necessary evil.

## Expression example (once again)

Have variables, need for composition of `Maybe` and `ReaderT` (for environment).

> Using `ask` in the middle of the program is just wrong (A. Loh)

In Idris we have the whole DSL for handling effects.

    data EffM : (m : Type -> Type) -> (res : Type) ->
        (in_effects : List EFFECT) ->
        (out_effects : res -> List EFFECT) ->
        Type

