my_maybe : b -> (a -> b) -> Maybe a -> b
my_maybe n j Nothing = n
my_maybe n j (Just x) = j x

really_expensive_computation : Int

test_maybe : Maybe Int -> Int
test_maybe m = my_maybe really_expensive_computation (* 2) m

