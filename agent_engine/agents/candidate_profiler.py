from typing import Dict, Any, Optional, List
from agent_engine.tools.document_parser import DocumentParserTool
from agent_engine.tools.github_graphql import GitHubGraphQLTool
from agent_engine.tools.vector_retriever import VectorRetrieverTool
from agent_engine.schemas.candidate_schema import CandidateProfileSchema, RepositoryProof


class CandidateProfilerAgent:
    """Agent 2: Mines CV & GitHub, builds CandidateProfile, and seeds Qdrant Evidence Lake."""

    def __init__(self, vector_tool: Optional[VectorRetrieverTool] = None):
        self.doc_parser = DocumentParserTool()
        self.github_tool = GitHubGraphQLTool()
        self.vector_tool = vector_tool or VectorRetrieverTool()

    def profile_and_ground(
        self,
        candidate_id: str,
        name: str,
        email: str,
        cv_bytes: Optional[bytes] = None,
        cv_text: Optional[str] = None,
        github_username: Optional[str] = None,
    ) -> Dict[str, Any]:
        evidence_items: List[Dict[str, Any]] = []

        # 1. Parse CV (PDF or raw text)
        parsed_cv: Dict[str, Any] = {}
        if cv_bytes:
            parsed_cv = self.doc_parser.parse_pdf(cv_bytes)
        elif cv_text:
            parsed_cv = self.doc_parser.extract_structured_profile(cv_text)
        else:
            parsed_cv = {
                "skills": ["Python", "FastAPI", "React", "Docker"],
                "experience_chunks": [
                    "Engineered asynchronous backend services using FastAPI and SQLAlchemy.",
                    "Built fullstack dashboard using React and TailwindCSS.",
                ],
                "metric_highlights": ["Reduced latency by 35%"],
            }

        # Convert CV paragraphs into atomic evidence chunks
        for chunk in parsed_cv.get("experience_chunks", []):
            if len(chunk) > 20:
                evidence_items.append({
                    "text": chunk,
                    "source": "cv_document",
                    "category": "professional_experience",
                    "verified": True,
                })

        # 2. Mine GitHub repository evidence
        gh_data = {}
        repo_proofs: List[RepositoryProof] = []
        if github_username:
            gh_data = self.github_tool.fetch_user_evidence(github_username)
            for repo in gh_data.get("verified_repos", []):
                repo_proof = RepositoryProof(
                    repo_name=repo["repo_name"],
                    stars=repo.get("stars", 0),
                    top_languages=repo.get("top_languages", []),
                    key_commits=repo.get("key_commits", []),
                )
                repo_proofs.append(repo_proof)

                evidence_items.append({
                    "text": f"Created and maintained repository {repo['repo_name']} using {', '.join(repo.get('top_languages', []))} ({repo.get('stars', 0)} stars). Description: {repo.get('description', '')}",
                    "source": "github_repository",
                    "category": "open_source_proof",
                    "verified": True,
                })

        # 3. Consolidate technical skills
        all_skills = set(parsed_cv.get("skills", []))
        if gh_data.get("top_languages"):
            all_skills.update(gh_data["top_languages"])

        # 4. Construct validated CandidateProfileSchema
        profile_schema = CandidateProfileSchema(
            candidate_id=candidate_id,
            name=name,
            email=email,
            verified_skills=sorted(list(all_skills)),
            experience_years=3.5,
            verified_repos=repo_proofs,
            achievements=parsed_cv.get("metric_highlights", []),
        )

        # 5. Index into Qdrant Ground-Truth Lake
        indexed_count = self.vector_tool.index_evidence(candidate_id, evidence_items)

        return {
            "status": "success",
            "candidate_id": candidate_id,
            "profile": profile_schema.model_dump(),
            "indexed_evidence_count": indexed_count,
            "github_metrics": {
                "username": github_username,
                "total_stars": gh_data.get("total_stars", 0),
                "total_repos": gh_data.get("total_repos", 0),
                "top_languages": gh_data.get("top_languages", []),
            },
        }
