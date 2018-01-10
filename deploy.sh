#!/bin/bash

if [ "$1" != "" ]; then
    PYTHON_BIN="$1"
else
    PYTHON_BIN="python2"
fi

rm -f ~/.config/deluge/plugins/YaRSS2*

bash create_dev_link.sh "$PYTHON_BIN"
bash restart_deluged.sh "$PYTHON_BIN"