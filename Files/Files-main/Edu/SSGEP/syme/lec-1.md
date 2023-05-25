# Overview

The topic is Type Providers.

Information revolution = open API explosion. Information integration
is important. So it is information-rich world vs. information-sparse PLs
(which we unfortunately still have today). Especially rigid languages
in terms of information integration are strongly-typed ones :(
Though statically typed languages and dynamically typed ones are coming closer
to each other.

# Overview of F#

F# is firstly functional language with a bit of objects. Does not
embrace OOP in full. Have o do more type annotations when:

* overloading methods,
* using dot notation.

Though we have surprisingly good interplay with subtyping and type inference.

No support for AOP.

# F# to WorldBank demo...

# Type Provider is…

* a library,
* an adaptor between data/services and .NET type system,
* a plugin to a compiler/IDE.

The technique: generating nominal type objects through compiler plugin
interface, to have types for nearly every entity in your dataset.

## SQL example

R integration.

Typechecks stays valid as far as the data schema stays constant. So,
typecheck early — and typecheck often. Hard problem, some progress…

**Type erasure** makes the compiled code more stable.
