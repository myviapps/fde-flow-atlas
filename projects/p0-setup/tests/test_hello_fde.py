import subprocess
from types import SimpleNamespace

import hello_fde as h


def test_parse_version_finds_numbers():
    assert h.parse_version("git version 2.43.0") == "2.43.0"
    assert h.parse_version("Docker version 27.1.1, build 6312585") == "27.1.1"
    assert h.parse_version("1.95.3\nabc123\nx64") == "1.95.3"
    assert h.parse_version("no digits here") is None
    assert h.parse_version(None) is None


def test_check_python_passes_and_fails():
    assert h.check_python((3, 12), version_info=(3, 12, 4)).ok
    old = h.check_python((3, 12), version_info=(3, 9, 1))
    assert not old.ok
    assert "need 3.12+" in old.detail


def test_check_tool_missing():
    result = h.check_tool("git", which=lambda name: None)
    assert not result.ok
    assert result.detail == "not found on PATH"


def test_check_tool_parses_fake_output():
    def fake_runner(cmd, **kwargs):
        return SimpleNamespace(stdout="git version 2.45.1\n", stderr="")

    result = h.check_tool("git", which=lambda n: "/usr/bin/git", runner=fake_runner)
    assert result.ok
    assert result.detail == "2.45.1"


def test_check_tool_handles_crash():
    def broken_runner(cmd, **kwargs):
        raise subprocess.TimeoutExpired(cmd, 15)

    result = h.check_tool("docker", required=False,
                          which=lambda n: "/usr/bin/docker", runner=broken_runner)
    assert not result.ok and not result.required
    assert "failed to run" in result.detail


def test_check_venv():
    assert h.check_venv(prefix="/proj/.venv", base_prefix="/usr").ok
    assert not h.check_venv(prefix="/usr", base_prefix="/usr").ok


def test_env_key_is_masked():
    result = h.check_env_key("ANTHROPIC_API_KEY", env={"ANTHROPIC_API_KEY": "sk-ant-abcdef123456"})
    assert result.ok
    assert "abcdef123456" not in result.detail
    missing = h.check_env_key("ANTHROPIC_API_KEY", env={})
    assert not missing.ok and not missing.required


def test_format_result_tags():
    assert h.format_result(h.CheckResult("git", True, "2.4")).startswith("[OK  ]")
    assert h.format_result(h.CheckResult("git", False, "x")).startswith("[FAIL]")
    assert h.format_result(h.CheckResult("docker", False, "x", required=False)).startswith("[WARN]")
