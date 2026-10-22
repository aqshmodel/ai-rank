#!/usr/bin/env python3
"""Create a manifest-bound artifact without environment files or external links."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import stat
import tarfile
from release_archive import RELEASE, safe_name, file_digest


def collect(directory, prefix):
    root = Path(directory).resolve(strict=True)
    if not root.is_dir():
        raise ValueError('Component directory is missing')

    def walk(path, logical, ancestors):
        if path.name.startswith('.env') or path.name in {'.git', 'google-key', '.ssh', 'credentials', '__pycache__'}:
            return
        target = path.resolve(strict=True)
        if not target.is_relative_to(root):
            raise ValueError('Component symlink escapes its source')
        info = target.stat()
        if stat.S_ISDIR(info.st_mode):
            if target in ancestors:
                raise ValueError('Component symlink cycle')
            for child in sorted(target.iterdir()):
                yield from walk(child, logical / child.name, ancestors | {target})
        elif stat.S_ISREG(info.st_mode):
            name = str(logical)
            safe_name(name)
            yield name, target, 0o755 if info.st_mode & 0o111 else 0o644
        else:
            raise ValueError('Component contains a special file')

    yield from walk(root, Path(prefix), set())


def package(components, output, identity, lockfiles):
    files = {}
    sources = {}
    for component, directory in components.items():
        for name, source, mode in collect(directory, 'payload/' + component):
            if name in files:
                raise ValueError('Duplicate package path')
            with source.open('rb') as stream:
                digest = file_digest(stream)
            files[name] = {'sha256': digest, 'mode': mode}
            sources[name] = source
    manifest = {**identity, 'version': 1, 'lockfiles': {}, 'files': files}
    for name, source in lockfiles.items():
        safe_name(name)
        manifest['lockfiles'][name] = hashlib.sha256(Path(source).read_bytes()).hexdigest()
    with tarfile.open(output, 'w:gz', format=tarfile.PAX_FORMAT) as archive:
        value = json.dumps(manifest, sort_keys=True, separators=(',', ':')).encode()
        member = tarfile.TarInfo('manifest.json')
        member.mode, member.size = 0o644, len(value)
        archive.addfile(member, io.BytesIO(value))
        for name, source in sources.items():
            info = source.stat()
            member = tarfile.TarInfo(name)
            member.mode, member.size, member.mtime = files[name]['mode'], info.st_size, int(info.st_mtime)
            with source.open('rb') as stream:
                archive.addfile(member, stream)
    Path(output).chmod(0o600)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app', required=True)
    parser.add_argument('--repository', required=True)
    parser.add_argument('--component', action='append', required=True)
    parser.add_argument('--lockfile', action='append', default=[])
    parser.add_argument('--output', required=True)
    parser.add_argument('--go', action='store_true')
    args = parser.parse_args()
    run, attempt, commit = os.environ['GITHUB_RUN_ID'], os.environ['GITHUB_RUN_ATTEMPT'], os.environ['GITHUB_SHA']
    release = run + '-' + attempt + '-' + commit
    if not RELEASE.fullmatch(release):
        raise ValueError('GitHub release identity is invalid')
    identity = {'app': args.app, 'repository': args.repository, 'commit': commit, 'run_id': run,
                'run_attempt': attempt, 'release': release,
                'runtimes': {'node': '24.22.1', **({'go': '1.27.2'} if args.go else {})}}
    package(dict(x.split('=', 1) for x in args.component), args.output, identity,
            dict(x.split('=', 1) for x in args.lockfile))
    with Path(args.output).open('rb') as stream:
        digest = file_digest(stream)
    with Path(os.environ['GITHUB_OUTPUT']).open('a') as output:
        output.write('release=' + release + '\nsha256=' + digest + '\n')
    print(json.dumps({'release': release, 'sha256': digest}))


if __name__ == '__main__':
    main()
