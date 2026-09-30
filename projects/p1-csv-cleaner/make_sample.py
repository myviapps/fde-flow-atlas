"""make_sample.py: generate a small, fake, messy customer CSV for practice.

All names are invented. The same seed always gives the same file.
"""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

FIRST = ["Ana", "Ben", "Chen", "Dara", "Eli", "Fatima", "Goran", "Hana", "Ivan", "Juno"]
LAST = ["Silva", "Okafor", "Li", "Novak", "Haddad", "Kim", "Moreau", "Patel"]
COUNTRIES = ["US", "GB", "IN", "DE", "BR", "JP"]
FIELDS = ["customer_id", "name", "email", "signup_date", "country"]

# Hand-written problem rows, so every rule in cleaner.py gets exercised.
MESSY_ROWS = [
    ["21", "  Rosa   Diaz ", " ROSA.DIAZ@Example.COM ", "2024/03/05", "us"],  # fixable
    ["22", "Omar Farouk", "", "2024-02-11", "EG"],                            # missing email
    ["23", "Lena Berg", "lena.berg(at)example.com", "2024-01-20", "SE"],      # invalid email
    ["24", "Tom Reyes", "tom.reyes@example.com", "31/02/2024", "MX"],        # impossible date
    ["25", "Mia Wong", "mia.wong@example.com", "yesterday", "SG"],           # not a date
    ["26", "Kai Lund", "kai.lund@example.com", "2099-01-01", "NO"],          # future date
    ["27", "", "noname@example.com", "2024-04-02", "US"],                    # missing name
    ["28", "Zoe Adams", "zoe.adams@example.com", "2024-05-06", "USA"],       # bad country
    ["abc", "Sam Cole", "sam.cole@example.com", "2024-05-07", "CA"],         # bad id
    ["3", "Duplicate Id", "dup.id@example.com", "2024-05-08", "US"],         # duplicate id
    ["29", "Rosa Diaz", "rosa.diaz@example.com", "2024-03-05", "US"],        # duplicate email
    ["30", "Ivy Nash", "ivy.nash@example.com", "05 Jun 2024", "gb"],         # fixable
]


def make_rows(n=20, seed=42):
    rng = random.Random(seed)
    rows = []
    for i in range(1, n + 1):
        first, last = rng.choice(FIRST), rng.choice(LAST)
        signup = date(2023, 1, 1) + timedelta(days=rng.randint(0, 540))
        email = f"{first}.{last}{i}@example.com".lower()
        rows.append([str(i), f"{first} {last}", email, signup.isoformat(), rng.choice(COUNTRIES)])
    rows.extend(MESSY_ROWS)
    rows.append(list(rows[6]))  # an exact duplicate of customer 7
    return rows


def write_sample(path="data/customers_messy.csv", n=20, seed=42):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(FIELDS)
        writer.writerows(make_rows(n, seed))
    return path


if __name__ == "__main__":
    out = write_sample()
    print(f"Wrote {out}")
