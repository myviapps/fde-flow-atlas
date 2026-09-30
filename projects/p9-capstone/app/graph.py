"""The agentic RAG loop as a LangGraph StateGraph.

retrieve -> grade -> (relevant? generate : rewrite -> retrieve, max N times) -> check -> END
"""
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.corpus import search
from app.llm import LLM, REFUSAL


class RAGState(TypedDict, total=False):
    question: str
    query: str
    groups: list[str]
    rewrites: int
    docs: list[dict]
    relevant: list[dict]
    answer: str
    sources: list[str]
    grounded: bool


def build_graph(llm: LLM, max_rewrites: int = 2):
    def retrieve(s: RAGState) -> dict:
        return {"docs": search(s["query"], s["groups"], k=3)}

    def grade(s: RAGState) -> dict:
        return {"relevant": [d for d in s["docs"] if llm.grade(s["query"], d)]}

    def route(s: RAGState) -> str:
        if s["relevant"]:
            return "generate"
        return "rewrite" if s["rewrites"] < max_rewrites else "generate"

    def rewrite(s: RAGState) -> dict:
        return {"query": llm.rewrite(s["query"]), "rewrites": s["rewrites"] + 1}

    def generate(s: RAGState) -> dict:
        if not s["relevant"]:
            return {"answer": REFUSAL, "sources": []}
        return {"answer": llm.generate(s["question"], s["relevant"]),
                "sources": [d["id"] for d in s["relevant"]]}

    def check(s: RAGState) -> dict:
        if s["answer"] == REFUSAL:
            return {"grounded": True}
        if llm.is_grounded(s["answer"], s["relevant"]):
            return {"grounded": True}
        # Guardrail: never ship an unsupported answer.
        return {"grounded": False, "answer": REFUSAL, "sources": []}

    g = StateGraph(RAGState)
    for name, fn in [("retrieve", retrieve), ("grade", grade), ("rewrite", rewrite),
                     ("generate", generate), ("check", check)]:
        g.add_node(name, fn)
    g.add_edge(START, "retrieve")
    g.add_edge("retrieve", "grade")
    g.add_conditional_edges("grade", route, {"generate": "generate", "rewrite": "rewrite"})
    g.add_edge("rewrite", "retrieve")
    g.add_edge("generate", "check")
    g.add_edge("check", END)
    return g.compile()
