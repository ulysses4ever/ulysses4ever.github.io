{-
data Nat = Z | S Nat

plus : Nat -> Nat -> Nat
plus Z y = y 
plus (S x) y = S (plus x y)
-}

data Vect : Nat -> Type -> Type where
     Nil  : Vect Z a
     (::) : a -> Vect k a -> Vect (S k) a

%name Vect xs, ys, zs

append : Vect n a -> Vect m a -> Vect (n + m) a
append [] ys = ys 
append (x :: xs) ys = x :: append xs ys 

map : (a -> b) -> Vect n a -> Vect n b
map f [] = []
map f (x :: xs) = f x :: map f xs

zipWith : (a -> b -> c) -> Vect n a -> Vect n b -> Vect n c
zipWith f [] [] = []
zipWith f (x :: xs) (y :: ys) = f x y :: zipWith f xs ys


