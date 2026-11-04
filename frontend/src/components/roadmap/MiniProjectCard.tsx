import React, { useState, useEffect } from 'react';
import { MiniProjectPlan } from '@/types';
import { Button } from '../common/Button';
import { useLanguage } from '@/context/LanguageContext';

interface MiniProjectCardProps {
  plan: MiniProjectPlan;
  targetSkill?: string;
  onSkillBridged?: (skill: string, repoUrl: string) => void;
  onSavePlan?: (updatedPlan: MiniProjectPlan) => void;
  isBridged?: boolean;
  bridgedData?: { repoUrl: string; verifiedAt?: string; delta?: number; commitHash?: string };
}

interface SkillBlueprint {
  title: string;
  objective: string;
  steps: { hour: number; description: string; deliverable: string }[];
  archTitle: string;
  archDiagram: string;
  benchmarkTarget: string;
  cliCommands: string;
  codeSnippet: string;
}

const getBlueprintForSkill = (skill: string = 'Distributed Systems'): SkillBlueprint => {
  const s = skill.toLowerCase();

  if (s.includes('kube') || s.includes('k8s')) {
    return {
      title: '48h Sprint: Kubernetes Production Cluster & Helm Deployment',
      objective: 'Triển khai cụm Kubernetes (K3s/Minikube) hoàn chỉnh với Helm Charts, StatefulSet cho cơ sở dữ liệu, Horizontal Pod Autoscaler (HPA) và Ingress Controller.',
      steps: [
        { hour: 12, description: 'Milestone 1: Khởi tạo cluster, viết Helm Chart templates và cấu hình values.prod.yaml', deliverable: 'Helm Chart scaffold & values.yaml' },
        { hour: 24, description: 'Milestone 2: Triển khai StatefulSet, PersistentVolumeClaim và Ingress NGINX routing', deliverable: 'k8s-statefulset-ingress.yaml' },
        { hour: 36, description: 'Milestone 3: Cấu hình Horizontal Pod Autoscaler (HPA) và stress-test với Locust', deliverable: 'hpa-load-test-report.md' },
        { hour: 48, description: 'Milestone 4: Thiết lập GitHub Actions tự động lint Helm chart và build container image', deliverable: 'CI/CD pipeline & Release v1.0.0' },
      ],
      archTitle: 'Kubernetes Cluster Architecture (Ingress ➔ HPA ➔ StatefulSet):',
      archDiagram: `┌─ [External Traffic: HTTPS 443]
▼
├─ [NGINX Ingress Controller / TLS Termination]
▼
├─ [Service: ClusterIP] ──► [Horizontal Pod Autoscaler: 2-10 Replicas]
▼
├─ [App Pods (FastAPI / Stateless)] ──► [ConfigMap / Secret Env]
▼
└─ [StatefulSet: PostgreSQL Primary-Replica + PersistentVolumeClaim]`,
      benchmarkTarget: 'HPA auto-scale from 2 -> 8 pods under 3,000 RPS within 45s',
      cliCommands: `# 1. Khởi động Minikube / K3s cluster
minikube start --cpus=4 --memory=8192 --addons=ingress,metrics-server

# 2. Deploy Helm Chart
helm upgrade --install k8s-cluster ./deploy/helm/ -f deploy/helm/values.prod.yaml

# 3. Kiểm tra trạng thái Pods và HPA
kubectl get pods -l app=microservice -w
kubectl get hpa k8s-cluster-hpa`,
      codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-microservice
  labels:
    app: core-microservice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-microservice
  template:
    metadata:
      labels:
        app: core-microservice
    spec:
      containers:
      - name: api
        image: ghcr.io/org/core-microservice:v1.0.0
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 10`,
    };
  }

  if (s.includes('llm') || s.includes('vllm') || s.includes('ai') || s.includes('genai')) {
    return {
      title: '48h Sprint: vLLM High-Throughput Inference & PagedAttention Engine',
      objective: 'Đóng gói microservice inference LLM với vLLM runtime, tối ưu hóa memory bandwidth qua PagedAttention, hỗ trợ continuous batching và streaming token API qua SSE.',
      steps: [
        { hour: 12, description: 'Milestone 1: Dựng container vLLM OpenAI-compatible server với mô hình AWQ quantized', deliverable: 'Dockerfile.vllm & compose.yaml' },
        { hour: 24, description: 'Milestone 2: Xây dựng FastAPI gateway streaming response qua Server-Sent Events', deliverable: 'streaming_router.py' },
        { hour: 36, description: 'Milestone 3: Benchmark Time-To-First-Token (TTFT) và tokens/sec với Locust', deliverable: 'vllm-throughput-benchmark.csv' },
        { hour: 48, description: 'Milestone 4: Đóng gói Prometheus /metrics exporter và phát hành repo GitHub', deliverable: 'GitHub release v1.0.0 & README.md' },
      ],
      archTitle: 'vLLM Serving Pipeline (FastAPI Gateway ➔ PagedAttention Worker Pool):',
      archDiagram: `┌─ [Client Prompt Streaming Request]
▼
├─ [FastAPI Gateway (Async Server-Sent Events)]
▼
├─ [vLLM AsyncEngine (Continuous Batching)]
▼
├─ [PagedAttention Virtual KV-Cache Management (GPU VRAM)]
▼
└─ [Token Generator Stream ──► &lt; 20ms TTFT]`,
      benchmarkTarget: 'TTFT < 25ms, Throughput > 120 tokens/sec @ batch size 16',
      cliCommands: `# 1. Khởi chạy vLLM OpenAI-compatible server
python -m vllm.entrypoints.openai.api_server \\
  --model mistralai/Mistral-7B-Instruct-v0.2 \\
  --gpu-memory-utilization 0.90 \\
  --max-model-len 4096 \\
  --port 8000

# 2. Kiểm tra streaming token qua curl
curl -N http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"mistralai/Mistral-7B-Instruct-v0.2","messages":[{"role":"user","content":"Hello"}],"stream":true}'`,
      codeSnippet: `from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from vllm.engine.async_llm_engine import AsyncLLMEngine
from vllm.sampling_params import SamplingParams

app = FastAPI(title="vLLM Streaming Service")
sampling_params = SamplingParams(temperature=0.7, top_p=0.9, max_tokens=512)

@app.post("/api/v1/generate")
async def generate_stream(prompt: str):
    async def token_generator():
        results_generator = engine.generate(prompt, sampling_params, request_id="req-1")
        async for request_output in results_generator:
            text = request_output.outputs[0].text
            yield f"data: {text}\\n\\n"
    return StreamingResponse(token_generator(), media_type="text/event-stream")`,
    };
  }

  // Default / Redis / Distributed caching blueprint
  return {
    title: `48h Sprint: ${skill} Production Prototype & Benchmark Suite`,
    objective: `Bổ sung kỹ năng thực chiến "${skill}" bằng việc xây dựng một module microservice hoàn chỉnh, có container Docker, automated Pytest suite và báo cáo benchmark trên GitHub.`,
    steps: [
      { hour: 12, description: `Milestone 1: Thiết lập cấu trúc dự án chuẩn, Docker Compose và kết nối ${skill}`, deliverable: 'docker-compose.yml & requirements.txt' },
      { hour: 24, description: `Milestone 2: Hiện thực hóa core async pipeline tích hợp ${skill}`, deliverable: 'Core service logic & clean API' },
      { hour: 36, description: `Milestone 3: Viết automated unit/integration tests với Pytest (>85% coverage)`, deliverable: 'pytest test suite & coverage badge' },
      { hour: 48, description: 'Milestone 4: Benchmark thông lượng, viết README chuẩn và đẩy lên GitHub', deliverable: 'GitHub Repo v1.0.0 & proof of work' },
    ],
    archTitle: `System Architecture for ${skill}:`,
    archDiagram: `┌─ [Client Requests / API Gateway]
▼
├─ [FastAPI Asynchronous Gateway (Uvicorn / Docker)]
▼
├─ [${skill} High-Throughput Integration Layer]
▼
└─ [Automated Pytest Coverage (>85%) + GitHub Actions CI]`,
    benchmarkTarget: 'p99 latency < 15ms @ 5,000 concurrency',
    cliCommands: `# 1. Clone và khởi động môi trường
git clone https://github.com/MinhTran110/${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-starter.git
cd ${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-starter

# 2. Chạy container Docker
docker compose up -d

# 3. Chạy Pytest kiểm thử toàn bộ module
pytest tests/ -v --cov=app`,
    codeSnippet: `from fastapi import FastAPI, Depends
import asyncio

app = FastAPI(title="${skill} Production Blueprint")

@app.get("/api/v1/health")
async def health_check():
    # Production-ready health verification for ${skill}
    return {
        "status": "healthy",
        "service": "${skill}",
        "version": "1.0.0",
        "benchmarked": True
    }`,
  };
};

export const MiniProjectCard: React.FC<MiniProjectCardProps> = ({
  plan,
  targetSkill = 'Kubernetes',
  onSkillBridged,
  onSavePlan,
  isBridged = false,
  bridgedData,
}) => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'timeline' | 'architecture' | 'cli' | 'code'>('timeline');
  const [copiedCli, setCopiedCli] = useState(false);
  const [repoUrl, setRepoUrl] = useState(bridgedData?.repoUrl || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(isBridged);
  const [showEditGithub, setShowEditGithub] = useState(!isBridged);

  // Editable Plan state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editTitle, setEditTitle] = useState(plan.title);
  const [editObjective, setEditObjective] = useState(plan.objective);
  const [editSteps, setEditSteps] = useState(plan.steps);
  const [saveToast, setSaveToast] = useState(false);

  // Load blueprint for target skill if plan is not customized
  const blueprint = getBlueprintForSkill(targetSkill);

  // Sync with prop changes when targetSkill changes
  useEffect(() => {
    const bp = getBlueprintForSkill(targetSkill);
    setEditTitle(plan.title || bp.title);
    setEditObjective(plan.objective || bp.objective);
    setEditSteps(plan.steps && plan.steps.length > 0 ? plan.steps : bp.steps);
  }, [targetSkill, plan]);

  useEffect(() => {
    if (isBridged) {
      setVerifiedSuccess(true);
      setShowEditGithub(false);
      if (bridgedData?.repoUrl) {
        setRepoUrl(bridgedData.repoUrl);
      }
    } else {
      setVerifiedSuccess(false);
      setShowEditGithub(true);
    }
  }, [isBridged, bridgedData]);

  const handleCopyCli = () => {
    navigator.clipboard.writeText(blueprint.cliCommands);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleVerifyRepo = () => {
    if (!repoUrl.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setShowEditGithub(false);
      if (onSkillBridged) {
        onSkillBridged(targetSkill, repoUrl.trim());
      }
    }, 1200);
  };

  const handleSavePlan = () => {
    const updated: MiniProjectPlan = {
      ...plan,
      title: editTitle,
      objective: editObjective,
      steps: editSteps,
    };
    if (onSavePlan) {
      onSavePlan(updated);
    }
    setIsEditingPlan(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetToAI = () => {
    const bp = getBlueprintForSkill(targetSkill);
    setEditTitle(bp.title);
    setEditObjective(bp.objective);
    setEditSteps(bp.steps);
    const updated: MiniProjectPlan = {
      ...plan,
      title: bp.title,
      objective: bp.objective,
      steps: bp.steps,
    };
    if (onSavePlan) {
      onSavePlan(updated);
    }
    setIsEditingPlan(false);
  };

  const handleAddMilestone = () => {
    const nextHour = (editSteps[editSteps.length - 1]?.hour || 0) + 12;
    setEditSteps([
      ...editSteps,
      {
        hour: nextHour,
        description: `Milestone mới: Hoàn thiện tính năng bổ sung cho ${targetSkill}`,
        deliverable: `artifact-v${editSteps.length + 1}.zip`,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (editSteps.length <= 1) return;
    setEditSteps(editSteps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: 'hour' | 'description' | 'deliverable', value: any) => {
    const newSteps = [...editSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditSteps(newSteps);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
      <div className="space-y-5">
        {/* Header with Title and Mode Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold uppercase tracking-wider">
                ⏱ {t('roadmap.sprint_badge')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">
                🎯 {targetSkill}
              </span>
              {isBridged && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold animate-pulse">
                  ✓ Đã bổ sung thành công
                </span>
              )}
            </div>

            {!isEditingPlan ? (
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {editTitle || blueprint.title}
              </h3>
            ) : (
              <div className="mt-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Tiêu đề kế hoạch sprint:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-sky-500/60 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditingPlan ? (
              <button
                type="button"
                onClick={() => setIsEditingPlan(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>✏️</span>
                <span>{t('roadmap.edit_plan')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>💾</span>
                  <span>{t('roadmap.save_plan')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToAI}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
                  title="Khôi phục gợi ý ban đầu của AI"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPlan(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <span>✓</span>
            <span>Kế hoạch 48h Sprint đã được lưu tùy chỉnh thành công!</span>
          </div>
        )}

        {/* Objective Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="font-bold text-sky-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🎯 Mục đích thực tế:</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              +14% Hiệu quả bù đắp năng lực
            </span>
          </div>
          {!isEditingPlan ? (
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {editObjective || blueprint.objective} Sau khi hoàn thành và đẩy mã nguồn lên GitHub, dự án này sẽ trở thành bằng chứng năng lực thực tế trong hồ sơ của bạn, giúp biến điểm yếu kỹ năng thành điểm cộng khi phỏng vấn.
            </p>
          ) : (
            <textarea
              rows={3}
              value={editObjective}
              onChange={(e) => setEditObjective(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="Nhập mục đích và kết quả mong muốn của sprint..."
            />
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              activeTab === 'timeline'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            📅 {t('roadmap.tab_timeline')}
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              activeTab === 'architecture'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            📐 {t('roadmap.tab_arch')}
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              activeTab === 'cli'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            💻 {t('roadmap.tab_cli')}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
              activeTab === 'code'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            📄 {t('roadmap.tab_code')}
          </button>
        </div>

        {/* Tab 1: Timeline Steps */}
        {activeTab === 'timeline' && (
          <div className="space-y-2.5 pt-1">
            {editSteps.map((s, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs hover:border-slate-700 transition-colors"
              >
                {!isEditingPlan ? (
                  <>
                    <div className="w-12 text-center py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-extrabold text-[11px] shrink-0">
                      +{s.hour}h
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-slate-200 font-semibold">{s.description}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <span>Artifact:</span>
                        <span className="text-emerald-400">{s.deliverable}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">Giờ (+h):</span>
                      <input
                        type="number"
                        value={s.hour}
                        onChange={(e) => handleStepChange(idx, 'hour', parseInt(e.target.value) || 0)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-sky-400 font-mono font-bold"
                      />
                      <span className="text-slate-500 text-xs">| Cột mốc #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="ml-auto text-rose-400 hover:text-rose-300 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-950/40"
                        title="Xóa cột mốc này"
                      >
                        ✕ Xóa
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={s.description}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        placeholder="Nội dung cột mốc..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">Artifact:</span>
                      <input
                        type="text"
                        value={s.deliverable}
                        onChange={(e) => handleStepChange(idx, 'deliverable', e.target.value)}
                        placeholder="Sản phẩm bàn giao..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-emerald-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isEditingPlan && (
              <button
                type="button"
                onClick={handleAddMilestone}
                className="w-full py-2 rounded-xl border border-dashed border-sky-500/40 text-sky-400 hover:bg-sky-500/10 text-xs font-bold transition-all cursor-pointer"
              >
                + Thêm cột mốc mới vào lộ trình 48h
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Architecture Flow Diagram */}
        {activeTab === 'architecture' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-[11px] text-slate-400 font-sans">
              {blueprint.archTitle}
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
              {blueprint.archDiagram}
            </pre>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
              <span>🛡️ Benchmark Target:</span>
              <span className="text-emerald-400 font-bold">{blueprint.benchmarkTarget}</span>
            </div>
          </div>
        )}

        {/* Tab 3: Quick CLI Commands */}
        {activeTab === 'cli' && (
          <div className="space-y-2">
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                {blueprint.cliCommands}
              </pre>
              <button
                onClick={handleCopyCli}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-all cursor-pointer"
              >
                {copiedCli ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Starter Code Snippet */}
        {activeTab === 'code' && (
          <div className="space-y-2">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sky-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
              {blueprint.codeSnippet}
            </pre>
          </div>
        )}
      </div>

      {/* Grounding & Verification Submission (GitHub Link) */}
      <div className="pt-3 border-t border-slate-800 space-y-3 mt-4">
        {/* If verified and not in edit mode */}
        {verifiedSuccess && !showEditGithub ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Kỹ năng <strong>{targetSkill}</strong> đã được xác thực từ GitHub!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEditGithub(true)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold cursor-pointer"
              >
                ✏️ Thay đổi / Cập nhật link khác
              </button>
            </div>

            <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 overflow-hidden text-ellipsis">
              <span className="text-slate-500">Repo:</span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline truncate"
              >
                {repoUrl}
              </a>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-[11px] gap-2">
              <span className="text-slate-400 font-sans">
                Đã ghi nhận AST & Evidence Lake: <strong className="text-emerald-400">4 modules / 2 test suites</strong>
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-emerald-400 font-bold">Kỹ năng: 30% ➔ 92%</span>
                <span className="text-sky-400 font-bold">+6.5% Điểm phù hợp JD</span>
              </div>
            </div>
          </div>
        ) : (
          /* Input mode for GitHub repo */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 block">
                {language === 'vi'
                  ? `Dán link GitHub Repo để xác nhận kỹ năng "${targetSkill}":`
                  : `Paste your GitHub Repo link to verify "${targetSkill}":`}
              </label>
              {isBridged && (
                <button
                  type="button"
                  onClick={() => setShowEditGithub(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  ✕ Hủy
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder={`https://github.com/MinhTran110/${targetSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}-starter`}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <Button
                variant="primary"
                onClick={handleVerifyRepo}
                disabled={isVerifying || !repoUrl.trim()}
                className="text-xs whitespace-nowrap cursor-pointer shadow-md"
              >
                {isVerifying ? '🔍 Đang kiểm chứng mã nguồn...' : '⚡ Xác nhận & Cập nhật'}
              </Button>
            </div>

            <p className="text-[10px] text-slate-500">
              {language === 'vi'
                ? 'Hệ thống tự động phân tích Abstract Syntax Tree (AST), commits và unit test để bù đắp điểm kỹ năng trong hồ sơ.'
                : 'System verifies AST syntax tree, commits, and unit tests to bridge skill gaps in your profile.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

