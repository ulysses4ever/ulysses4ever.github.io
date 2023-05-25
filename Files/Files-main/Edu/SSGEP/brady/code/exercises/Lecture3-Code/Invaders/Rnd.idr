module Rnd

import Effects

data Random : Effect where
     getRandom : Random Int Int (\v => Int)

using (m : Type -> Type)
  instance Handler Random m where
     handle seed getRandom k
              = let seed' = assert_total ((1664525 * seed + 1013904223) `prim__sremInt` (pow 2 32)) in
                    k seed' seed'

RND : EFFECT
RND = MkEff Int Random

rndInt : Int -> Int -> Eff Int [RND]
rndInt lower upper = do v <- call getRandom
                        return (abs (v `prim__sremInt` (upper - lower)) + lower)


