NEW.push(
{id:"cloud", mod:2, sec:"2.3", name:"Cloud and Terraform",
 title:"Infrastructure as code in the customer's cloud",
 thesis:"FDEs often deploy into the customer's AWS, GCP or Azure account. Terraform makes that repeatable and reviewable: the network, permissions and gateway are code in git, not clicks in a console.",
 vb:[710,420],
 codeTitle:"Terraform (AWS)",
 code:`terraform {
  backend "s3" { bucket = "acme-tfstate"
                 key    = "ask-api/terraform.tfstate"
                 dynamodb_table = "tf-locks" }
}
resource "aws_vpc" "main" {
  cidr_block = "10.20.0.0/16"
}
resource "aws_iam_role" "ask_api" {
  name               = "ask-api"
  assume_role_policy = data.aws_iam_policy_document.eks.json
}
resource "aws_iam_role_policy" "read_docs" {
  role   = aws_iam_role.ask_api.id
  policy = jsonencode({ Statement = [{ Effect = "Allow",
    Action   = ["s3:GetObject"],
    Resource = "arn:aws:s3:::acme-docs/*" }] })
}
resource "aws_apigatewayv2_api" "ask" {
  name          = "ask-api"
  protocol_type = "HTTP"
}`,
 nodes:[
  ["hcl",90,100,"Terraform code","*.tf in git"],
  ["plan",265,100,"terraform plan","diff vs. state"],
  ["review",440,100,"PR review","+3 ~1 -0"],
  ["state",615,100,"State file","remote · locked",1],
  ["apply",440,230,"terraform apply","make it so"],
  ["airgap",90,360,"Air-gapped site","no internet",1],
  ["vpc",265,360,"VPC","private subnets"],
  ["iam",440,360,"IAM role","least privilege"],
  ["gw",615,360,"API gateway","auth · throttling"]
 ],
 edges:[["hcl","plan"],["state","plan",100,"refresh"],["plan","review"],["review","apply"],["apply","state",0,"write"],["apply","vpc"],["apply","iam"],["apply","gw"],["apply","airgap"]],
 steps:[
  {t:"Describe the infrastructure", n:["hcl"], d:"Resources are declared, not scripted: 'there is a VPC with this CIDR'. The code lives in git next to the app.", l:[5,6,7]},
  {t:"Plan against state", n:["plan","state"], e:["hcl>plan","state>plan"], d:"Terraform compares your code with the recorded state and the real cloud, and prints exactly what it will create, change or destroy. State lives in a remote backend with a lock so two people can't apply at once.", l:[0,1,2,3,4]},
  {t:"Review the plan", n:["review"], e:["plan>review"], d:"The plan output goes into the pull request. A reviewer sees '+3 to add, 1 to change, 0 to destroy' before anything touches the customer's account. Watch for unexpected destroys."},
  {t:"Apply", n:["apply","state"], e:["review>apply","apply>state"], d:"Terraform makes the changes in dependency order and records the new state."},
  {t:"Network: the VPC", n:["vpc"], e:["apply>vpc"], d:"A private network with subnets. Databases and model servers sit in private subnets with no public IP; only the gateway or load balancer faces users.", l:[5,6,7]},
  {t:"Permissions: IAM roles", n:["iam"], e:["apply>iam"], d:"The service gets a role, not long-lived keys, with only the actions it needs: here, read one S3 bucket. Least privilege is what gets you through the customer's security review.", l:[8,9,10,11,12,13,14,15,16,17]},
  {t:"Entry point: API gateway", n:["gw"], e:["apply>gw"], d:"Auth, rate limiting and routing in front of your service, managed by the cloud provider.", l:[18,19,20,21]},
  {t:"Air-gapped deployments", n:["airgap"], e:["apply>airgap"], d:"Some customers (defense, banks) allow no internet. Palantir built Apollo to ship and update software across many such environments. The lesson: package everything (images, models, providers) so it installs offline, and automate upgrades."}
 ],
 ideas:["Declarative infrastructure, reviewed as a plan in a PR, applied by CI.","Remote state with locking; never commit state files (they contain secrets).","IAM roles over access keys; least privilege per service.","AWS, GCP and Azure name things differently (IAM roles, service accounts, managed identities) but the concepts map one to one."],
 traps:["Clicking changes in the console so code and reality drift.","Wildcard IAM policies like Action: '*'.","Applying without reading the plan's destroy lines."],
 qa:[["How would you deploy your service into a customer's AWS account securely?","Terraform in their account via a role they grant, private subnets, IAM roles with least privilege, secrets in their secret manager, an API gateway or ALB with their SSO in front, and plans reviewed with their platform team."],
     ["What is Terraform state and why does it matter?","The record of which real resources map to which code. Terraform diffs against it; if it's lost or edited by two people at once you get drift or duplicate resources, hence remote state with locking."],
     ["How would you ship updates to an air-gapped site?","Signed bundles of images, model weights and config, mirrored into the site's internal registry, with an automated, versioned upgrade and rollback process. That's the Apollo idea."]]
},
/* ================================================= MODULE 3 */
{id:"transformer", mod:3, sec:"3.1", name:"Transformer forward pass",
 title:"Inside a transformer, one token at a time",
 thesis:"Every LLM you deploy is this loop: turn text into tokens, let tokens attend to each other through N layers, predict the next token, append it and repeat.",
 vb:[710,290],
 codeTitle:"One decoder layer in numpy-style code",
 code:`ids = bpe.encode("refund after 45")        # e.g. [19651, 1306, 2548]
x   = E[ids]                                # (T, d_model) embeddings

# ---- attention (per head; positions via RoPE on Q and K) ----
Q, K, V = x @ Wq, x @ Wk, x @ Wv
Q, K    = rope(Q), rope(K)
scores  = Q @ K.T / sqrt(d_k)               # (T, T)
scores += causal_mask                        # can't see the future
w       = softmax(scores, axis=-1)          # rows sum to 1
attn    = w @ V                              # weighted mix of values
# multi-head: h heads in parallel, concat, project with Wo

x = x + attn_block(rms_norm(x))             # residual connection
x = x + ffn(rms_norm(x))                    # per-token MLP (SwiGLU)
# ... repeat for N layers ...

logits = rms_norm(x)[-1] @ W_vocab          # scores for next token
next_id = sample(softmax(logits / temperature))`,
 nodes:[
  ["text",90,70,"Text","\"refund after 45\""],
  ["tok",265,70,"BPE tokenizer","→ token ids"],
  ["emb",440,70,"Embeddings","+ RoPE positions"],
  ["attn",615,70,"Self-attention","multi-head"],
  ["add1",615,220,"Add + RMSNorm","residual"],
  ["ffn",440,220,"Feed-forward","per-token MLP"],
  ["add2",265,220,"Add + RMSNorm","× N layers"],
  ["logits",90,220,"Next token","softmax · sample"]
 ],
 edges:[["text","tok"],["tok","emb"],["emb","attn"],["attn","add1"],["add1","ffn"],["ffn","add2"],["add2","logits"],["logits","text",0,"append, repeat"]],
 steps:[
  {t:"Tokenize", n:["text","tok"], e:["text>tok"], d:"Byte-Pair Encoding merges frequent byte sequences into tokens. Cost, latency and context limits are all counted in tokens, and code, numbers and non-English text often need more tokens per word.", l:[0]},
  {t:"Embed", n:["emb"], e:["tok>emb"], d:"Each token id becomes a vector. Similar meanings end up close together, measured by cosine similarity, dot product or Euclidean distance. The same idea powers embedding search in RAG.", l:[1]},
  {t:"Queries, keys, values", n:["attn"], e:["emb>attn"], d:"Each token produces a query (what I'm looking for), a key (what I contain) and a value (what I pass on). RoPE rotates Q and K by position so attention knows word order.", l:[3,4,5]},
  {t:"Scaled dot-product attention", n:["attn"], d:"Scores are Q·Kᵀ divided by √d_k so the softmax doesn't saturate as dimensions grow. The causal mask stops a token looking at later tokens. Each token's output is a weighted mix of the others' values.", l:[6,7,8,9]},
  {t:"Many heads", n:["attn"], d:"Multi-head attention runs several attention patterns in parallel, one might track syntax, another references, then concatenates and projects them.", l:[10]},
  {t:"Residual and normalization", n:["add1"], e:["attn>add1"], d:"The attention output is added back to the input (a residual connection) so information and gradients flow through deep stacks. RMSNorm keeps activations in a stable range.", l:[12]},
  {t:"Feed-forward", n:["ffn","add2"], e:["add1>ffn","ffn>add2"], d:"A two-layer MLP applied to each token separately. Much of the model's stored knowledge lives in these weights. Then another residual add, and the whole block repeats N times.", l:[13,14]},
  {t:"Predict, append, repeat", n:["logits","text"], e:["add2>logits","logits>text"], d:"The last position's vector is projected to a score per vocabulary token, sampled with a temperature, appended, and the loop runs again. A KV cache stores past keys and values so each new token is cheap.", l:[16,17]}
 ],
 ideas:["Encoder-only (BERT): sees both directions; used for embeddings and classification.","Decoder-only (GPT, Claude, Llama): causal; used for generation.","Encoder-decoder (T5): encoder reads input, decoder generates; translation and summarization.","Attention cost grows with the square of sequence length, which is why long contexts are slower and pricier.","Latency has two parts: prefill (reading the prompt, parallel) and decode (one token at a time)."],
 traps:["Saying the model 'looks up' facts; it predicts tokens from learned weights.","Estimating cost in words instead of tokens.","Confusing embeddings from an embedding model with a chat model's internal states."],
 qa:[["Why divide attention scores by the square root of d_k?","Dot products grow with dimension; large scores push softmax into near one-hot outputs with tiny gradients. Scaling keeps them in a trainable range."],
     ["Why does a long prompt raise latency and cost?","You pay per input token, prefill compute grows with length (attention is quadratic), and the KV cache uses more memory, which limits batch size."],
     ["Cosine similarity vs. dot product for embeddings?","Cosine ignores vector length and compares direction only. Dot product includes magnitude. For normalized embeddings they rank the same."]]
},
{id:"context", mod:3, sec:"3.2", name:"Context engineering",
 title:"Context engineering: the window is RAM, the model is CPU",
 thesis:"Prompt engineering tunes the wording of one instruction. Context engineering decides everything the model sees on every call. Most 'hallucinations' in production are missing or wrong context.",
 vb:[720,420],
 codeTitle:"A context budget for one call",
 code:`CONTEXT BUDGET   (window 200k · target under 60k)
  system instructions ........  1,800 tok
  dialogue history ...........  6,000 tok  older turns summarized
  RAG chunks (top 5) .........  3,500 tok  reranked, with ids
  tool schemas (6 tools) .....  2,400 tok
  tool outputs ...............  9,000 tok  large JSON trimmed
  user state / profile .......    300 tok  role, region, perms
  output constraints .........    400 tok  JSON schema
  -------------------------------------------
  total ......................  23,400 tok

"Hallucinated a refund policy" -> was the policy chunk
in the window?  No  -> fix retrieval, not the wording.`,
 nodes:[
  ["instr",90,40,"Instructions","system prompt"],
  ["hist",90,105,"History","summarized"],
  ["rag",90,170,"RAG chunks","retrieved"],
  ["tools",90,235,"Tool schemas","+ tool outputs"],
  ["state",90,300,"User state","role · perms"],
  ["fmt",90,365,"Output format","schema"],
  ["window",310,202,"Context window","the RAM"],
  ["llm",480,202,"LLM","the CPU"],
  ["out",650,202,"Output","or runtime error"]
 ],
 edges:[["instr","window",-40],["hist","window"],["rag","window"],["tools","window"],["state","window"],["fmt","window",40],["window","llm"],["llm","out"],["out","window",-120,"debug context"]],
 steps:[
  {t:"From vibes to engineering", n:["instr"], d:"Vibe coding iterates by feel. Prompt engineering tunes the wording of instructions. Context engineering designs the whole input: what goes in, in what order, within what budget.", l:[1]},
  {t:"Dialogue history", n:["hist"], e:["hist>window"], d:"Keep recent turns verbatim and summarize older ones. Unbounded history crowds out everything else.", l:[2]},
  {t:"Retrieved knowledge", n:["rag"], e:["rag>window"], d:"A few reranked chunks with source ids beat thirty raw ones. Relevance per token is the goal.", l:[3]},
  {t:"Tools and their outputs", n:["tools"], e:["tools>window"], d:"Tool schemas cost tokens on every call, and tool outputs can be huge. Trim JSON to the fields the model needs.", l:[4,5]},
  {t:"User state and output constraints", n:["state","fmt"], e:["state>window","fmt>window"], d:"Who the user is and what they're allowed to see, plus the exact output shape you'll parse.", l:[6,7]},
  {t:"The window is RAM", n:["window"], d:"Karpathy's mental model: the LLM is a CPU and the context window is its RAM. It's finite, everything competes for it, and position matters: models attend less reliably to the middle of long contexts.", l:[0,8,9]},
  {t:"Context as a compiler", n:["llm","out"], e:["window>llm","llm>out"], d:"Treat the assembled context like source code and the model like a compiler: the same model gives a correct or broken output depending on what you fed it."},
  {t:"Hallucination as a runtime error", n:["window","out"], e:["out>window"], d:"When the output is wrong, inspect what was actually in the window before rewording anything. Usually the needed fact was missing, stale or buried.", l:[11,12]}
 ],
 ideas:["Components: instructions, dialogue history, RAG chunks, tool schemas and outputs, user state, output constraints.","Budget tokens per component and log the assembled context for every call.","Debug by reading the exact context the model saw.","Less, more relevant context usually beats more context."],
 traps:["Rewording the prompt to fix what is really a retrieval bug.","Pasting whole documents because the window is large.","Not logging assembled context, so failures can't be reproduced."],
 qa:[["Prompt engineering vs. context engineering?","Prompt engineering optimizes the wording of instructions. Context engineering is the system that decides everything in the window per call: history, retrieval, tools, state and format, within a token budget."],
     ["The agent invented a policy that doesn't exist. How do you fix it?","Pull the trace and check whether the real policy was in the context. If not, fix retrieval or tool access; if it was buried, rerank and trim; then add an instruction to say 'I don't know' and an eval case."],
     ["Why not just use a 1M-token window?","Cost and latency grow with tokens, and accuracy drops when the relevant fact is buried among irrelevant text. Curated context is cheaper and more accurate."]]
},
{id:"ace", mod:3, sec:"3.3", name:"Agentic Context Engineering",
 title:"ACE: contexts that learn without collapsing",
 thesis:"Stanford's Agentic Context Engineering treats the context as an evolving playbook. Three roles generate, reflect and curate, and changes are small deltas, so hard-won detail isn't lost.",
 vb:[710,290],
 codeTitle:"An evolving playbook",
 code:`## PLAYBOOK  (itemized · grows by delta updates)
[str-012] helpful=7 harmful=0
  For invoice APIs, page with a cursor, not an offset.
[err-004] helpful=3 harmful=1
  Vendor feed dates are DD/MM; parse explicitly.
[tool-021] helpful=5 harmful=0
  Call get_schema before writing SQL on a new table.

## DELTA from the Curator (this run)
+ [err-009] On 429, wait for Retry-After before retrying.
~ [err-004] harmful += 1   (US vendor uses MM/DD)`,
 nodes:[
  ["task",90,70,"New task","query or job"],
  ["gen",265,70,"Generator","solves with playbook"],
  ["traj",440,70,"Trajectory","steps · outcome"],
  ["refl",615,70,"Reflector","what worked, failed"],
  ["ins",615,220,"Insights","concrete lessons"],
  ["cur",440,220,"Curator","delta updates"],
  ["book",265,220,"Playbook","itemized bullets"],
  ["collapse",90,220,"Context collapse","avoided",1]
 ],
 edges:[["task","gen"],["gen","traj"],["traj","refl"],["refl","ins"],["ins","cur"],["cur","book"],["book","gen",0,"context"]],
 steps:[
  {t:"Two failure modes", n:["collapse"], d:"Brevity bias: prompt optimizers compress instructions into short, generic advice and drop domain detail. Context collapse: when a model rewrites the whole context each round, it gradually erodes into something much shorter and worse."},
  {t:"A task arrives", n:["task","gen"], e:["task>gen"], d:"The Generator tackles it using the current playbook as context.", l:[0]},
  {t:"Record the trajectory", n:["traj"], e:["gen>traj"], d:"Every step, tool call and outcome is kept, including failures and execution feedback."},
  {t:"Reflect", n:["refl","ins"], e:["traj>refl","refl>ins"], d:"The Reflector critiques the trajectory and extracts specific lessons: what worked, what failed and why. Separating reflection from generation gives better lessons."},
  {t:"Curate as deltas", n:["cur"], e:["ins>cur"], d:"The Curator turns lessons into small, itemized edits: add a bullet, bump a helpful or harmful counter. It never rewrites the whole playbook.", l:[8,9,10]},
  {t:"The playbook grows", n:["book"], e:["cur>book"], d:"Bullets have ids and counters, get deduplicated, and accumulate detail over time instead of being summarized away.", l:[1,2,3,4,5,6,7]},
  {t:"Loop", n:["gen","book"], e:["book>gen"], d:"The next task runs with a better playbook. Because updates are deltas, context collapse doesn't happen.", l:[0]}
 ],
 ideas:["Roles: Generator, Reflector, Curator.","Evolving playbook of itemized strategies, not one monolithic prompt.","Delta updates preserve detail and are cheap to apply.","Letta's Context-Bench evaluates agents on multi-hop retrieval over files using tools like grep_files and open_files: a test of how well a model manages its own context."],
 traps:["Letting an LLM rewrite a long system prompt end to end every iteration.","Keeping lessons with no counters, so bad advice never gets pruned."],
 qa:[["What's context collapse and how do you prevent it?","Iteratively rewriting the full context makes it shrink and lose detail. Prevent it with itemized delta updates, as in ACE, and by keeping history of what each change did."],
     ["How would you apply ACE to a customer's support agent?","Log every resolved and failed ticket trajectory, have a reflector extract lessons, have a curator add them as tagged playbook items with counters, and gate new items through evals before they go live."],
     ["Why separate Reflector and Curator?","Reflection is analysis; curation is editing with rules (dedupe, merge, prune). Splitting them keeps each prompt focused and the playbook consistent."]]
},
{id:"skills", mod:3, sec:"3.3", name:"Agent Skills",
 title:"Agent Skills and progressive disclosure",
 thesis:"Anthropic's Agent Skills keep context small by loading knowledge in layers: a one-line description up front, the full SKILL.md only when relevant, and extra files or scripts only when needed.",
 vb:[710,290],
 codeTitle:"skills/pdf-forms/SKILL.md",
 code:`---
name: pdf-forms
description: Fill and validate PDF forms. Use when the
  user asks to fill, read or flatten a PDF form.
---
# Filling PDF forms
1. Run scripts/extract_fields.py on the PDF.
2. Map the user's data to the field names.
3. For XFA forms, read reference/xfa.md first.
4. Run scripts/fill.py, then scripts/validate.py.`,
 nodes:[
  ["start",90,70,"Session start","agent boots"],
  ["meta",265,70,"Skill metadata","name + 1 line each"],
  ["req",440,70,"User request","\"fill this PDF form\""],
  ["match",615,70,"Match","model picks skill"],
  ["body",615,220,"Load SKILL.md","full instructions"],
  ["refs",440,220,"Load references","only if needed"],
  ["scripts",265,220,"Run scripts","output, not source"],
  ["done",90,220,"Result","lean context"]
 ],
 edges:[["start","meta"],["meta","req"],["req","match"],["match","body"],["body","refs"],["refs","scripts"],["scripts","done"]],
 steps:[
  {t:"Only metadata at startup", n:["start","meta"], e:["start>meta"], d:"Level 1: the agent's context holds just each skill's name and description. That's a few dozen tokens per skill, so hundreds can be installed.", l:[0,1,2,3,4]},
  {t:"A request comes in", n:["req"], e:["meta>req"], d:"\"Fill in this vendor onboarding PDF.\""},
  {t:"The model picks a skill", n:["match"], e:["req>match"], d:"The description is what the model matches on, so write it like a trigger: what it does and when to use it.", l:[2,3]},
  {t:"Load the body", n:["body"], e:["match>body"], d:"Level 2: the full SKILL.md is read into context only now.", l:[5,6,7,8,9]},
  {t:"Load references lazily", n:["refs"], e:["body>refs"], d:"Level 3: extra files such as reference/xfa.md are read only if this case needs them.", l:[8]},
  {t:"Run code instead of reading it", n:["scripts"], e:["refs>scripts"], d:"Scripts execute and only their output enters context. Deterministic work stays in code, not in tokens.", l:[6,9]},
  {t:"Lean context, better answers", n:["done"], e:["scripts>done"], d:"The agent had specialist knowledge available without paying for it on every call. The same RAM idea from context engineering."}
 ],
 ideas:["Three levels: metadata always, SKILL.md on match, bundled files on demand.","The description is the trigger; write it precisely.","Put deterministic steps in scripts.","For FDEs: package a customer's procedures as skills instead of one giant system prompt."],
 traps:["Stuffing every procedure into the system prompt.","Vague descriptions, so the right skill never loads."],
 qa:[["What problem does progressive disclosure solve?","Context is finite and costly. Loading knowledge only when it's relevant lets an agent carry many specialties without diluting attention or paying tokens on every call."],
     ["How would you use skills in a customer deployment?","Turn each of the customer's recurring procedures (close the books, onboard a vendor) into a skill with precise descriptions, scripts for the deterministic steps, and evals per skill."]]
},
{id:"finetune", mod:3, sec:"3.4", name:"LoRA, QLoRA, distillation",
 title:"Adapting a model: LoRA, QLoRA and distillation",
 thesis:"When prompting and RAG aren't enough, you change the model. LoRA trains a tiny add-on instead of all the weights, QLoRA does it on a 4-bit base to fit one GPU, and distillation teaches a small model to imitate a big one.",
 vb:[710,290],
 codeTitle:"QLoRA setup with Hugging Face PEFT",
 code:`bnb = BitsAndBytesConfig(load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained(BASE,
        quantization_config=bnb)            # frozen, 4-bit

cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
        target_modules=["q_proj", "v_proj"])
model = get_peft_model(model, cfg)
model.print_trainable_parameters()          # well under 1%

# distillation: student matches teacher's distribution
loss = kl_div(log_softmax(student_logits / T),
              softmax(teacher_logits / T)) * T**2`,
 nodes:[
  ["base",90,70,"Base model","frozen W · 8B"],
  ["quant",265,70,"4-bit quantize","QLoRA · NF4"],
  ["lora",440,70,"LoRA adapters","W + B·A, r=16"],
  ["train",615,70,"Train","your labeled data"],
  ["adapter",615,220,"Adapter file","tens of MB"],
  ["serve",440,220,"Serve","base + adapter"],
  ["student",265,220,"Student model","small · fast"],
  ["teacher",90,220,"Teacher model","large · slow"]
 ],
 edges:[["base","quant"],["quant","lora"],["lora","train"],["train","adapter"],["adapter","serve"],["teacher","student",0,"soft labels"],["student","serve"]],
 steps:[
  {t:"Start from a frozen base", n:["base"], d:"Full fine-tuning updates billions of weights and needs a lot of GPU memory. LoRA leaves them untouched."},
  {t:"QLoRA: quantize to 4-bit", n:["quant"], e:["base>quant"], d:"Load the base in 4-bit NF4 so an 8B model fits on one GPU. Compute runs in bfloat16; only storage is 4-bit.", l:[0,1,2,3,4]},
  {t:"Add low-rank adapters", n:["lora"], e:["quant>lora"], d:"For chosen weight matrices W, add a trainable product B·A of rank r (say 16). The update is tiny compared to W, often well under 1% of parameters.", l:[6,7,8,9]},
  {t:"Train on your data", n:["train"], e:["lora>train"], d:"Hundreds to thousands of high-quality examples of the behaviour you want: a format, a tone, a domain task. Quality beats volume."},
  {t:"Ship a small adapter", n:["adapter","serve"], e:["train>adapter","adapter>serve"], d:"The result is an adapter file of tens of MB. Serve it on top of the base; one base can host many customers' adapters."},
  {t:"Distillation", n:["teacher","student"], e:["teacher>student"], d:"A large teacher model produces outputs or probability distributions; a small student learns to match them. You get most of the quality at a fraction of the latency and cost.", l:[11,12,13]},
  {t:"Serve the cheap model", n:["serve"], e:["student>serve"], d:"Distilled or adapted small models are how you hit tight latency, cost or on-prem constraints."},
  {t:"RAG or fine-tune?", n:["serve"], d:"Objective: RAG adds knowledge, fine-tuning changes behaviour. Cost: fine-tuning is up-front CapEx, RAG is per-query OpEx. Updates: RAG reindexes in minutes, fine-tuning needs retraining. Explainability: RAG cites sources, fine-tuned knowledge is opaque."}
 ],
 ideas:["LoRA: train low-rank adapters, keep the base frozen.","QLoRA: LoRA on a 4-bit quantized base; fits big models on one GPU.","Distillation: student imitates teacher, for speed and cost.","Most enterprise asks are knowledge problems; start with RAG and fine-tune for behaviour."],
 traps:["Fine-tuning to add facts that change weekly.","Training on a few hundred noisy examples and expecting magic.","Skipping evals before and after tuning."],
 qa:[["Why LoRA instead of full fine-tuning?","Far less memory and compute, tiny artifacts, many adapters per base model, and less risk of damaging general capabilities."],
     ["When would you distill?","When a large model does the task well but is too slow or expensive at production volume, or must run on-prem on small hardware."],
     ["The customer wants the model to know their product catalog. Fine-tune?","No. The catalog changes and needs citations; use RAG. Fine-tune only if they also need a specific output behaviour the base model can't follow."]]
}
);
