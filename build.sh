#!/bin/sh
# Junta dados, motor e interface num único index.html
cd "$(dirname "$0")"
python3 -c "
sh=open('src/shell.html').read()
open('index.html','w').write(sh.replace('/*DATA*/',open('src/data.js').read()).replace('/*ENGINE*/',open('src/engine.js').read()).replace('/*UI*/',open('src/ui.js').read()))"
