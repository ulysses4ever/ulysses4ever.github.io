#!/bin/bash

if [ -z "$1" ]; then
    echo "ERROR: no file name"
    exit
fi

as88 "${1}" && s88 "${1}"
