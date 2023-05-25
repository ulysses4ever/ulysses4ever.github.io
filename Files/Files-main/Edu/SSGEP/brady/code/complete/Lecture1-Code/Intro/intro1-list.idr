-- Load this with --noprelude

infixr 5 ::

data List a = Nil | (::) a (List a)

%name List xs,ys,zs

append : List a -> List a -> List a
append [] ys = ys
append (x :: xs) ys = x :: append xs ys

map : (a -> b) -> List a -> List b
map f [] = [] 
map f (x :: xs) = f x :: map f xs

zipWith : (a -> b -> c) -> List a -> List b -> List c
zipWith f [] [] = []
zipWith f [] (x :: xs) = []
zipWith f (x :: xs) [] = []
zipWith f (x :: xs) (y :: ys) = f x y :: zipWith f xs ys

