"""cleaner.py: validate a messy customer CSV into clean.csv and rejects.csv.

Usage:  python cleaner.py data/customers_messy.csv --out-dir output
"""
import argparse
import csv
import re
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path

FIELDS = ["customer_id", "name", "email", "signup_date", "country"]
DATE_FORMATS = ["%Y-%m-%d", "%Y/%m/%d", "%d %b %Y"]  # unambiguous formats only
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")


class RowError(ValueError):
    """A row problem. kind is a short category used in the summary."""

    def __init__(self, kind, detail=""):
        self.kind = kind
        super().__init__(f"{kind}: {detail}" if detail else kind)


def parse_date(text, today=None):
    today = today or date.today()
    for fmt in DATE_FORMATS:
        try:
            parsed = datetime.strptime(text, fmt).date()
        except ValueError:
            continue
        if parsed > today:
            raise RowError("future date", text)
        return parsed.isoformat()
    raise RowError("bad date", repr(text))


def normalize_email(text):
    email = text.lower()
    if not email:
        raise RowError("missing email")
    if not EMAIL_RE.match(email):
        raise RowError("invalid email", repr(email))
    return email


def clean_row(raw, today=None):
    """Return a cleaned dict, or raise RowError for the first problem found."""
    row = {k: (raw.get(k) or "").strip() for k in FIELDS}
    if not row["customer_id"].isdigit():
        raise RowError("bad id", repr(row["customer_id"]))
    row["customer_id"] = str(int(row["customer_id"]))  # "007" -> "7"
    row["name"] = " ".join(row["name"].split())         # collapse inner spaces
    if not row["name"]:
        raise RowError("missing name")
    row["email"] = normalize_email(row["email"])
    row["signup_date"] = parse_date(row["signup_date"], today)
    country = row["country"].upper()
    if len(country) != 2 or not country.isalpha():
        raise RowError("bad country", repr(row["country"]))
    row["country"] = country
    return row


def clean_rows(rows, today=None):
    """Split rows into (clean, rejects). Duplicates are checked after cleaning."""
    clean, rejects = [], []
    seen_ids, seen_emails = {}, {}
    for line_no, raw in enumerate(rows, start=2):  # line 1 is the header
        try:
            row = clean_row(raw, today)
            if row["customer_id"] in seen_ids:
                raise RowError("duplicate id", f"first seen on line {seen_ids[row['customer_id']]}")
            if row["email"] in seen_emails:
                raise RowError("duplicate email", f"first seen on line {seen_emails[row['email']]}")
        except RowError as err:
            rejects.append({**{k: raw.get(k, "") for k in FIELDS},
                            "line": line_no, "kind": err.kind, "reason": str(err)})
            continue
        seen_ids[row["customer_id"]] = line_no
        seen_emails[row["email"]] = line_no
        clean.append(row)
    return clean, rejects


def write_csv(path, rows, fields):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def run(input_path, out_dir, today=None):
    with open(input_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        missing = [c for c in FIELDS if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(f"error: input is missing columns: {', '.join(missing)}")
        rows = list(reader)
    clean, rejects = clean_rows(rows, today)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    write_csv(out_dir / "clean.csv", clean, FIELDS)
    write_csv(out_dir / "rejects.csv", rejects, ["line", *FIELDS, "kind", "reason"])
    return len(rows), clean, rejects


def main(argv=None):
    parser = argparse.ArgumentParser(description="Clean a messy customer CSV.")
    parser.add_argument("input", help="path to the messy CSV")
    parser.add_argument("--out-dir", default="output", help="folder for clean.csv and rejects.csv")
    args = parser.parse_args(argv)
    if not Path(args.input).is_file():
        parser.error(f"file not found: {args.input}")

    total, clean, rejects = run(args.input, args.out_dir)
    print(f"Read {total} rows from {args.input}")
    print(f"  clean:   {len(clean):>3}  -> {Path(args.out_dir) / 'clean.csv'}")
    print(f"  rejects: {len(rejects):>3}  -> {Path(args.out_dir) / 'rejects.csv'}")
    if rejects:
        print("Reject reasons:")
        for kind, count in Counter(r["kind"] for r in rejects).most_common():
            print(f"  {kind:<16} {count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
