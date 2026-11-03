from typing import List, Dict, Any


class VectorRetrieverTool:
    """Queries semantic candidate profile knowledge and job embeddings in Qdrant."""

    def __init__(self, collection_name: str = "career_knowledge"):
        self.collection_name = collection_name

    def retrieve_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        return [
            {
                "score": 0.89,
                "payload": {
                    "skill": "FastAPI",
                    "evidence": "Built asynchronous streaming microservice with SSE.",
                },
            }
        ]
