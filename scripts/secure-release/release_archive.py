"""Validate release identities and complete archives before writing any payload."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import tarfile

RELEASE = re.compile(r'([1-9][0-9]{0,19})-([1-9][0-9]{0,3})-([0-9a-f]{40})\Z')
SHA256 = re.compile(r'[0-9a-f]{64}\Z')
MANIFEST_FIELDS = {'version', 'app', 'repository', 'commit', 'run_id', 'run_attempt',
                   'release', 'runtimes', 'lockfiles', 'files'}


def parse_submission(command):
    words = command.split(' ')
    if len(words) != 3 or words[0] != 'submit' or not RELEASE.fullmatch(words[1]) or not SHA256.fullmatch(words[2]):
        raise ValueError('Only a release submission is permitted')
    return words[1], words[2]


def safe_name(name):
    path = PurePosixPath(name)
    if (not name or name != str(path) or path.is_absolute() or '\\' in name
            or any(p in ('', '.', '..') for p in path.parts)
            or any(ord(c) < 32 or ord(c) == 127 for c in name)):
        raise ValueError('Unsafe archive path')
    if any(p.startswith('.env') or p in ('.git', 'google-key', '.ssh', 'credentials') for p in path.parts):
        raise ValueError('Credential or repository metadata is not a release payload')
    return path


def file_digest(stream):
    result = hashlib.sha256()
    for block in iter(lambda: stream.read(2 * 1024 * 1024), b''):
        result.update(block)
    return result.hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON field')
        result[key] = value
    return result


def validate_manifest(manifest, config, release_id):
    match = RELEASE.fullmatch(release_id)
    if (not match or not isinstance(manifest, dict) or set(manifest) != MANIFEST_FIELDS
            or manifest['version'] != 1 or manifest['app'] != config['app']
            or manifest['repository'] != config['repository'] or manifest['release'] != release_id
            or (manifest['run_id'], manifest['run_attempt'], manifest['commit']) != match.groups()):
        raise ValueError('Release identity does not match its authorized application')
    runtimes = manifest['runtimes']
    if not isinstance(runtimes, dict) or set(runtimes) - {'node', 'go', 'python'}:
        raise ValueError('Unknown runtime declaration')
    if 'python' in runtimes and runtimes['python'] != '3.14.4':
        raise ValueError('Unsupported Python runtime')
    if runtimes.get('node') != '24.22.1' or ('go' in runtimes and runtimes['go'] != '1.27.3'):
        raise ValueError('Unsupported release runtime')
    if not isinstance(manifest['lockfiles'], dict):
        raise ValueError('Lockfile checksums required')
    for name, digest in manifest['lockfiles'].items():
        safe_name(name)
        if not isinstance(digest, str) or not SHA256.fullmatch(digest):
            raise ValueError('Invalid lockfile checksum')
    files = manifest['files']
    if not isinstance(files, dict) or not files:
        raise ValueError('A release must declare its payload files')
    components = set()
    for name, record in files.items():
        path = safe_name(name)
        if len(path.parts) < 3 or path.parts[0] != 'payload' or path.parts[1] not in config['components']:
            raise ValueError('Payload component is outside this application')
        components.add(path.parts[1])
        if (not isinstance(record, dict) or set(record) != {'sha256', 'mode'}
                or not isinstance(record['sha256'], str) or not SHA256.fullmatch(record['sha256'])
                or record['mode'] not in (0o644, 0o755)):
            raise ValueError('Invalid payload file record')
    if components != set(config['components']):
        raise ValueError('Every configured component must be present')
    for protected in config.get('protected_payload_files', []):
        if protected in files:
            raise ValueError('A retained production file cannot be replaced by this release')


def extract_verified(archive_path, destination, config, release_id):
    destination = Path(destination)
    if destination.exists() or destination.is_symlink():
        raise ValueError('Release destination already exists')
    with tarfile.open(archive_path, 'r:gz') as archive:
        members = []
        names = set()
        expanded = 0
        manifest = None
        for member in archive:
            safe_name(member.name)
            if (member.name in names or not member.isfile() or member.mode not in (0o644, 0o755)
                    or member.size < 0 or member.linkname
                    or any(k.startswith(('GNU.sparse', 'SCHILY')) for k in member.pax_headers)):
                raise ValueError('Duplicate, link, special file or unsafe permissions in archive')
            names.add(member.name)
            members.append(member)
            expanded += member.size
            if expanded > config.get('max_expanded_bytes', 4 * 1024 ** 3) or len(members) > config.get('max_members', 200000):
                raise ValueError('Release exceeds resource limits')
            if member.name == 'manifest.json':
                if member.size > 32 * 1024 ** 2:
                    raise ValueError('Manifest exceeds resource limits')
                manifest = json.load(archive.extractfile(member), object_pairs_hook=unique_object)
        if manifest is None:
            raise ValueError('Manifest is missing')
        validate_manifest(manifest, config, release_id)
        if names != set(manifest['files']) | {'manifest.json'}:
            raise ValueError('Archive and manifest disagree')
        for member in members:
            if member.name == 'manifest.json':
                continue
            expected = manifest['files'][member.name]
            if member.mode != expected['mode'] or file_digest(archive.extractfile(member)) != expected['sha256']:
                raise ValueError('Payload checksum or mode mismatch')
        # Validation is complete before the first write; tarfile never extracts paths.
        destination.mkdir(mode=0o700)
        try:
            for member in members:
                target = destination / member.name
                target.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
                fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, member.mode)
                with os.fdopen(fd, 'wb') as output, archive.extractfile(member) as source:
                    shutil.copyfileobj(source, output, 2 * 1024 * 1024)
                target.chmod(member.mode)
            for directory, _, _ in os.walk(destination / 'payload'):
                Path(directory).chmod(0o755)
            return manifest
        except BaseException:
            shutil.rmtree(destination)
            raise
