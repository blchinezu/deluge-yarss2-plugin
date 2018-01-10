#!/bin/bash

if [ "$1" != "" ]; then
    PYTHON_BIN="$1"
else
    PYTHON_BIN="python"
fi

echo -e "\n > Setup DEV\n"

mkdir temp
export PYTHONPATH=./temp
$PYTHON_BIN setup.py build develop --install-dir ./temp
cp ./temp/YaRSS2.egg-link ~/.config/deluge/plugins
rm -fr ./temp
