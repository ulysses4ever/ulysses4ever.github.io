module Main

import Data.Vect
import Data.Fin

data Ty = TyInt | TyBool| TyFun Ty Ty

interpTy : Ty -> Type
interpTy TyInt       = Int
interpTy TyBool      = Bool
interpTy (TyFun s t) = interpTy s -> interpTy t

data Env : Vect n Ty -> Type where
    Nil  : Env Nil
    (::) : interpTy a -> Env gamma -> Env (a :: gamma)

data HasType : (i : Fin n) -> Vect n Ty -> Ty -> Type where
    Stop : HasType FZ (t :: gamma) t
    Pop  : HasType k gamma t -> HasType (FS k) (u :: gamma) t

lookup : HasType i gamma t -> Env gamma -> interpTy t
lookup Stop    (x :: xs) = x
lookup (Pop k) (x :: xs) = lookup k xs
lookup Stop    [] impossible

data Expr : Vect n Ty -> Ty -> Type where
    Var : HasType i gamma t -> Expr gamma t
    Val : (x : Int) -> Expr gamma TyInt
    Lam : Expr (a :: gamma) t -> Expr gamma (TyFun a t)
    App : Lazy (Expr gamma (TyFun a t)) -> Expr gamma a -> Expr gamma t
    Op  : (interpTy a -> interpTy b -> interpTy c) -> Expr gamma a -> Expr gamma b ->
          Expr gamma c
    If  : Expr gamma TyBool -> Expr gamma a -> Expr gamma a -> Expr gamma a

exprLam : TTName -> Expr (a :: gamma) t -> Expr gamma (TyFun a t)
exprLam _ = Lam

dsl expr
    lambda = exprLam
    variable = Var
    index_first = Stop
    index_next = Pop

total
interp : Env gamma -> [static] (e : Expr gamma t) -> interpTy t
interp env (Var i)     = lookup i env
interp env (Val x)     = x
interp env (Lam sc)    = \x => interp (x :: env) sc
interp env (App f s)   = (interp env f) (interp env s)
interp env (Op op x y) = op (interp env x) (interp env y)
interp env (If x t e)  = if interp env x then interp env t else interp env e


ifThenElse : Expr gamma TyBool -> Expr gamma t -> Expr gamma t -> Expr gamma t
ifThenElse = If 

(==) : Expr gamma TyInt -> Expr gamma TyInt -> Expr gamma TyBool
(==) = Op (==)

(<) : Expr gamma TyInt -> Expr gamma TyInt -> Expr gamma TyBool
(<) = Op (<)

(<*>) : Lazy (Expr gamma (TyFun a t)) -> Expr gamma a -> Expr gamma t
(<*>) = App 

pure : Expr gamma a -> Lazy (Expr gamma a)
pure x = x

instance Num (Expr gamma TyInt) where
    (+) = Op (+) 
    (-) = Op (-)
    (*) = Op (*)

    abs x = if (x < 0) then 0-x else x
    fromInteger x = Val (fromInteger x)

eId : Expr gamma (TyFun TyInt TyInt)
eId = expr (\x => x)

eAdd : Expr gamma (TyFun TyInt (TyFun TyInt TyInt))
eAdd = expr (\x, y => Op (+) x y)

eFac : Expr gamma (TyFun TyInt TyInt)
eFac = expr (\x => if (x == 0)
                      then 1
                      else [| eFac (x - 1) |] * x)

testFac : Int -> Int
testFac x = interp [] eFac x

main : IO ()
main = do putStr "Number: "
          x <- getLine
          printLn (testFac (cast (trim x)))

