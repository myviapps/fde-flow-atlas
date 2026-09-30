# AUDIT6_1: deep per-topic audit (Module 0 foundations + genesis, slg)

Scope: computers terminal python1 python2 pandas dataformats internet dbbasics mlbasics mathbasics linux frontend oop asyncpy pytooling stats genesis slg.
Method: read each lesson (lessons_*.json), every patch_*.json entry and the concept (ideas, traps, qa). Before calling anything missing I grepped all lessons_*.json and patch_*.json. I ran the numeric examples in mlbasics, mathbasics, stats, pandas, dataformats and slg, and they reproduce except where a FIX says otherwise. I type-checked the frontend Express/TypeScript patch with tsc 5 (express 5.2, @types/express 5.0) and it compiles cleanly.
Atlas-wide gaps found along the way: Jupyter notebooks appear in no lesson at all. Client-side streaming of LLM output is also absent everywhere (fastapi covers only the server side). Confidence intervals on small eval sets are missing too (evals has no CI or bootstrap).

### computers
- ADD SUBTOPIC: Bits, bytes and how data is represented: binary, a byte = 8 bits, KB/MB/GB versus KiB/MiB/GiB, and that text, numbers and images are all bytes. Point ahead to dataformats (encodings, float precision).
- ADD MICRO: The three core parts: CPU, RAM, storage -> CPU cores. Several cores let several processes run at the same moment. This sets up the GIL and ProcessPool material in asyncpy.
- ADD MICRO: The three core parts: CPU, RAM, storage -> the GPU and its separate memory (VRAM): what they are, and why LLM inference and training need them. Today mlbasics only says "specialised chips called GPUs".
- ADD MICRO: Interpreted Python versus compiled languages -> CPU architecture: x86_64 versus ARM64 (Apple Silicon, AWS Graviton). Explain why a binary or Docker image built on a Mac can fail on a server with "exec format error". Show `uname -m` and `platform.machine()`.
- ADD MICRO: The operating system -> virtual machines and containers as "a computer inside a computer", in one paragraph, so deploy/cloud do not arrive cold.
- FIX: `gb = 1024 ** 3   # bytes in one gigabyte` -> 1024**3 is a gibibyte (GiB). Say "1 GiB, which OS tools often label GB; disk makers use 1 GB = 1,000,000,000 bytes". This also explains why a "512 GB" disk shows about 476.

### terminal
- ADD SUBTOPIC: Working with files from the shell: touch, cat, head/tail, less, cp, mv, rm and rm -r (no recycle bin: deleted is gone), wildcards (*.csv), quoting paths that contain spaces, and the Windows equivalents (copy, move, del / PowerShell aliases).
- ADD SUBTOPIC: Output, redirection and exit codes: stdout versus stderr, > versus >> (overwrite versus append), | pipes, 2>&1, exit codes ($?, 0 means success), and chaining with && and ||. linux and the cron line use these but no lesson explains them.
- ADD MICRO: What a terminal and shell are -> options and flags (ls -l, --help, man ls), Ctrl+C to stop a running command, Up arrow and Ctrl+R to search history, clear, and "command not found" meaning PATH (which/where).
- ADD MICRO: Environment variables -> make a variable permanent (~/.zshrc, ~/.bashrc, setx or the PowerShell profile). Show .env files loaded with python-dotenv, and always add .env to .gitignore.
- ADD MICRO: pip and virtual environments -> check that the venv is active with `which python` / `where python`. Cover the Windows "running scripts is disabled" error on Activate.ps1 (Set-ExecutionPolicy -Scope CurrentUser RemoteSigned), and mention WSL for Windows users.
- ADD MICRO: Folders, paths and where you are -> Windows backslashes inside Python strings ("C:\new" turns \n into a newline). Use raw strings or pathlib.

### python1
- ADD SUBTOPIC: Working with strings: indexing and slicing, len, lower/upper/strip/split/join/replace/startswith, `in`, format specs in f-strings ({x:.2f}, {n:,}), and escape characters (\n, \t, \\). Customer data cleaning and pandas .str both assume this.
- ADD MICRO: Variables and the four basic types -> None, and truthiness (0, "", [] and None count as False). Use `x is None`, not `== None`.
- ADD MICRO: Variables and the four basic types -> the operators // (floor division), % (remainder) and **. Show that 0.1 + 0.2 != 0.3 and point to Decimal in dataformats. Show that round() uses banker's rounding (round(2.5) == 2), which matters for money.
- ADD MICRO: Functions: parameters and return values -> default and keyword arguments (def f(rate, nights=1)), local versus global scope, docstrings, and a first look at type hints.
- ADD MICRO: Functions: parameters and return values -> imports and the standard library (import math, from datetime import date), and the fact that `pip install` is only for third-party packages.
- ADD MICRO: Errors and reading a traceback -> raising your own error (raise ValueError("...")), `finally`, catching specific exceptions instead of a bare `except:`, and `except ValueError as e: print(e)`.

### python2
- ADD SUBTOPIC: Nested data from APIs: lists of dicts and dicts of lists, reaching into nested JSON (data["items"][0]["price"]), safe access with chained .get, and flattening into rows (loop, or pd.json_normalize). This is the shape of almost every API response an FDE handles.
- ADD MICRO: Lists and tuples -> sorted() versus .sort(), key=lambda r: r["amount"], reverse=True; enumerate and zip.
- ADD MICRO: Lists and tuples -> mutability and aliasing: `b = a` shares one list, so use a.copy() or copy.deepcopy.
- ADD MICRO: Dicts and sets -> collections.Counter for counting, defaultdict(list) for grouping, and set operations (& | -) for "customers in A but not B".
- ADD MICRO: Reading and writing files, and JSON -> always pass encoding="utf-8" (the Windows default is cp1252, see dataformats). Use pathlib.Path for cross-OS paths and Path("data").glob("*.csv") to loop over a folder of exports.
- ADD MICRO: Reading and writing files, and JSON -> json.dumps on datetime and Decimal raises TypeError. Show default=str or convert first.

### pandas
- ADD SUBTOPIC: Sorting, reshaping and stacking: sort_values, value_counts, nlargest, rename, set_index and reset_index (groupby output has the key as index), melt for wide Excel exports with one column per month, and concat to stack twelve monthly files.
- ADD SUBTOPIC: Excel in and out for business users: read_excel(sheet_name=None, skiprows=, header=) for multi-sheet files with title rows and merged headers, writing several sheets with pd.ExcelWriter, dates arriving as serial numbers, and handing back an .xlsx the finance team can open. No lesson covers Excel output.
- ADD MICRO: Selecting, filtering and assigning -> .isin, .between, .str.contains / .str.extract with regex (na=False), and df.query for readable filters.
- ADD MICRO: Missing data, dtypes and dates -> performance on big files: usecols=, dtype=, the category dtype, chunksize= for files larger than RAM, and saving to Parquet.
- ADD MICRO: groupby, aggregation and pivot tables -> transform (a row's share of its group total), and week-over-week work with shift, pct_change, cumsum, rolling and resample("W").
- ADD MICRO: Validating before you hand data over -> drop_duplicates(subset=["order_id"], keep="last") for key-level duplicates, as opposed to exact-row duplicates. Also cover apply/map versus vectorised operations, and why iterrows is slow.
- FIX: "Chained indexing such as df[mask]["region"] = "West" may change a temporary copy and leave the real table untouched." -> In pandas 3 (Copy-on-Write) chained assignment never changes the original and raises a ChainedAssignmentError warning (verified on pandas 3.0.6). Say "never updates df in pandas 3; use df.loc[mask, "region"] = ...".

### dataformats
- ADD MICRO: Text encodings and UTF-8 bugs -> Unicode normalisation: 'é' can be one code point or two (NFC versus NFD), so equal-looking names fail ==. Use unicodedata.normalize("NFC", s) and casefold() for matching. Also cover invisible characters: non-breaking space \u00a0 and zero-width space \u200b.
- ADD MICRO: Dates, times, time zones and UTC -> non-existent local times on the spring-forward night. zoneinfo accepts 01:30 on 29 March 2026 in Europe/London without complaint (the concept code does exactly this). Detect it with a round trip (to UTC and back, compare), and in pandas use tz_localize(ambiguous=..., nonexistent=...).
- ADD MICRO: Regular expressions for messy fields -> re.sub for cleaning, re.findall, greedy versus non-greedy (.*?), and pandas .str.extract with named groups.
- ADD MICRO: CSV, JSON and XML quirks, and Parquet -> YAML and TOML config files (YAML indentation, `no` parsing as false under YAML 1.1), and base64 for binary data inside JSON (images and PDFs sent to LLM APIs).
- FIX: The example says "A pattern with IGNORECASE finds the first and third forms once the separator is made flexible", but the code pattern is r"\bINV-(?P<year>\d{4})-(?P<num>\d{5})\b" with a fixed hyphen, and 'INV 2026 00043' is not in `lines`. -> Make the separator flexible (r"\bINV[-\s]?(?P<year>\d{4})[-\s]?(?P<num>\d{5})\b"), add the 'INV 2026 00043' line and update the printed output.

### internet
- ADD MICRO: Clients, servers and requests -> the anatomy of a URL: scheme, host, port, path, query string (?a=1&b=2), fragment, and percent-encoding (%20).
- ADD MICRO: IP addresses and DNS lookups -> private versus public ranges (10.x, 172.16-31.x, 192.168.x), which is why a customer's 10.2.3.4 cannot be reached from your laptop. Add record types A/AAAA/CNAME, TTL as the cache lifetime, and /etc/hosts as a local override.
- ADD MICRO: Ports and TCP connections -> "connection refused" (host reachable, nothing listening) versus "timed out" (usually a firewall dropping packets). Mention that UDP exists (DNS, video) and does not guarantee delivery.
- ADD MICRO: Running your own tiny web server -> binding to 127.0.0.1 means only this machine can connect; 0.0.0.0 listens on all interfaces. This is the classic "works locally, unreachable from Docker or another machine" bug.
- FIX: "Certificates expire, often after about 90 days to a year." -> Since 15 March 2026 publicly trusted TLS certificates last at most 200 days, falling to 100 days in 2027 and 47 days in 2029 under the CA/Browser Forum schedule. Many (Let's Encrypt) are 90 days or shorter. Automated renewal (ACME) is now expected, while internal CAs set their own terms.

### dbbasics
- ADD SUBTOPIC: Exploring a customer's database on day one: list tables and columns (sqlite_master, information_schema.tables/columns, psql \dt and \d), row counts, SELECT ... LIMIT 20, DISTINCT and COUNT(DISTINCT). Connect to PostgreSQL from Python with psycopg or pd.read_sql, use a connection string held in an environment variable, and ask for a read-only user.
- ADD MICRO: Reading data: SELECT, WHERE, ORDER BY -> DISTINCT, IN, BETWEEN, HAVING (filter after GROUP BY), `IS NULL` (never `= NULL`), and column aliases with AS.
- ADD MICRO: Tables, rows, columns and keys -> indexes: what an index is, CREATE INDEX on a column you filter or join on, and the cost on writes. The QA says "uses indexes to search large tables quickly" but the lesson never teaches them.
- ADD MICRO: Tables, rows, columns and keys -> SQLite does not enforce REFERENCES unless you run `PRAGMA foreign_keys = ON` for each connection. Without it, the example schema accepts an order for a customer that does not exist.
- ADD MICRO: Tables, rows, columns and keys -> REAL is binary floating point. Store money as INTEGER cents, or NUMERIC/DECIMAL in PostgreSQL, to match the dataformats advice.
- ADD MICRO: Your first JOIN -> dialect differences customers will hit: LIMIT versus TOP (SQL Server) versus FETCH FIRST (Oracle), string quotes, and date functions.

### mlbasics
- ADD SUBTOPIC: Rules, classic ML or an LLM? A decision guide for FDEs: clear logic -> rules or regex. Tabular prediction with labelled history (churn, demand, fraud) -> classic ML. Unstructured text or judgement with few labels -> an LLM. Compare them on cost per call, latency, explainability and data needs, using one worked example per choice. No lesson covers this choice.
- ADD MICRO: Features, labels and examples -> the three kinds of learning in one paragraph: supervised (labels), unsupervised (clustering, no labels) and reinforcement (reward signal, which is where RLHF gets its name).
- ADD MICRO: Training and inference with scikit-learn -> a classification example as well (LogisticRegression on the churn X/y already shown, predict and predict_proba, accuracy on a test split). Right now all the code is regression.
- ADD MICRO: Overfitting and the train/test split -> a baseline to beat (predict the mean or the most common class) before claiming a model works, with a pointer to mlworkflow.

### mathbasics
- ADD SUBTOPIC: Exponents, logarithms and percentages: powers and compounding, log as "how many times you multiply", log scales on charts, and log-probabilities (why log loss and perplexity use logs). Percent change versus percentage points. logreg and neuralnets assume this.
- ADD MICRO: The dot product and similarity -> unit-length (normalised) vectors: most embedding APIs return length-1 vectors, so dot product equals cosine similarity. That is why vector databases offer "inner product".
- ADD MICRO: Matrices and matrix times vector -> score every document at once with a (n_docs, dim) matrix @ query, then np.argsort(-scores)[:k] for the top k. Also cover the transpose (.T) and shape errors in batches.
- ADD MICRO: Probability and softmax -> conditional probability and base rates: a 99%-accurate fraud flag on a 0.1% base rate still raises mostly false alarms. Work it with 100,000 cases.

### linux
- ADD SUBTOPIC: Installing software and running your own service: identify the machine (cat /etc/os-release, uname -m), install packages with apt or dnf (for example python3-venv), and write a minimal systemd unit file (User=, WorkingDirectory=, EnvironmentFile=, ExecStart=, Restart=on-failure). Then daemon-reload, enable --now, and logrotate. The lesson uses systemctl but never shows the .service file an FDE actually writes.
- ADD MICRO: SSH and copying files -> tmux or screen (or nohup ... &) so a long migration or backfill survives a dropped SSH connection or a laptop lid closing.
- ADD MICRO: The filesystem and moving around -> a terminal editor on the server: nano basics, and how to leave vim (Esc, :wq to save, :q! to discard).
- ADD MICRO: The filesystem and moving around -> the example says "truncating the file" but shows no command. Use `truncate -s 0 file` or `: > file`. Warn that rm on a log a process still holds open does not free the space until restart (lsof +L1 finds such files).
- ADD MICRO: curl, jq, environment variables and cron -> explain the `>> file 2>&1` in the crontab line, or cross-link it to the new terminal redirection subtopic.

### frontend
- ADD SUBTOPIC: Streaming model answers into the page: read a streamed fetch response with res.body.getReader() and TextDecoder, or use EventSource for server-sent events (SSE). Append tokens as they arrive, add a Stop button with AbortController, and in Streamlit use st.write_stream. fastapi teaches only the server half.
- ADD MICRO: JavaScript basics and the DOM -> === versus ==, null versus undefined, array map/filter/find, JSON.parse/JSON.stringify, and import/export between modules.
- ADD MICRO: Calling an API with fetch -> browser DevTools: the Network tab (request, response, status, CORS failures) and the Console. This is the first place to look when a demo breaks.
- ADD MICRO: React components at a glance -> project setup commands: npm create vite@latest (react-ts template), npm install, npm run dev, and what package.json scripts are.
- ADD MICRO: A quick demo UI in Streamlit -> st.chat_input and st.chat_message for chat-style demos. Never expose a demo on a public URL without auth, and mention Gradio as an alternative.
- ADD MICRO: HTML, CSS and JavaScript roles -> give inputs a <label> (placeholder text is not a label) and use real <button> elements: basic accessibility that enterprise customers check.
- FIX: AskBox.tsx: `const data = await res.json(); setAnswer(data.answer); setLoading(false);` with no res.ok check and no try/finally. If the request fails, the button stays disabled on "Thinking..." forever. -> Wrap it in try/catch/finally, check res.ok as the vanilla fetch example does, show an error state, and call setLoading(false) in finally.

### oop
- ADD MICRO: Methods and attributes -> @property for computed attributes (order.total without parentheses), @classmethod alternative constructors (Order.from_row(row) or from_dict for customer exports), and @staticmethod.
- ADD MICRO: Methods and attributes -> __str__ versus __repr__, and that defining __eq__ removes the default __hash__.
- ADD MICRO: Inheritance versus composition -> abc.ABC with @abstractmethod, or typing.Protocol, instead of `raise NotImplementedError`, so a missing send() fails when the object is created or when the type checker runs.
- ADD MICRO: Inheritance versus composition -> custom exception classes (class IntegrationError(Exception), class RetryableError(IntegrationError)). The resilient topic's code relies on them and no lesson shows how to define one.
- ADD MICRO: Dataclasses and type hints -> `unit_price: float` contradicts the dataformats money advice, so use Decimal. When to choose dataclass, Pydantic BaseModel or TypedDict (trusted internal data, untrusted input, typed dicts).
- ADD MICRO: Modules, packages and the virtual environment -> context managers: what `with` does (__enter__/__exit__, or contextlib.contextmanager), since SDK clients and DB connections are used this way.

### asyncpy
- ADD MICRO: gather and httpx.AsyncClient for parallel API calls -> asyncio.TaskGroup (Python 3.11+) as the modern structured alternative, asyncio.as_completed for a progress counter, and asyncio.timeout() for an overall deadline.
- ADD MICRO: gather and httpx.AsyncClient for parallel API calls -> the same pattern with async LLM SDK clients (AsyncAnthropic or AsyncOpenAI) for batch-scoring tickets, which is the WHY's own example.
- ADD MICRO: Rate limiting with a semaphore, plus retries -> get_with_retry retries only on status codes. Timeouts and connection errors (httpx.TimeoutException, httpx.ConnectError) escape uncaught, Retry-After can be an HTTP date (float() raises ValueError), and the loop sleeps pointlessly after the last attempt. Handle all three, or use tenacity as in the resilient topic.
- ADD MICRO: async, await and coroutines -> in Jupyter, asyncio.run() fails with "cannot be called from a running event loop". Use top-level `await main()` in the notebook instead.

### pytooling
- ADD SUBTOPIC: Jupyter notebooks and when to leave them: register the project venv as a kernel (ipykernel, or uv run --with jupyter), the hidden-state trap and "Restart and Run All", clearing outputs before commit (nbstripout, which also avoids leaking customer data), and moving stable code into src/ modules that the notebook imports. Notebooks appear in no lesson.
- ADD MICRO: Virtual environments with uv or pip -> installing inside locked-down customers: private package indexes (PIP_INDEX_URL, uv index settings) and offline installs from a wheelhouse (pip download / pip install --no-index --find-links).
- ADD MICRO: Virtual environments with uv or pip -> pin the Python version itself: uv python install 3.12, a .python-version file, and requires-python.
- ADD MICRO: Settings and logging configuration -> show loading .env with python-dotenv or pydantic-settings (named but never shown), and a standard .gitignore (.env, .venv, __pycache__, *.ipynb_checkpoints).

### stats
- ADD SUBTOPIC: How sure is an eval score? Uncertainty on small AI eval sets: a binomial or Wilson interval for 42/50 correct (about 71-92%), a paired comparison of two prompts or models on the same items (McNemar test or paired bootstrap), and why +3 points on 100 items is usually noise. No lesson covers this (evals has no CI or bootstrap), yet FDEs report eval deltas to customers constantly.
- ADD MICRO: Correlation versus causation -> Simpson's paradox (a pooled rate reverses inside every segment, for example by site or channel), plus survivorship and selection bias.
- ADD MICRO: A/B tests and statistical significance -> for heavily skewed metrics (basket size, handle time), use a bootstrap CI of the difference or Mann-Whitney U, and know that ratio metrics such as revenue per visitor need care.
- ADD MICRO: Sample size, power and peeking -> segment checks for sample ratio mismatch (the split was not really 50/50), a common sign of a broken experiment.

### genesis
- ADD MICRO: FDEs at AI labs and SaaS companies today -> Palantir's own current motion: AIP (2023) and AIP bootcamps, where engineers build on the customer's data in days. This is the version of the model interviewers will reference.
- ADD MICRO: FDEs at AI labs and SaaS companies today -> title variants to search for: Forward Deployed Engineer, Forward Deployed AI Engineer, Applied AI Engineer, AI Deployment Engineer, Deployment Strategist, and some "Solutions Engineer" roles at labs.
- ADD MICRO: How FDEs differ from similar roles -> add the two most-confused rows to the table: pre-sales Sales/Solutions Engineer (demos, no production code) and Implementation / Professional Services engineer (configures the product to a SOW, rarely feeds the roadmap).
- FIX: "The course material describes FDEs spending around 70 to 80 percent of their time on code and model work." -> Don't point to "the course material" inside the course. Write "A commonly quoted, rough estimate is 70 to 80 percent; it varies a lot by company and seniority". The concept idea states the same figure as fact, so hedge that too.

### slg
- ADD SUBTOPIC: Paying for FDE time: services models. Cover FDE effort bundled into the platform price versus billed as professional services under a SOW, fixed fee versus time-and-materials, paid pilots credited against year one, and services attach rate. Show how each choice shows up in gross margin (services margin is often near zero or negative) and in NRR. Cross-link roi, which covers the customer's pricing (seat, usage, outcome) but not how the vendor charges for FDE work.
- ADD MICRO: Unit economics and gross margin -> AI companies carry model-inference cost in COGS, so their margins start below classic SaaS (often quoted around 75-80%) even before FDE cost. The margin-for-moat trade stacks on top of that.
- ADD MICRO: Net Revenue Retention explained -> at usage-priced AI vendors, expansion often arrives as consumption growth (tokens, documents) rather than new contracts, which makes NRR volatile. Distinguish logo churn from revenue churn.
- ADD MICRO: When SLG works and when it fails -> CAC payback and LTV:CAC as the companion metrics leadership uses to judge whether FDE-heavy accounts pay back.
- FIX: "The contract grows to $1.2M, all of which counts as expansion in that year's NRR." -> Only the $900k increase ($1.2M minus the $300k starting ARR) is expansion. That account's own retention is 1.2 / 0.3 = 400 percent.

## Counts
ADD SUBTOPIC: 15. ADD MICRO: 72. FIX: 7.
