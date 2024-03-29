---
layout: default-en
title: Type Stability in Julia
---

## Type Stability in Julia
### Avoiding Performance Pathologies in JIT Compilation
#### A. Pelenitsyn, [J. Belyakova][julia], [B. Chung][chung], [R. Tate][ross], [J. Vitek][jan] (In [OOPSLA '21][oopsla])

<br />

_Abstract_  
As a scientific programming language, Julia strives for performance but also provides high-level productivity
features. To avoid performance pathologies, Julia users are expected to adhere to a coding discipline that
enables so-called type stability. Informally, a function is type stable if the type of the output depends only
on the types of the inputs, not their values. This paper provides a formal definition of type stability as well
as a stronger property of type groundedness, shows that groundedness enables compiler optimizations, and
proves the compiler correct. We also perform a corpus analysis to uncover how these type-related properties
manifest in practice.

_Resourses_

* Type Stability in Julia: Avoiding Performance Pathologies in JIT Compilation
  [[DOI: 10.1145/3485527]][acmdl] [[preprint]][preprint]

* Extended version of the paper with detailed proofs and more graphs from corpus
  analysis: [[arXiv:2109.01950]][arxiv]
  
* [Video][video] and [slides][slides] for the OOPSLA presentation

* Artifact measuring stability in Julia packages:
  [[GitHub]][artifact-gh] [[Zenodo]][artifact-zenodo]


[preprint]: ../../Papers/2021-julia-type-stability.pdf
[acmdl]: https://doi.org/10.1145/3485527
[arxiv]: https://arxiv.org/abs/2109.01950
[artifact-gh]: https://github.com/prl-julia/julia-type-stability
[artifact-zenodo]: https://zenodo.org/record/5500548
[oopsla]: https://2021.splashcon.org/details/splash-2021-oopsla/54/Type-Stability-in-Julia-Avoiding-Performance-Pathologies-in-JIT-Compilation
[video]: https://youtu.be/XnUDdPonKlU
[slides]: https://docs.google.com/presentation/d/1MgZLjEIIjFkL49y2bOQ93PCQwKu_B6u00yO_Oz_3gn8/edit?usp=sharing

[julia]: https://julbinb.github.io/ 
[chung]: https://benchung.github.io/
[ross]: http://www.cs.cornell.edu/~ross/
[jan]: http://janvitek.org/
