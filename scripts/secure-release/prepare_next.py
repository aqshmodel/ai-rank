import sys, shutil
from pathlib import Path
source, destination = map(Path, sys.argv[1:])
standalone = source / '.next/standalone'
servers = [p for p in standalone.rglob('server.js') if 'node_modules' not in p.relative_to(standalone).parts]
if len(servers) != 1: raise ValueError('Ambiguous standalone entry point')
shutil.copytree(servers[0].parent, destination, dirs_exist_ok=True)
if servers[0].parent != standalone and (standalone/'node_modules').exists():
    shutil.copytree(standalone/'node_modules', destination/'node_modules', dirs_exist_ok=True, symlinks=True)
shutil.copytree(source/'.next/static', destination/'.next/static', dirs_exist_ok=True)
if (source/'public').exists(): shutil.copytree(source/'public', destination/'public', dirs_exist_ok=True)
if (source/'content').exists(): shutil.copytree(source/'content', destination/'content', dirs_exist_ok=True)
