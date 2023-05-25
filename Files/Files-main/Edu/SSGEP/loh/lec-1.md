# Datatype generic programming: Introduction

Structure of datatype => algorithm.

## Example: `eq :: A -> A -> Bool`

Two values must have the same _shape_, then — same value.

Conversion to some `Rep a` which has uniform structure allow to
express `eq` algorithmically.

There are ~ 30-40 libs for gen. prog. in Haskell. Lots of approaches.
(Flexibility in details of definition `Rep`)
We'll concentrate on a library `generics-sop`.

Will not go into theoretical results: GHC extensions only moderately
approximate them. We will discuss real code.

## Applications

(De)-Serializations (parsing, JSON, XML, pretty-printing, graphical rep.).
Data generation (testing),…

## Intro to `generics-sop`

**Choice** of constructor and **sequence** of parameters to it.

    C_i x_0 ... x_{n_i - 1}

Uniform rep. at runtime: pointer to constructor (an integer, an index),
sequence of pointers to values. We'll use **n-ary products** and **sums** of types.
This requires a good number of GHC extensions.

# Kinds and Data Kinds

    GHCi> :kind Char
    Char :: *

Stars are most important kinds in Haskell, unparametrized ones.

    Int, Double, … , (), Void

Star is special in the way that it is open: we can add our own types to
it.

GHC is not usually clear about kinds as they were not originally
(visible) part of the language.

We also have types of kinds ­superkinds. Whenever you define

    data Bool = True | False

Besides of

    Bool :: *
    True :: Bool
    False :: Bool

you have also things **promoted**:

    Bool :: \box
    'False :: *
    'True :: *

Where '`box' is superkind. And '`True` and `'False` are uninhabittant
types.

# GADTs

## `Vec` example

We'll explore usuall `Vec` example: homogenious lists with (type-) known
length. We'll go in four steps.

    data Nat = Zero | Suc Nat

Then using GADT's syntax we have:

    data Vec (a :: *) (n :: Nat) -- using Nat as a kind
        ...

Now we kave typechecker-tracked fixed-length lists. We can define all
usual functions on them: `tail` (with `VNil` case omitted), `vmap`.

// We use `~` for type equality in Haskell.

### `Applicative` interace for `Vec`

We can give two meaningfull instance of A. for lists in Haskell.
One derived from `Monad` and less interesting. Other one is so called
zip-list applicative.

We want to have `vreplicate` producing a vector of given length
which will play role of `pure`. There
is a problem (can;t use run-time parameter, can't use usuall
parametric polym. in result type). We can use a *type class*. But it is not really
nice: change lot's of things in interfaces. Better solution is
**singleton nats**.

## Heterogenious lists

Let's analize promotion for lists.
