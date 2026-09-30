# Project 5: containerize and deploy

Take the Project 3 tickets API (copied here so this folder is self-contained) and make it
shippable: health endpoints, a multi-stage Docker image, docker compose for local runs,
a GitHub Actions CI pipeline, and Kubernetes manifests you can run on your laptop with kind.

## What you'll learn
- Liveness (`/healthz`) vs readiness (`/readyz`) and why they check different things
- Multi-stage Docker builds, layer caching, non-root containers, HEALTHCHECK
- docker compose with a named volume for persistent data
- CI that runs tests first, then builds and smoke-tests the image
- A Kubernetes Deployment + Service, probes, resource limits, and a Secret for the API key

## Prerequisites
- Python 3.10+ (tests run without Docker)
- Optional: Docker Desktop (or Docker Engine), and for Kubernetes: `kind` and `kubectl`

## Setup and test (no Docker needed)
macOS / Linux:
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q          # expected: 9 passed
```
Windows PowerShell:
```powershell
py -m venv .venv; .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest -q
```

## Run without Docker
```bash
export API_KEY=dev-key          # PowerShell: $env:API_KEY="dev-key"
uvicorn app.main:app --reload
curl localhost:8000/healthz
```

## Run with Docker
```bash
docker build -t tickets-api:local .
docker run --rm -p 8000:8000 -e API_KEY=dev-key tickets-api:local
# or, with a persistent volume:
API_KEY=dev-key docker compose up --build      # PowerShell: $env:API_KEY="dev-key"; docker compose up --build
docker compose down            # add -v to also delete the data volume
```

## Run on Kubernetes with kind
```bash
kind create cluster --name tickets
docker build -t tickets-api:local .
kind load docker-image tickets-api:local --name tickets     # kind can't see your local images otherwise
kubectl create secret generic tickets-api --from-literal=api-key=dev-key
kubectl apply -f k8s/
kubectl rollout status deployment/tickets-api
kubectl get pods                                              # READY 1/1 once /readyz passes
kubectl port-forward service/tickets-api 8080:80
curl -H "X-API-Key: dev-key" localhost:8080/tickets          # in another terminal
kind delete cluster --name tickets                            # clean up
```

## CI
`.github/workflows/ci.yml` runs `pytest` on Python 3.11 and 3.12, then builds the image and
smoke-tests it with `curl`. Push this folder as its own repo to see it run.

## Notes and limits
- SQLite lives inside the container, so the Deployment runs 1 replica with an `emptyDir`
  volume (data is lost when the pod is replaced). For real use, point `DATABASE_URL` at Postgres.
- Behind a corporate proxy that intercepts TLS, `pip install` inside `docker build` can fail
  with CERTIFICATE_VERIFY_FAILED; that is a network issue, not a Dockerfile bug.

## Stretch goals
- Swap SQLite for a Postgres service in docker compose and a StatefulSet (or managed DB) in Kubernetes.
- Push the image to GitHub Container Registry from CI on every tag.
- Add a HorizontalPodAutoscaler once the database is external.
- Add an Ingress with TLS, and structured JSON logging.
