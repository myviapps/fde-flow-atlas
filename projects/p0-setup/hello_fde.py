"""hello_fde.py: check that your FDE dev environment is ready.

Run it with:  python hello_fde.py
Exit code is 0 when every required tool is found, 1 otherwise.
"""
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass

VERSION_RE = re.compile(r"(\d+\.\d+(?:\.\d+)?)")


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str
    required: bool = True


def parse_version(text):
    """Pull the first version number like 2.43.0 out of a tool's output."""
    match = VERSION_RE.search(text or "")
    return match.group(1) if match else None


def check_python(min_version=(3, 12), version_info=None):
    v = version_info or sys.version_info
    found = f"{v[0]}.{v[1]}.{v[2]}"
    ok = (v[0], v[1]) >= min_version
    need = f"{min_version[0]}.{min_version[1]}+"
    return CheckResult("python", ok, found if ok else f"{found} (need {need})")


def check_tool(name, args=("--version",), required=True,
               which=shutil.which, runner=subprocess.run):
    """Find a command on PATH, run it with --version, and parse the output."""
    path = which(name)
    if path is None:
        return CheckResult(name, False, "not found on PATH", required)
    try:
        out = runner([path, *args], capture_output=True, text=True, timeout=15)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return CheckResult(name, False, f"failed to run: {exc}", required)
    version = parse_version((out.stdout or "") + (out.stderr or ""))
    return CheckResult(name, version is not None, version or "no version in output", required)


def check_venv(prefix=None, base_prefix=None):
    """A virtual environment is active when sys.prefix differs from sys.base_prefix."""
    prefix = prefix or sys.prefix
    base_prefix = base_prefix or sys.base_prefix
    active = prefix != base_prefix
    detail = "active" if active else "not active (run the activate script)"
    return CheckResult("venv", active, detail)


def check_package(module_name):
    try:
        module = __import__(module_name)
    except ImportError:
        return CheckResult(module_name, False, "not installed (pip install -r requirements.txt)")
    return CheckResult(module_name, True, getattr(module, "__version__", "installed"))


def mask(secret):
    """Never print a whole key. Show only a short prefix."""
    return secret[:6] + "..." if len(secret) > 10 else "***"


def check_env_key(key="ANTHROPIC_API_KEY", env=None):
    env = os.environ if env is None else env
    value = env.get(key, "").strip()
    detail = f"set ({mask(value)})" if value else "not set (optional: copy .env.example to .env)"
    return CheckResult(key, bool(value), detail, required=False)


def run_all():
    try:
        from dotenv import load_dotenv
        load_dotenv()  # reads .env in the current folder into os.environ
    except ImportError:
        pass
    return [
        check_python(),
        check_venv(),
        check_tool("git"),
        check_tool("code", required=False),    # VS Code command line launcher
        check_tool("docker", required=False),
        check_package("dotenv"),
        check_env_key(),
    ]


def format_result(r):
    if r.ok:
        tag = "OK  "
    else:
        tag = "FAIL" if r.required else "WARN"
    return f"[{tag}] {r.name:<18} {r.detail}"


def main():
    print("Hello, FDE! Checking your environment...\n")
    results = run_all()
    for r in results:
        print(format_result(r))
    failed = [r.name for r in results if r.required and not r.ok]
    print()
    if failed:
        print("Fix these before moving on: " + ", ".join(failed))
        return 1
    print("All required tools found. You are ready to build.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
