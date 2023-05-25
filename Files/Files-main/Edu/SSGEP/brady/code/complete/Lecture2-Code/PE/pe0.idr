my_map : [static] (a -> b) -> List a -> List b
my_map f [] = []
my_map f (x :: xs) = f x :: my_map f xs

test_map : List Int
test_map = my_map (* 2) [1..10]

