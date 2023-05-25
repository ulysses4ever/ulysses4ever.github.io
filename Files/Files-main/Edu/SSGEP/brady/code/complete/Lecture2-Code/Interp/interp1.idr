module Main

import Data.Vect
import Data.Fin

data Ty = TyInt | TyBool| TyFun Ty Ty

interpTy : Ty -> Type
interpTy TyInt = Int 
interpTy TyBool = Bool 
interpTy (TyFun s t) = interpTy s -> interpTy t










------
data Env  : Vect n Ty -> Type where
     Nil  : Env Nil
     (::) : interpTy a -> Env gamma -> Env (a :: gamma)

%name Env gamma










------
data HasType : (i : Fin n) -> Vect n Ty -> Ty -> Type where
     Stop    : HasType FZ (t :: gamma) t
     Pop     : HasType k gamma t -> HasType (FS k) (u :: gamma) t

lookup : HasType i gamma t -> Env gamma -> interpTy t
lookup Stop    (x :: xs) = x
lookup (Pop k) (x :: xs) = lookup k xs

data Expr : Vect n Ty -> Ty -> Type where
    Var : HasType i gamma t -> Expr gamma t
    Val : Int -> Expr gamma TyInt
    Lam : Expr (a :: gamma) t -> Expr gamma (TyFun a t)
    App : Lazy (Expr gamma (TyFun a t)) -> Expr gamma a -> Expr gamma t
    Op  : (interpTy a -> interpTy b -> interpTy c) -> 
          Expr gamma a -> Expr gamma b -> Expr gamma c
    If  : Expr gamma TyBool -> Expr gamma a -> Expr gamma a -> Expr gamma a








------
interp : Env gamma -> [static] Expr gamma t -> interpTy t
interp env (Var i)     = lookup i env
interp env (Val x)     = x
interp env (Lam sc)    = \x => interp (x :: env) sc
interp env (App f s)   = (interp env f) (interp env s)
interp env (Op op x y) = op (interp env x) (interp env y)
interp env (If x t e)  = if interp env x then interp env t else interp env e















------
eId : Expr gamma (TyFun TyInt TyInt)
eId = Lam (Var Stop)

eAdd : Expr gamma (TyFun TyInt (TyFun TyInt TyInt))
eAdd = Lam (Lam (Op (+) (Var (Pop Stop)) (Var Stop)))

eFac : Expr gamma (TyFun TyInt TyInt)
eFac = Lam (If (Op (==) (Var Stop) (Val 0))
               (Val 1)
               (Op (*) (App eFac (Op (-) (Var Stop) (Val 1))) (Var Stop)))

testFac : Int -> Int
testFac x = interp [] eFac x

main : IO ()
main = do putStr "Number: "
          x <- getLine
          printLn (testFac (cast (trim x)))


