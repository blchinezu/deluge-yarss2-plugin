#!/bin/bash
# Used to quickly restart the server during development

if [ "$1" != "" ]; then
    PYTHON_BIN="$1"
else
    PYTHON_BIN="python"
fi

echo -e "\n > Kill deluged\n"
killall deluged

echo -e "\n > Kill deluge-web\n"
killall deluge-web

echo -e "\n > Setup DIST\n"
$PYTHON_BIN setup.py bdist_egg

echo -e "\n > Start deluged\n"
deluged -l ~/deluged.log -L debug &

echo -e "\n > Start deluge-web\n"
deluge-web -p 1234 -l ~/deluge-web.log -L debug &

echo -e "\n > Done\n"
