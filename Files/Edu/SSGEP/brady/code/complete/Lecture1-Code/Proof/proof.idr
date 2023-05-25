-- Load this with --noprelude

{-

data (=) : a -> b -> Type where
     Refl : x = x
-}

data Nat = Z | S Nat

plus : Nat -> Nat -> Nat
plus Z y = y 
plus (S k) y = S (plus k y)

twoplustwo : plus (S (S Z)) (S (S Z)) = (S (S (S (S Z))))
twoplustwo = Refl

plus_commutes_zero : (y : Nat) -> y = plus y Z
plus_commutes_zero Z = Refl
plus_commutes_zero (S x) = let ih = plus_commutes_zero x in
                               rewrite sym ih in Refl

plus_commutes_succ : (x : Nat) -> (y : Nat) -> 
                     S (plus y x) = plus y (S x)
plus_commutes_succ x Z = Refl
plus_commutes_succ x (S y) = rewrite plus_commutes_succ x y in
                                     Refl

total
plus_commutes : (x, y : Nat) -> plus x y = plus y x
plus_commutes Z y = plus_commutes_zero y
plus_commutes (S x) y = rewrite plus_commutes x y in
                                plus_commutes_succ x y


