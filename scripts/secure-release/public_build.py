import json, os, re
from pathlib import Path
values = json.loads(os.environ.get('PUBLIC_BUILD_ENV') or '{}')
if not isinstance(values, dict): raise ValueError('Expected public build values')
lines = []
for key, value in values.items():
    if not re.fullmatch(r'NEXT_PUBLIC_[A-Z0-9_]+', key) or not isinstance(value, str) or any(c in value for c in '\n\r'):
        raise ValueError('Only public browser configuration may enter the build')
    lines.append(key + '=' + json.dumps(value))
Path(os.environ.get('BUILD_ENV_TARGET', '.env.production.local')).write_text('\n'.join(lines) + '\n')
