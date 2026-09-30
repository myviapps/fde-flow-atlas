def make(client, **kw):
    body = {"title": "Printer on fire", "priority": "high", **kw}
    r = client.post("/tickets", json=body)
    assert r.status_code == 201, r.text
    return r.json()


def test_create_returns_201_and_defaults(client):
    t = make(client)
    assert t["id"] == 1
    assert t["status"] == "open"
    assert t["description"] == ""


def test_validation_error_is_422(client):
    assert client.post("/tickets", json={"title": ""}).status_code == 422
    assert client.post("/tickets", json={"title": "x", "priority": "urgent"}).status_code == 422


def test_get_and_404(client):
    t = make(client)
    assert client.get(f"/tickets/{t['id']}").json()["title"] == "Printer on fire"
    assert client.get("/tickets/999").status_code == 404


def test_list_with_filter_and_pagination(client):
    for i in range(3):
        make(client, title=f"t{i}")
    client.patch("/tickets/2", json={"status": "closed"})
    assert len(client.get("/tickets").json()) == 3
    closed = client.get("/tickets", params={"status": "closed"}).json()
    assert [t["id"] for t in closed] == [2]
    page = client.get("/tickets", params={"limit": 1, "offset": 1}).json()
    assert [t["id"] for t in page] == [2]


def test_patch_updates_only_sent_fields(client):
    t = make(client, description="smoke")
    r = client.patch(f"/tickets/{t['id']}", json={"status": "in_progress"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "in_progress"
    assert body["description"] == "smoke"   # untouched
    assert client.patch("/tickets/42", json={"status": "closed"}).status_code == 404
    assert client.patch(f"/tickets/{t['id']}", json={"title": None}).status_code == 422


def test_auth_missing_and_wrong_key(client):
    assert client.get("/tickets", headers={"X-API-Key": "nope"}).status_code == 403
    client.headers.pop("X-API-Key")
    assert client.get("/tickets").status_code == 401
