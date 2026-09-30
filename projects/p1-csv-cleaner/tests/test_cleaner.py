import csv
from datetime import date

import pytest

import cleaner
from make_sample import write_sample

TODAY = date(2025, 1, 1)  # fixed "today" so tests never depend on the calendar


def good(**overrides):
    row = {"customer_id": "1", "name": "Ana Silva", "email": "ana@example.com",
           "signup_date": "2024-03-05", "country": "us"}
    row.update(overrides)
    return row


def test_clean_row_normalizes_values():
    row = cleaner.clean_row(good(customer_id="007", name="  Ana   Silva ",
                                 email=" ANA@Example.COM ", signup_date="2024/03/05"), TODAY)
    assert row == {"customer_id": "7", "name": "Ana Silva", "email": "ana@example.com",
                   "signup_date": "2024-03-05", "country": "US"}


@pytest.mark.parametrize("field,value,kind", [
    ("email", "", "missing email"),
    ("email", "ana(at)example.com", "invalid email"),
    ("signup_date", "31/02/2024", "bad date"),
    ("signup_date", "yesterday", "bad date"),
    ("signup_date", "2030-01-01", "future date"),
    ("name", "   ", "missing name"),
    ("country", "USA", "bad country"),
    ("customer_id", "abc", "bad id"),
])
def test_clean_row_rejects(field, value, kind):
    with pytest.raises(cleaner.RowError) as err:
        cleaner.clean_row(good(**{field: value}), TODAY)
    assert err.value.kind == kind


def test_duplicates_keep_first_and_report_line():
    rows = [good(), good(customer_id="1", email="other@example.com"),
            good(customer_id="2", email="ANA@example.com")]
    clean, rejects = cleaner.clean_rows(rows, TODAY)
    assert len(clean) == 1
    assert [r["kind"] for r in rejects] == ["duplicate id", "duplicate email"]
    assert rejects[0]["line"] == 3
    assert "first seen on line 2" in rejects[0]["reason"]


def test_invalid_row_does_not_block_a_later_valid_one():
    rows = [good(email=""), good(email="ana@example.com")]
    clean, rejects = cleaner.clean_rows(rows, TODAY)
    assert len(clean) == 1 and len(rejects) == 1


def test_end_to_end_on_sample(tmp_path, capsys):
    src = write_sample(tmp_path / "messy.csv")
    out = tmp_path / "out"
    assert cleaner.main([str(src), "--out-dir", str(out)]) == 0

    with open(out / "clean.csv", newline="") as f:
        clean = list(csv.DictReader(f))
    with open(out / "rejects.csv", newline="") as f:
        rejects = list(csv.DictReader(f))
    assert len(clean) == 22
    assert len(rejects) == 11
    assert all(r["reason"] for r in rejects)
    assert len({r["email"] for r in clean}) == len(clean)  # no duplicate emails survive
    assert "Read 33 rows" in capsys.readouterr().out


def test_missing_columns_is_a_clear_error(tmp_path):
    bad = tmp_path / "bad.csv"
    bad.write_text("id,name\n1,Ana\n")
    with pytest.raises(SystemExit) as exc:
        cleaner.run(bad, tmp_path / "out")
    assert "missing columns" in str(exc.value)


def test_missing_file_exits_with_usage_error(tmp_path):
    with pytest.raises(SystemExit) as exc:
        cleaner.main([str(tmp_path / "nope.csv")])
    assert exc.value.code == 2
