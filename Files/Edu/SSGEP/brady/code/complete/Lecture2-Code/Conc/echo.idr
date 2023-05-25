import Channels

data EchoParties = A | B

echo : Protocol [A, B] ()
echo = do msg <- Send A B String
          Send B A Nat
          Send B A (Literal msg)

echo_server : Server B A echo
echo_server chan
    = do (True @@ chan) <- listen chan
             | (False @@ chan) => echo_server chan
         (msg @@ chan) <- recv chan
         chan <- send (length msg) chan
         chan <- send (MkLit msg) chan
         let chan = reset chan
         echo_server chan

echo_client : Client A B echo
echo_client s
    = do chan <- connect s
         print "Message: "
         msg <- getLine
         chan <- send msg chan
         (len @@ chan) <- recv chan
         (MkLit msg @@ chan) <- recv chan
         print ("ECHO: " ++ msg ++ " (" ++ show len ++ ")\n")
         close chan

conc_main : Conc A ()
conc_main = do h <- start_server echo echo_server
               client_loop h 
  where client_loop h = do echo_client h
                           client_loop h

main : IO ()
main = exec conc_main

