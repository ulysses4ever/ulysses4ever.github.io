data Value = IntVal Int | BoolVal Bool
           
data Expr = Val Value
          | If Expr Expr Expr
          | Add Expr Expr

eval : Expr -> Maybe Value
eval (Val x) = Just x
eval (If x t e) with (eval x)
  eval (If x t e) | Just (IntVal y) = Nothing 
  eval (If x t e) | Just (BoolVal True) = eval t 
  eval (If x t e) | Just (BoolVal False) = eval e 
  eval (If x t e) | Nothing = Nothing 
eval (Add x y) with (eval x, eval y)
  eval (Add x y) | (Just (IntVal x'), Just (IntVal y')) = Just (IntVal (x' + y'))
  eval (Add x y) | _ = Nothing

