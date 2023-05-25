
data Elem : a -> List a -> Type where
     Here : Elem x (x :: xs)
     There : Elem x xs -> Elem x (y :: xs)

isElem_example : Elem 3 [1..4]
isElem_example = There (There Here)

checkElem_nil : Elem x [] -> Void
checkElem_nil Here impossible 
checkElem_nil (There p) impossible 

checkElem_cons : ((x = y) -> Void) -> (Elem x xs -> Void) -> Elem x (y :: xs) -> Void
checkElem_cons f g Here = f Refl
checkElem_cons f g (There x) = g x

checkElem : DecEq a => (x : a) -> (xs : List a) -> Dec (Elem x xs)
checkElem x [] = No (checkElem_nil)
checkElem x (y :: xs) with (decEq x y)
  checkElem x (x :: xs) | (Yes Refl) = Yes Here
  checkElem x (y :: xs) | (No contra) with (checkElem x xs)
    checkElem x (y :: xs) | (No contra) | (Yes prf) = Yes (There prf)
    checkElem x (y :: xs) | (No contra) | (No f) = No (checkElem_cons contra f)

