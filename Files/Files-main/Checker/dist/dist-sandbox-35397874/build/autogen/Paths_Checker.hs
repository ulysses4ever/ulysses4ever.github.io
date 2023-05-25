module Paths_Checker (
    version,
    getBinDir, getLibDir, getDataDir, getLibexecDir,
    getDataFileName, getSysconfDir
  ) where

import qualified Control.Exception as Exception
import Data.Version (Version(..))
import System.Environment (getEnv)
import Prelude

catchIO :: IO a -> (Exception.IOException -> IO a) -> IO a
catchIO = Exception.catch

version :: Version
version = Version [0,1] []
bindir, libdir, datadir, libexecdir, sysconfdir :: FilePath

bindir     = "/home/ulysses/public_html/Checker/.cabal-sandbox/bin"
libdir     = "/home/ulysses/public_html/Checker/.cabal-sandbox/lib/x86_64-linux-ghc-7.4.1/Checker-0.1"
datadir    = "/home/ulysses/public_html/Checker/.cabal-sandbox/share/x86_64-linux-ghc-7.4.1/Checker-0.1"
libexecdir = "/home/ulysses/public_html/Checker/.cabal-sandbox/libexec"
sysconfdir = "/home/ulysses/public_html/Checker/.cabal-sandbox/etc"

getBinDir, getLibDir, getDataDir, getLibexecDir, getSysconfDir :: IO FilePath
getBinDir = catchIO (getEnv "Checker_bindir") (\_ -> return bindir)
getLibDir = catchIO (getEnv "Checker_libdir") (\_ -> return libdir)
getDataDir = catchIO (getEnv "Checker_datadir") (\_ -> return datadir)
getLibexecDir = catchIO (getEnv "Checker_libexecdir") (\_ -> return libexecdir)
getSysconfDir = catchIO (getEnv "Checker_sysconfdir") (\_ -> return sysconfdir)

getDataFileName :: FilePath -> IO FilePath
getDataFileName name = do
  dir <- getDataDir
  return (dir ++ "/" ++ name)
