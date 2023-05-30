##
# Artem's Homepage
#
# @file
# @version 0.1

all: deps build

build:
	nix-shell

deps:
	nix-shell -p bundler -p bundix --run 'bundler update; bundler lock; bundler package --no-install --path vendor; bundix; rm -rf vendor .bundle'

# end
