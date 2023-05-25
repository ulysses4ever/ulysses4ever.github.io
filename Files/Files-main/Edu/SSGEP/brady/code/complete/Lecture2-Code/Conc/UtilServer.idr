import Channels

data UtilCmd = Mul | StrLen | Uptime

data UtilParties = A | B

utils : Protocol [A, B] ()
utils = do cmd <- Send A B UtilCmd
           case cmd of
                Mul => do Send A B (Int, Int)
                          Send B A Int
                StrLen => do Send A B String
                             Send B A Nat
                Uptime => Send B A Int

utils_server : Int -> Server B A utils
utils_server uptime chan 
    = do (True @@ chan) <- listen chan
             | (False @@ chan) => utils_server uptime chan
         (cmd @@ chan) <- recv chan
         case cmd of
              Mul => do ((x, y) @@ chan) <- recv chan 
                        chan <- send (x * y) chan
                        let chan = reset chan
                        utils_server (uptime + 1) chan
              StrLen => do (str @@ chan) <- recv chan
                           chan <- send (length str) chan
                           let chan = reset chan
                           utils_server (uptime + 1) chan
              Uptime => do chan <- send uptime chan
                           let chan = reset chan
                           utils_server (uptime + 1) chan

multiply : RChannel B (protoAs A utils) -> Int -> Int -> Conc A Int
multiply s x y = do chan <- connect s
                    chan <- send Mul chan
                    chan <- send (x, y) chan
                    (res @@ chan) <- recv chan
                    close chan
                    Return res

conc_main : Conc A ()
conc_main = do h <- start_server utils (utils_server 0)
               x <- multiply h 6 6
               print (show x ++ "\n")

main : IO ()
main = exec conc_main

