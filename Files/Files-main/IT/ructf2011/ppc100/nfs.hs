a 0 = 0
a p = 2 * p - 1 + (a(p - 1))
b p1 p2 p3 = p1 (p2 p3)
c p1 p2 p3 = p1 p3 p2
d p1 p2 p3 = p1 p3 (p2 p3)
e p = p (e p)
f = e (b (g ((==) 0) (\p -> 1)) (b (d (*)) (c b pred))) where g p1 p2 p3 p4 = if p1 p4 then p2 p4 else p3 p4
h n = if n < 1 then 0 else if n == 1 then 1 else h $ n - 1

calcme n = sum [h(n - (sum [(a $ f $ k - 1) - (k * ((a $ f $ k - 1) `div` k)) | k <- [1..m]])) | m <- [0..a n + 1]]
main = print $ calcme 907339487
