import Data.Ratio
import Data.Digits

dig10 = digits 10

-- 57:
sqrtTwoMap x = 1 + (denominator xPlusOne) % (numerator xPlusOne)
    where xPlusOne = 1 + x

sqrtTwoEpansion = tail $ iterate sqrtTwoMap (1%1)

f57 = length $ filter
    (\x -> (length $ dig10 $ numerator x) > (length $ dig10 $ denominator x))
    $ take 1000 sqrtTwoEpansion
