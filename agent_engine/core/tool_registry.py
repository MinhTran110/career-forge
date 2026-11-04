from enum import Enum
from typing import Any, Callable


class ToolScope(str, Enum):
    """Granular permission scopes for autonomous agent tools."""
    READ_CV = "read_cv"
    CALL_GITHUB = "call_github"
    WRITE_EVIDENCE = "write_evidence"
    READ_EVIDENCE = "read_evidence"
    READ_NETWORK = "read_network"
    ANALYZE_JD = "analyze_jd"
    GENERATE_RESUME = "generate_resume"
    AUDIT_CLAIM = "audit_claim"
    EVALUATE_INTERVIEW = "evaluate_interview"


class AgentRole(str, Enum):
    """Standardized roles in CareerForge's Multi-Agent Swarm."""
    CANDIDATE_PROFILER = "candidate_profiler"
    MARKET_HUNTER = "market_hunter"
    SKILL_STRATEGIST = "skill_strategist"
    RESUME_STRATEGIST = "resume_strategist"
    FACT_CHECKER = "fact_checker"
    STAR_INTERVIEWER = "star_interviewer"


# Principle of Least Privilege: RBAC Mapping
ROLE_PERMISSIONS: dict[AgentRole, set[ToolScope]] = {
    AgentRole.CANDIDATE_PROFILER: {
        ToolScope.READ_CV,
        ToolScope.CALL_GITHUB,
        ToolScope.WRITE_EVIDENCE,
        ToolScope.READ_EVIDENCE,
    },
    AgentRole.MARKET_HUNTER: {
        ToolScope.READ_NETWORK,
        ToolScope.ANALYZE_JD,
    },
    AgentRole.SKILL_STRATEGIST: {
        ToolScope.READ_EVIDENCE,
        ToolScope.ANALYZE_JD,
    },
    AgentRole.RESUME_STRATEGIST: {
        ToolScope.GENERATE_RESUME,
        ToolScope.READ_EVIDENCE,
    },
    # CRITICAL SECURITY RULE: FactChecker is strictly read-only, CANNOT write or forge evidence
    AgentRole.FACT_CHECKER: {
        ToolScope.AUDIT_CLAIM,
        ToolScope.READ_EVIDENCE,
    },
    AgentRole.STAR_INTERVIEWER: {
        ToolScope.EVALUATE_INTERVIEW,
        ToolScope.READ_EVIDENCE,
    },
}


class PermissionDeniedError(Exception):
    """Raised when an agent attempts to execute an unauthorized tool."""
    pass


class BaseTool:
    """Production base tool wrapper with metadata and scope enforcement."""

    def __init__(
        self,
        name: str,
        description: str,
        required_scope: ToolScope,
        func: Callable[..., Any],
    ):
        self.name = name
        self.description = description
        self.required_scope = required_scope
        self.func = func

    def execute(self, *args: Any, **kwargs: Any) -> Any:
        return self.func(*args, **kwargs)


class ToolRegistry:
    """Central registry enforcing Role-Based Access Control on all agent tools."""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}
        self._register_default_tools()

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get_tool(self, name: str, agent_role: AgentRole) -> BaseTool:
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered in ToolRegistry.")

        tool = self._tools[name]
        allowed_scopes = ROLE_PERMISSIONS.get(agent_role, set())

        if tool.required_scope not in allowed_scopes:
            raise PermissionDeniedError(
                f"Access Denied: Agent '{agent_role.value}' does not possess required scope "
                f"'{tool.required_scope.value}' to invoke tool '{name}'."
            )

        return tool

    def list_tools(self, agent_role: AgentRole | None = None) -> list[BaseTool]:
        if not agent_role:
            return list(self._tools.values())
        allowed_scopes = ROLE_PERMISSIONS.get(agent_role, set())
        return [t for t in self._tools.values() if t.required_scope in allowed_scopes]

    def _register_default_tools(self) -> None:
        from agent_engine.tools.vector_retriever import VectorRetrieverTool
        from agent_engine.tools.document_parser import DocumentParserTool
        from agent_engine.tools.github_graphql import GitHubGraphQLTool
        from agent_engine.tools.job_hunter_tool import JobHunterTool

        vec_tool = VectorRetrieverTool()
        doc_parser = DocumentParserTool()
        gh_tool = GitHubGraphQLTool()
        job_hunter = JobHunterTool()

        # 1. Read-only Vector Search (Allowed for Fact Checker, Strategist, etc.)
        self.register(
            BaseTool(
                name="vector_query",
                description="Query Qdrant evidence lake for semantic claim verification",
                required_scope=ToolScope.READ_EVIDENCE,
                func=vec_tool.verify_claim,
            )
        )

        # 2. Vector Indexing Tool (Restricted to Profiler only)
        self.register(
            BaseTool(
                name="vector_index_evidence",
                description="Indexes candidate proof chunks into Qdrant collection",
                required_scope=ToolScope.WRITE_EVIDENCE,
                func=vec_tool.index_evidence,
            )
        )

        # 3. CV Document Parser Tool
        self.register(
            BaseTool(
                name="document_parser",
                description="Parses PDF/Image CV into structured chunks",
                required_scope=ToolScope.READ_CV,
                func=doc_parser.parse_file,
            )
        )

        # 4. GitHub Miner Tool
        self.register(
            BaseTool(
                name="github_miner",
                description="Queries GitHub GraphQL API for repositories and commits",
                required_scope=ToolScope.CALL_GITHUB,
                func=gh_tool.fetch_user_evidence,
            )
        )

        # 5. Job Hunter Tool
        self.register(
            BaseTool(
                name="job_hunter",
                description="Scrapes and deduplicates tech job postings",
                required_scope=ToolScope.READ_NETWORK,
                func=job_hunter.fetch_market_jobs,
            )
        )


# Global singleton registry
tool_registry = ToolRegistry()
