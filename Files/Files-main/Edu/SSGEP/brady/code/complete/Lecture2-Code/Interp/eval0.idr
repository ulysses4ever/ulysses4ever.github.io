data Expr = Val Int
          | Add Expr Expr

eval : Expr -> Int
eval (Val x) = x 
eval (Add x y) = eval x + eval y

test_prog : Expr
test_prog = Add (Val 2) (Val 2)

