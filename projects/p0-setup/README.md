# Setup: your dev environment

## Goal
Install the tools every later project uses, then run `hello_fde.py`, a small script that checks each tool and prints its version.

## What you'll learn
- Installing Python 3.12, Git, VS Code (with the Python extension) and, optionally, Docker Desktop
- Creating and activating a virtual environment so each project has its own packages
- Keeping API keys out of code with a `.env` file and python-dotenv
- Writing testable code: each check is a small function, and tests pass in fakes instead of calling real tools

## Prerequisites
A Windows, macOS or Linux computer and permission to install software.

## Install the tools
| Tool | Windows (PowerShell) | macOS (Homebrew) | Linux (Debian/Ubuntu) |
|---|---|---|---|
| Python 3.12 | `winget install Python.Python.3.12` | `brew install python@3.12` | `sudo apt install python3.12 python3.12-venv` (or use pyenv / deadsnakes) |
| Git | `winget install Git.Git` | `brew install git` | `sudo apt install git` |
| VS Code | `winget install Microsoft.VisualStudioCode` | `brew install --cask visual-studio-code` | download the .deb from code.visualstudio.com |
| Docker (optional) | `winget install Docker.DockerDesktop` | `brew install --cask docker` | `sudo apt install docker.io` or Docker Desktop |

In VS Code, open the Extensions view and install "Python" (by Microsoft). On macOS run "Shell Command: Install 'code' command in PATH" from the command palette.

Then tell Git who you are:
```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Setup
macOS / Linux:
```
cd p0-setup
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Windows PowerShell:
```
cd p0-setup
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```
If PowerShell blocks the activate script, run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Put real keys only in `.env`. `.gitignore` already excludes it, so it never reaches Git.

## Run
```
python hello_fde.py
```
Exit code 0 means every required tool was found. `code`, `docker` and the API key are optional and show WARN when missing.

## Test
```
python -m pytest -q
```

## Stretch goals
- Add a `--json` flag that prints the results as JSON
- Check for `uv` or `node` too
- Read the minimum Python version from an environment variable
- Add a GitHub Actions workflow that runs the tests on every push
