module Main

import Effects
import Effect.State
import Effect.Exception
import Effect.Random
import Effect.StdIO

data Expr = Var String
          | Val Integer
          | Add Expr Expr

Env : Type
Env = List (String, Integer)

ExprProg : Type -> Type
ExprProg t = Eff t [EXCEPTION String, STATE Env]

getRnd : Integer -> { [RND] } Eff Integer 
getRnd upper = do val <- rndInt 0 upper
                  return val

eval : Expr -> ExprProg Integer
eval (Var x) 
   = do vs <- get
        case lookup x vs of
             Nothing => raise ("No such variable " ++ x)
             Just val => return val
eval (Val x) = return x
eval (Add l r) = do l' <- eval l
                    r' <- eval r
                    return (l' + r')

testExpr : Expr
testExpr = Add (Add (Var "foo") (Val 42)) (Val 100)

runEval : List (String, Integer) -> Expr -> IO Integer
runEval args expr = run (eval' expr)
  where eval' : Expr -> ExprProg Integer
        eval' e = do put args
                     eval e

main : IO ()
main = do putStr "Number: "
          x <- getLine
          val <- runEval [("foo", cast x)] testExpr
          putStrLn $ "Answer: " ++ show val

