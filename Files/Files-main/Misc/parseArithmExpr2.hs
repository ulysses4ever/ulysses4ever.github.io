import Text.ParserCombinators.Parsec
import Text.ParserCombinators.Parsec.Token --qualified as T
import Text.ParserCombinators.Parsec.Combinator
import Data.Char (digitToInt, isSpace, isLower)
import Data.List

expr    = term   `chainl1` mulop
term    = factor `chainl1` addop
factor  = parens expr <|> integer

mulop   =   do{ symbol "*"; return (*)   }
      <|> do{ symbol "/"; return (div) }

addop   =   do{ symbol "+"; return (+) }
      <|> do{ symbol "-"; return (-) }

