# Recap from 1st lecture

…

# Constraints

Introduce a kind for classes.

    GHCi> :kind Functor
    Functor :: (* -> *) -> Constraint

Bang pattern gor GHCi tells to evaluate thing as much as possible:

    GHCi> :kind! All Eq '[Int, Bool]
    All Eq '[Int, Bool] :: Constraint = Eq Int :* Eq Bool :* Nil

GHC refuses to infer type constraint if the only place where it is
appear is the actual constraint. This decision is somewhat conservative:
there are places where it helps to avoidambiguities, bit there are lots
of places where no problem could ever occurred. All in all we have to apply
a trick for cope with this.

# N-ary sums (a choice)

Choice is a list + an index (of an element you choose):

    data LChoice a = LCZero a | LCSuc (LChoice a)

It is really a list type paired with a natural number.

# SOP approach

This machinery breaks down for GADT'sas they are in principle two things:
existensionally quantified variables and equality constraints. The latter
one is easily handled by SOP (sum of products) approach, but the former is not.

## Generating `Generic` instances

### Template Haskell

    data Expr = ...
    deriveGeneric ''Expr

`deriveGeneric` thing is implemented :(

### Direct compiler support

is unlikely to be implemented as GHC has already have a direct support
for the other two approaches:

* SYB (`Data` datatype)
* (another) `Generic` type.

All they (nearly) store the same data about datatypes, so we come to the

### Generic Generic Programming

— it would be interesting to write (as a library) conversions between them. You can
transform from most informative to most practical and vice versa.

It is partially done (for `GHC.Generics.Generic` → generic-sop).

SOP define linear representation of a path in constructors. We could
also use binary (that is logarithmic) coding for the path.
