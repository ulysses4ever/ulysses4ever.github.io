{ nixpkgs ? import <nixpkgs> {} }:
nixpkgs.pkgsStatic.haskellPackages.developPackage { root = ./.; }

