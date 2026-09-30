# AUDIT6_4: deep per-topic audit (ML models + LLM/agent core)

Scope: boosting knnsvm clustering dimred anomaly timeseries recsys neuralnets dlarch embeddings transformer llmapi prompting context ace skills rag tools.
Method: read every lesson subtopic (body, example, code, table, checklist), glossary and practice, plus patch_s/x/y entries and the concept (ideas, traps, qa; base concepts from atlas_v2_backup.html). Coverage elsewhere was checked by grepping all lessons (e.g. structured outputs, caching, batch, vector DBs, RLHF, multimodal, guardrails are owned by other topics and are only cross-linked here, not re-proposed).
Overall: the classical-ML topics are strong and verified; most gaps are production details. The LLM topics have a few outdated API patterns (Claude API changed in 2025-2026) that must be fixed.

### boosting
- ADD MICRO: Key hyperparameters across libraries -> imbalanced targets: scale_pos_weight (XGBoost), class_weight / is_unbalance (LightGBM, HistGB class_weight), and judging with PR-AUC not accuracy (cross-link mlmetrics).
- ADD MICRO: Key hyperparameters across libraries -> monotonic constraints (monotonic_cst / monotone_constraints) so "more overdue days never lowers risk"; a common regulator and business ask.
- ADD MICRO: Explaining predictions with SHAP -> built-in importance types (split vs gain) are biased; permutation importance on a validation set as the model-agnostic global check.
- ADD MICRO: Early stopping -> saving and reloading the fitted model (joblib / booster.save_model), recording library version, and scoring new rows with the same category dtypes (cross-link mlops).
- ADD MICRO: Boosting intuition -> one line on AdaBoost (reweighting rows) as the historical ancestor interviewers still ask about.

### knnsvm
- ADD MICRO: Naive Bayes for text -> TF-IDF is used in several places but never explained here (term frequency times inverse document frequency, one worked number); and ComplementNB for imbalanced text classes, GaussianNB for numeric features.
- ADD MICRO: SVM: the widest margin -> multi-class handling (one-vs-rest vs one-vs-one) and class_weight='balanced' for rare classes.
- ADD MICRO: kNN: distance and neighbours -> at scale neighbour search uses an approximate index (HNSW), the same machinery as vector search (cross-link embeddings).
- ADD MICRO: Which one fits when -> hinge loss named as what LinearSVC/SGDClassifier optimise, so the link to logistic regression (log loss) is explicit.

### clustering
- ADD SUBTOPIC: Clustering text and embeddings: embed support tickets or feedback, reduce (optional), cluster (k-means/HDBSCAN), then have an LLM name each cluster from sampled members; the most common FDE clustering request today.
- ADD MICRO: k-means step by step -> assigning new rows to existing segments with km.predict and a saved scaler, and MiniBatchKMeans for millions of rows.
- ADD MICRO: DBSCAN / Hierarchical -> Gaussian mixture models as soft clustering (probability of belonging to each segment), useful when customers sit between segments.
- ADD MICRO: Pitfalls to avoid -> tracking segment drift month to month (share of customers per segment, migration matrix) before campaigns rely on it.

### dimred
- ADD MICRO: Explained variance and choosing k -> the lesson says 21 components reach 90 percent on raw digits while the concept animation says 31 on standardised digits; add one sentence that scaling changes the answer, or learners will think one is wrong.
- ADD MICRO: Using PCA before a model -> TruncatedSVD for sparse TF-IDF matrices (PCA cannot centre sparse data), a.k.a. LSA.
- ADD MICRO: PCA intuition -> inverse_transform and reconstruction error, which doubles as an anomaly score (cross-link anomaly).
- ADD MICRO: t-SNE and UMAP -> shrinking stored embeddings (API dimensions parameter / Matryoshka embeddings) is the more common production use of reduction for vectors (cross-link embeddings).

### anomaly
- ADD MICRO: One-class and novelty approaches -> reconstruction-error detectors (PCA or an autoencoder): large reconstruction error = unusual; standard for sensor data.
- ADD MICRO: Z-scores and IQR fences -> modified z-score formula 0.6745 x (x - median) / MAD with the usual 3.5 threshold (MAD is named but not given).
- ADD MICRO: Time-based anomalies -> level shifts and slow drift are not spikes: change-point detection (CUSUM or rolling-mean comparison) for "the line quietly moved".
- ADD MICRO: Kinds of anomalies -> velocity/aggregate features (count per card per 10 min, amount vs card's own 30-day median) as the usual way collective and contextual anomalies become point anomalies for isolation forest.

### timeseries
- ADD SUBTOPIC: Prediction intervals and quantile forecasts: why a single number is not enough for stock or staffing decisions; intervals from Holt-Winters/ARIMA get_forecast, quantile loss in LightGBM/HistGB, checking interval coverage in the backtest.
- ADD SUBTOPIC: Preparing time data: resample/asfreq to a regular grid, filling missing periods (zero sales vs missing data), time zones and DST, aggregating to the decision level, holiday calendars as features.
- ADD MICRO: ARIMA at a high level -> stationarity in one line and the ADF test name, since "is it stationary?" is an interview staple.
- ADD MICRO: Gradient boosting with lag features -> other tools a customer may already use: Prophet, statsforecast/Nixtla, and pretrained time-series foundation models (Chronos, TimesFM) as a quick zero-shot baseline to backtest like any other model.
- ADD MICRO: Backtesting and the MAPE trap -> intermittent demand (many zeros): Croston-style methods and scoring with WAPE/MASE only.

### recsys
- ADD SUBTOPIC: Two-stage production architecture: candidate retrieval (co-visitation counts, ANN over item embeddings, two-tower models), a learning-to-rank model (e.g. LightGBM ranker) on user/item/context features, business-rule filters, precomputed vs real-time serving. The concept already promises this; the lesson never teaches it.
- ADD MICRO: Offline metrics and A/B testing -> diversity, novelty and popularity bias; feedback loops (the model only learns from what it showed) and a small exploration share.
- ADD MICRO: Implicit feedback and cold start -> position bias: items shown at the top get clicks because of position; log position with impressions.
- ADD MICRO: Content-based recommendations -> LLM-generated item descriptions/tags to enrich thin catalogues and plain-language "because you bought" explanations.

### neuralnets
- ADD SUBTOPIC: Multi-class outputs and a real PyTorch training loop: softmax + cross-entropy for many classes, nn.CrossEntropyLoss takes raw logits, Dataset/DataLoader batching, train/val loop, device ("cuda" vs "cpu"), saving state_dict.
- ADD MICRO: Training: optimizers, batches and epochs -> learning-rate schedules (warmup, cosine decay, ReduceLROnPlateau); every fine-tuning config the learner will read has them.
- ADD MICRO: Training -> weight initialisation and vanishing/exploding gradients in deep feed-forward nets (dlarch covers it only for RNNs), gradient clipping.
- ADD MICRO: Overfitting controls -> batch normalisation and layer normalisation in one paragraph (transformer lesson assumes LayerNorm is known).
- ADD MICRO: Activation functions -> subtract the max before exp in softmax (the transformer lesson does this; this lesson's softmax code does not, and overflows for scores near 1000); also name GELU/SiLU as the modern ReLU variants.
- FIX: "It requires torch, which is not installed where these lessons were checked, so it was not run and no output is shown." -> run the PyTorch example in an environment with torch and show its real output; an unrun code sample in a beginner course is a risk.

### dlarch
- ADD SUBTOPIC: Generative and multimodal architectures: autoencoders, diffusion models for images, CLIP-style joint text-image embeddings, speech models (Whisper-style ASR, TTS) at a conceptual level, so an FDE can explain image generation, visual search and voice agents (cross-link multimodal).
- ADD MICRO: Attention and the jump to transformers -> mixture-of-experts (only some weights active per token) because customers see "total vs active parameters" in model cards.
- ADD MICRO: GPUs and why they matter -> quantisation arithmetic (16-bit 2 bytes, 8-bit 1, 4-bit 0.5 per weight) is asked in practice but not taught in the body; plus KV-cache memory grows with context length x batch.
- FIX: "The rough sum below shows the arithmetic alone is about 14 ms per token on a strong CPU versus 0.05 ms on a data-centre GPU" -> single-user token generation is limited by memory bandwidth, not FLOPs: each token must read all 14 GB of weights, so ~14 GB / ~50 GB/s is roughly 0.3 s per token on a laptop CPU and ~14 GB / ~3 TB/s is about 5 ms on a data-centre GPU. Keep the FLOP sum for prefill/training, add the bandwidth sum for decoding.

### embeddings
- ADD SUBTOPIC: Choosing an embedding model: open vs API models (sentence-transformers, OpenAI, Voyage, Cohere, cloud-native), MTEB leaderboard as a starting shortlist only, multilingual needs, max input tokens, price per million tokens, then a recall@k bake-off on the customer's own questions.
- ADD MICRO: From text to vectors -> asymmetric models need different handling for queries vs documents (prefixes like "query:"/"passage:" or an input_type parameter); forgetting this silently lowers recall.
- ADD MICRO: pgvector in practice -> storage cost cuts: fewer dimensions (Matryoshka / dimensions parameter), halfvec (16-bit) and binary quantisation with re-scoring.
- ADD MICRO: Exact nearest-neighbour search -> batch embedding jobs: batching, rate limits, retries and caching by content hash so unchanged chunks are not re-embedded (cross-link rag freshness).
- ADD MICRO: Pitfalls an FDE debugs -> when a dedicated vector DB (Pinecone, Qdrant, Weaviate, OpenSearch) beats pgvector, and FAISS for in-process search (only nosql mentions them; faiss appears nowhere).

### transformer
- ADD MICRO: Model families and generation cost -> how a base model becomes an assistant (pretraining, instruction tuning, RLHF/RL) in three lines with a pointer to rlhf; beginners otherwise think the chat model is the raw next-token predictor.
- ADD MICRO: Self-attention step by step -> why long context got cheaper (KV-cache reuse, grouped-query attention, FlashAttention) and the "lost in the middle" effect named explicitly (context lesson describes it without the name).
- ADD MICRO: Model families -> mixture-of-experts and "active vs total parameters".
- ADD MICRO: Tokens and BPE -> why models hallucinate in one line: they predict plausible tokens, not retrieved facts (the concept trap says it; the lesson body does not).
- ADD MICRO: Embeddings and similarity -> this subtopic repeats the embeddings topic almost verbatim; cut it to a short cross-link or refocus it on token embeddings/unembedding (logits = hidden state x vocab matrix).
- FIX: practice "Use a real tokenizer (for example the tiktoken library...)" -> tiktoken is OpenAI's tokenizer and miscounts Claude and other models; say "each provider's own tokenizer or token-counting endpoint (for Claude: client.messages.count_tokens)".
- FIX: patch_s decoding table "Extraction, classification, SQL: Temperature 0 to 0.2" -> add that several current models (including recent Claude models) reject temperature/top_p entirely; determinism then comes from structured outputs and validation.

### llmapi
- ADD SUBTOPIC: The raw HTTP request and key handling: the same call with curl (POST /v1/messages, x-api-key, anthropic-version, content-type), reading the JSON response, and API key hygiene (env vars, secrets manager, never in Git or the browser, rotation, per-environment keys).
- ADD MICRO: Streaming and the usage fields -> stop_reason list is incomplete: also refusal (safety decline, HTTP 200) and pause_turn (long server-tool turns to be continued); always check stop_reason before reading content.
- ADD MICRO: Streaming and the usage fields -> cache_read_input_tokens / cache_creation_input_tokens meaning and that the Message Batches API is ~50% cheaper for overnight jobs (qa mentions batch but no subtopic teaches it; llmcost only prices it).
- ADD MICRO: Enterprise access -> Bedrock now has the Messages-API "Mantle" client (AnthropicBedrockMantle) and Bedrock ids carry an "anthropic." prefix; Microsoft Foundry has its own AnthropicFoundry client.
- ADD MICRO: Errors, rate limits -> 408/409 are retried by the SDK too, timeouts are retried so wall-clock can reach timeout x (retries+1), and "jitter" should be defined (it appears in the qa only).
- FIX: `print(response.content[0].text)` and `return r.content[0].text` -> on current models with thinking on by default the first block can be a thinking block; use `"".join(b.text for b in response.content if b.type == "text")` (the tools lesson already does this in run_agent).

### prompting
- ADD SUBTOPIC: Prompt chaining and routing: split a task into steps (extract, then check, then write), a cheap classifier call that routes to specialised prompts, passing outputs between steps in tags; bridges prompting and tools' workflow subtopic.
- ADD SUBTOPIC: Debugging a prompt with error analysis: collect failures, label why each failed (missing context, ambiguous rule, format), fix the biggest bucket, re-run the eval; the practical loop behind "prompts are code".
- ADD MICRO: Reliable JSON with tool use -> name the native structured-output mode concretely: Anthropic output_config.format (client.messages.parse with a Pydantic model) and strict: true on tools, which guarantee schema-valid output; "check your provider's docs" is too vague for a beginner.
- ADD MICRO: The anatomy of a good prompt -> modern models over-react to SHOUTING and "CRITICAL/MUST" emphasis written for older models; explain the reason behind a rule instead. Also assistant-message prefill (starting the reply with "{") no longer works on current Claude models.
- ADD MICRO: Few-shot examples and XML tags -> untrusted text inside tags can still carry injected instructions; tags help but are not a defence (cross-link guardrails).
- FIX: `thinking={"type": "enabled", "budget_tokens": 2000}` and "extended thinking, a setting where the model reasons internally with a token budget you choose" -> budget_tokens is deprecated and returns 400 on current Claude models; use `thinking={"type": "adaptive"}` with `output_config={"effort": "medium"}` (glossary "Extended thinking" needs the same update).
- FIX: `tool_choice={"type": "tool", "name": "record_claim"}  # force it` and the qa "force that tool with tool_choice" -> forced tool_choice (any/tool) now returns 400 on the newest Claude models; teach output_config.format / messages.parse (or tool_choice auto + strict: true) as the primary pattern and forced tools as the older fallback.

### context
- ADD SUBTOPIC: Long-term memory across sessions: what to remember (user preferences, decisions, facts), where (memory store / memory tool / database rows), when to write and when to recall, expiry, user visibility and PII deletion; "agent memory" appears in FDE job posts and no topic owns it.
- ADD SUBTOPIC: Just-in-time context: letting the agent pull what it needs through tools (search, grep, open file, SQL) instead of pre-loading everything, with small identifiers in context and full content fetched on demand; pairs with ace's Context-Bench subtopic.
- ADD MICRO: Managing history and tool outputs -> provider features that do this for you: server-side compaction and context editing that clears old tool results; and that hand-rewriting earlier turns breaks prompt caching (and on newest Claude models, preserved thinking), so prefer append-only history.
- ADD MICRO: Assembling the components -> exact cache-friendly ordering rule: tools, then system, then messages; anything volatile (timestamps, request ids) after the last cache breakpoint.
- ADD MICRO: The window as RAM -> name "context rot / lost in the middle" and sub-agents as a way to keep a main agent's context clean (cross-link multiagent).

### ace
- ADD MICRO: Two failure modes -> the paper's headline numbers (about +10.6 points on AppWorld agent tasks, +8.6 on finance benchmarks, with much lower adaptation cost and latency than prompt optimisers) so the FDE can cite evidence to a customer.
- ADD MICRO: The Generator and its trajectory -> offline adaptation (learn from a batch of past logs before launch) vs online adaptation (learn during live use), and which to use in a regulated customer.
- ADD MICRO: The Curator applies delta updates -> once the playbook has hundreds of bullets, retrieve only relevant bullets per task (embedding search over bullets) instead of rendering all of them.
- ADD MICRO: The Curator applies delta updates -> governance: noisy or malicious feedback can teach wrong lessons (poisoning); require human review or eval gating for new bullets and keep a versioned history for rollback.
- FIX: Reflector code `return json.loads(resp.content[0].text)   # validate in production` -> use structured outputs (output_config.format / messages.parse with a schema) and select text blocks by type; content[0] may be a thinking block.
- FIX: Generator code `while True:` with no turn cap -> add max_turns, the same limit the tools lesson insists on.

### skills
- ADD SUBTOPIC: Where skills run and how to install them: Claude Code (.claude/skills or plugins), Claude apps (upload in settings), the API (skills in a container with the code-execution tool) and the Agent SDK; Agent Skills is also published as an open format other agent tools read.
- ADD MICRO: What lives inside a skill folder -> frontmatter rules: name lowercase letters, numbers and hyphens, max 64 characters; description max 1024 characters, written in third person; keep SKILL.md body under about 500 lines; optional fields such as allowed-tools (Claude Code) and license.
- ADD MICRO: Skills compared with prompts, RAG and tools -> add MCP to the comparison: MCP connects the agent to systems (tools/data), a skill teaches the procedure for using them; they are complementary (cross-link mcp).
- ADD MICRO: Running skills in a customer deployment -> skill scripts run with the agent's permissions, so they need the same code review and sandboxing as any script; pin versions of skills taken from third parties.
- FIX: the SKILL.md example in "Writing a description that triggers" is labelled lang: YAML -> it is a Markdown file with YAML frontmatter; label it Markdown so syntax highlighting and learners are not misled.

### rag
- ADD SUBTOPIC: Generating the grounded answer: the answer prompt (sources in tagged blocks with ids, answer only from sources, cite, say "I don't know"), the provider citations feature (Anthropic citations on document blocks), quoting before answering for long sources, and rendering citations as links in the UI. The concept shows this prompt but no subtopic teaches it.
- ADD SUBTOPIC: Improving retrieval beyond hybrid search: query rewriting and multi-query, HyDE, contextual chunk headers (prepend document/section summary before embedding), parent-child (small-to-big) retrieval, metadata filters (date, product), and agentic RAG where search is a tool the model can call several times (cross-link graphrag).
- ADD MICRO: Measuring retrieval and answers separately -> MRR and nDCG for ranking quality, answer relevance/correctness beside faithfulness, and the RAGAS-style metric names (cross-link evals).
- ADD MICRO: RAG compared with fine-tuning -> a third option: for small corpora (a few hundred pages) put the whole thing in a long, cached context and skip the retrieval stack.
- ADD MICRO: Embeddings and similarity search -> near-duplicate of the embeddings topic; shorten to a recap plus link so the RAG lesson has room for the two subtopics above.
- ADD MICRO: Parsing and chunking documents -> point to docai for layout-aware PDF parsing and name common tools (unstructured, Docling, cloud document AI) instead of only "OCR".

### tools
- ADD SUBTOPIC: Controlling tool use: tool_choice (auto, none, any/tool and that forcing is rejected on the newest Claude models), strict: true for schema-valid arguments, parallel tool calls with all tool_results returned in one user message, disable_parallel_tool_use, and tool search / deferred loading when there are many tools.
- ADD SUBTOPIC: Server-side tools and SDK helpers: provider-hosted tools (web search, web fetch, code execution) that need no loop in your code, the pause_turn stop reason, and the SDK tool runner that runs the loop for you with hooks for approval and logging; when to hand-write the loop instead.
- ADD MICRO: One round trip in detail -> stop reasons beyond tool_use/end_turn: max_tokens in the middle of a tool call (truncated arguments, do not execute), refusal, pause_turn.
- ADD MICRO: Validating and authorizing calls -> keep tool results small (paginate, trim fields, return ids plus summaries) and write error messages that tell the model how to recover (cross-link context).
- ADD MICRO: Choosing a workflow or an agent -> pointer to mcp (exposing the same tools to many agents) and frameworks (LangGraph etc.) so learners see where the hand-written loop fits.
- FIX: "One round trip in detail" code ends with `print(resp.content[0].text)` -> content[0] may be a thinking block or another tool_use block if the model wants a second tool; join text blocks by type and, for anything beyond one call, use the run_agent loop.
- FIX: base concept code `while True: ... return resp.content[0].text` -> add a max_turns cap (the concept's own trap says "No iteration cap") and select text blocks by type.

## Counts
- ADD SUBTOPIC: 18
- ADD MICRO: 66
- FIX: 13
- Topics with no subtopic gap (micros only): boosting, knnsvm, dimred, anomaly, transformer, ace. No topic is fully complete; the classical-ML ones are closest.
