# Project 1: CSV data cleaner

## Goal
A command-line tool that reads a messy customer CSV, validates every row, writes `clean.csv` and `rejects.csv` (each reject with a line number and a reason), and prints a summary.

## What you'll learn
- argparse for a real CLI with help text and clear errors
- The csv module (DictReader / DictWriter) and date parsing with datetime
- Validation that explains itself: every rejected row says why
- Duplicate detection after normalizing (trim, lowercase)
- pytest, including parametrized tests and temporary folders

## Prerequisites
Project 0 (Python 3.12, a virtual environment, VS Code).

## Setup
```
cd p1-csv-cleaner
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```
python make_sample.py                                   # writes data/customers_messy.csv
python cleaner.py data/customers_messy.csv --out-dir output
```
Open `output/rejects.csv` to see each rejected row and its reason.

Rules: `customer_id` must be a number, `name` is required, `email` is required and must look valid (lowercased), `signup_date` must be YYYY-MM-DD, YYYY/MM/DD or "05 Jun 2024" and not in the future (output is ISO), `country` must be a 2-letter code (uppercased). The first row with a given id or email wins; later ones are rejected as duplicates.

Note: the "05 Jun 2024" format uses English month names, which is the default locale for Python scripts.

## Test
```
python -m pytest -q
```

## Stretch goals
- Add `--strict` that exits with code 1 if any row is rejected (useful in a pipeline)
- Accept an ambiguous date format such as DD/MM/YYYY behind a `--day-first` flag
- Stream rows instead of loading the whole file, and test with 1 million rows
- Rewrite validation with pydantic and compare the code
