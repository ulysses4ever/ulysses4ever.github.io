data Value   : Type -> Type where
     IntVal  : Int -> Value Int
     BoolVal : Bool -> Value Bool
           
data Expr : Type -> Type where
     Val  : t -> Expr t
     If   : Expr Bool -> Expr t -> Expr t -> Expr t
     Add  : Expr Int -> Expr Int -> Expr Int

eval : Expr t -> t
eval (Val x) = x
eval (If x t e) with (eval x)
  eval (If x t e) | False = eval e
  eval (If x t e) | True = eval t
eval (Add x y) = eval x + eval y

