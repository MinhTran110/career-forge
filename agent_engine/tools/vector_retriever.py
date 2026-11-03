import math
import re
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels


class VectorRetrieverTool:
    """Manages Candidate Ground-Truth Evidence storage and semantic verification in Qdrant."""

    VECTOR_DIM = 128

    def __init__(self, collection_name: str = "candidate_evidence", storage_path: str = "./qdrant_storage"):
        self.collection_name = collection_name
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Connect to server if available, otherwise use embedded local disk engine, fallback to :memory: if locked
        try:
            self.client = QdrantClient(host="localhost", port=6333, timeout=2.0, check_compatibility=False)
            self.client.get_collections()
        except Exception:
            try:
                self.client = QdrantClient(path=str(self.storage_path))
            except Exception:
                self.client = QdrantClient(":memory:")

        self._ensure_collection()

    def _ensure_collection(self):
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in collections:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=self.VECTOR_DIM,
                    distance=qmodels.Distance.COSINE,
                ),
            )

    def _generate_dense_vector(self, text: str) -> List[float]:
        """Generates a normalized dense vector embedding for semantic matching."""
        vector = [0.0] * self.VECTOR_DIM
        words = re.findall(r'\w+', text.lower())
        if not words:
            return vector

        for word in words:
            h = hash(word)
            idx = abs(h) % self.VECTOR_DIM
            weight = 1.0 + (len(word) / 10.0)
            vector[idx] += weight

        # Normalize to unit vector for cosine distance
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        return [round(x / norm, 6) for x in vector]

    def index_evidence(self, candidate_id: str, evidence_items: List[Dict[str, Any]]) -> int:
        """Indexes atomic evidence chunks (from CV & GitHub) into Qdrant."""
        points = []
        for item in evidence_items:
            text = item.get("text", "")
            if not text:
                continue
            
            vec = self._generate_dense_vector(text)
            point_id = str(uuid.uuid4())
            points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=vec,
                    payload={
                        "candidate_id": candidate_id,
                        "text": text,
                        "source": item.get("source", "cv"),
                        "category": item.get("category", "experience"),
                        "verified": item.get("verified", True),
                    },
                )
            )

        if points:
            self.client.upsert(collection_name=self.collection_name, points=points)
        return len(points)

    def retrieve_evidence(self, candidate_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Queries semantically relevant evidence chunks for a given capability claim."""
        query_vec = self._generate_dense_vector(query)
        filter_condition = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="candidate_id",
                    match=qmodels.MatchValue(value=candidate_id),
                )
            ]
        )

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vec,
            query_filter=filter_condition,
            limit=limit,
        )

        return [
            {
                "score": round(res.score, 4),
                "text": res.payload.get("text"),
                "source": res.payload.get("source"),
                "category": res.payload.get("category"),
            }
            for res in results.points
        ]

    def verify_claim(self, candidate_id: str, claim: str, threshold: float = 0.5) -> Dict[str, Any]:
        """Audits a resume bullet point against the candidate's ground-truth lake."""
        evidences = self.retrieve_evidence(candidate_id, claim, limit=3)
        top_score = evidences[0]["score"] if evidences else 0.0

        is_supported = top_score >= threshold
        return {
            "claim": claim,
            "supported": is_supported,
            "confidence_score": top_score,
            "grounding_evidence": evidences[0] if evidences else None,
        }
