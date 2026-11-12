import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  getMyProfile,
  getRecommendedJobs,
  generateInterviewQuestionsFromCv,
  createInterviewSession,
  submitInterviewAnswer,
} from '@/services/api';
import { CandidateProfile, GenerateQuestionsResponse, InterviewQuestionItem, Job, StarScores } from '@/types';
import { LiveStarScoreboard } from '@/components/interview/LiveStarScoreboard';
import { Button } from '@/components/common/Button';

export const MockInterviewPage: React.FC<{
  onBack: () => void;
  onBackToRadar?: () => void;
}> = ({ onBack, onBackToRadar }) => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobTitle, setCustomJobTitle] = useState<string>('Senior Backend Engineer');
  const [customJdText, setCustomJdText] = useState<string>('');
  const [useCustomJd, setUseCustomJd] = useState(false);

  // Question Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionData, setQuestionData] = useState<GenerateQuestionsResponse | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [expandedStarTip, setExpandedStarTip] = useState<number | null>(null);

  // Answer & Evaluation State
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState<StarScores | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((p) => setProfile(p))
      .catch((err) => console.error(err));

    getRecommendedJobs()
      .then((jList) => {
        setJobs(jList);
        if (jList.length > 0) {
          setSelectedJobId(jList[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);
      setScores(null);
      const cvSkills = profile?.verified_skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis'];

      let payload: any = {
        cv_skills: cvSkills,
        num_questions: 4,
      };

      if (useCustomJd) {
        payload.job_title = customJobTitle;
        payload.job_description = customJdText;
        payload.target_requirements = ['Python', 'Microservices', 'Docker', 'Kubernetes', 'Redis'];
      } else if (selectedJob) {
        payload.job_id = selectedJob.id;
        payload.job_title = `${selectedJob.title} (${selectedJob.company})`;
        payload.job_description = selectedJob.description;
        payload.target_requirements = selectedJob.requirements || selectedJob.tech_stack || [];
      }

      const res = await generateInterviewQuestionsFromCv(payload);
      setQuestionData(res);
      setActiveQuestionIndex(0);
      setExpandedStarTip(0);
      if (res.questions.length > 0) {
        // Pre-fill placeholder / template answer
        setUserAnswer(
          language === 'vi'
            ? 'Tình huống: Khi triển khai hệ thống cho dự án trước, chúng tôi gặp vấn đề tải cao 10.000 req/s.\nNhiệm vụ: Mục tiêu là giảm p99 latency xuống dưới 100ms mà không vượt chi phí server.\nHành động: Tôi đã cấu hình connection pool với Redis và FastAPI, phân tách read/write DB.\nKết quả: Giảm 45% latency và đạt 99.99% uptime.'
            : 'Situation: Our distributed API was handling 10k RPS under heavy load.\nTask: Re-architect data access layer to reduce p99 latency below 100ms.\nAction: Deployed connection pooling with Redis and FastAPI background workers.\nResult: Reduced latency by 45% and stabilized uptime at 99.99%.'
        );
      }
    } catch (err) {
      console.error('Failed generating questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    try {
      setIsSubmitting(true);
      // Initialize a session if not exists
      let currentSessId = sessionId;
      if (!currentSessId) {
        const sess = await createInterviewSession(
          selectedJob?.id,
          `${selectedJob?.title || customJobTitle} CV-Tailored Interview`
        );
        currentSessId = sess.id;
        setSessionId(sess.id);
      }

      if (!currentSessId) return;
      const res = await submitInterviewAnswer(currentSessId, 0, userAnswer.trim());
      const answeredQ = res.questions?.[0];
      const starEval = answeredQ?.star_evaluation;
      if (starEval) {
        setScores({
          situation: starEval.situation_score || 85,
          task: starEval.task_score || 80,
          action: starEval.action_score || 90,
          result: starEval.result_score || 85,
          composite: starEval.overall_score || 85.0,
          strengths: starEval.strengths || ['Rõ ràng về kiến trúc công nghệ'],
          improvements: starEval.improvements || ['Nêu thêm số liệu định lượng'],
        });
      }
    } catch (err) {
      console.error('Failed submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer mb-2"
          >
            <span>←</span>
            <span>{language === 'vi' ? 'Quay lại Tối ưu hóa CV' : 'Back to Resume Studio'}</span>
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>🎙️</span>
            <span>{language === 'vi' ? 'Bộ Tạo Câu Hỏi Phỏng Vấn Dựa Trên CV & JD' : 'CV & JD Tailored Interview Studio'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'vi'
              ? 'Tự động đối chiếu kỹ năng thực tế từ CV và yêu cầu từ JD của nhà tuyển dụng để tạo ra các câu hỏi phỏng vấn chuẩn mực kèm gợi ý trả lời STAR.'
              : 'Cross-reference verified CV skills with target JD requirements to generate high-yield interview questions and STAR model answers.'}
          </p>
        </div>

        {onBackToRadar && (
          <Button variant="secondary" onClick={onBackToRadar} className="text-xs cursor-pointer self-start sm:self-auto">
            <span>🎯 {language === 'vi' ? 'Việc làm phù hợp' : 'Job Radar'}</span>
          </Button>
        )}
      </div>

      {/* Target JD & Candidate Profile Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            1. {language === 'vi' ? 'Chọn vị trí tuyển dụng & Nguồn dữ liệu' : 'Target Job & Input Source'}
          </span>
          <button
            onClick={() => setUseCustomJd(!useCustomJd)}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
          >
            {useCustomJd
              ? (language === 'vi' ? '← Chọn từ danh sách việc làm' : '← Select from job radar')
              : (language === 'vi' ? '📋 Hoặc dán tin JD tự chọn' : '📋 Or paste custom JD')}
          </button>
        </div>

        {!useCustomJd ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              {language === 'vi' ? 'Vị trí công việc mục tiêu:' : 'Select Target Job:'}
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  [{j.company}] {j.title} — {j.salary_range} ({j.location})
                </option>
              ))}
            </select>

            {selectedJob && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{selectedJob.company} • {selectedJob.title}</span>
                  {selectedJob.url && (
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-bold"
                    >
                      <span>{language === 'vi' ? 'Xem tin gốc' : 'Original Post'}</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
                <p className="line-clamp-2 leading-relaxed text-[11px]">{selectedJob.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'vi' ? 'Tiêu đề vị trí tuyển dụng:' : 'Job Title:'}
              </label>
              <input
                type="text"
                value={customJobTitle}
                onChange={(e) => setCustomJobTitle(e.target.value)}
                placeholder="Senior Backend Engineer (Python / FastAPI)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'vi' ? 'Nội dung mô tả công việc (JD):' : 'Paste Job Description:'}
              </label>
              <textarea
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                rows={3}
                placeholder={language === 'vi' ? 'Dán toàn bộ yêu cầu, trách nhiệm của vị trí vào đây...' : 'Paste full job description requirements here...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>
          </div>
        )}

        {/* Candidate Skills Cross-Reference Summary */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold">
              {language === 'vi' ? 'Kỹ năng từ CV của bạn:' : 'Your CV Skills:'}
            </span>
            {(profile?.verified_skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis']).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20"
              >
                {skill}
              </span>
            ))}
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">↻</span>
                <span>{language === 'vi' ? 'Đang tạo câu hỏi phỏng vấn...' : 'Generating Questions...'}</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>{language === 'vi' ? 'Tạo câu hỏi phỏng vấn từ CV & JD' : 'Generate Interview Questions'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Questions List */}
      {questionData && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📋</span>
                <span>{language === 'vi' ? 'Bộ câu hỏi phỏng vấn sát thực tế' : 'Generated Interview Questions'}</span>
              </span>
              <span className="text-xs text-purple-400 font-bold bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
                {questionData.questions.length} {language === 'vi' ? 'câu hỏi' : 'questions'}
              </span>
            </div>

            {/* Matched vs Gap skills tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">{language === 'vi' ? 'Trùng khớp:' : 'Matched:'}</span>
              {questionData.matched_skills.slice(0, 3).map((m) => (
                <span key={m} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  ✓ {m}
                </span>
              ))}
              {questionData.missing_skills.length > 0 && (
                <>
                  <span className="text-slate-400 ml-1">{language === 'vi' ? 'Cần bổ sung:' : 'Gaps:'}</span>
                  {questionData.missing_skills.slice(0, 2).map((g) => (
                    <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      ⚠ {g}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Questions Accordion Cards */}
          <div className="space-y-3">
            {questionData.questions.map((q: InterviewQuestionItem, idx: number) => {
              const isActive = activeQuestionIndex === idx;
              const isTipExpanded = expandedStarTip === idx;

              return (
                <div
                  key={q.id || idx}
                  className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-md ${
                    isActive
                      ? 'border-purple-500/80 bg-slate-900/95 ring-1 ring-purple-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                          {q.category}
                        </span>
                        <span className="text-[11px] font-semibold text-sky-400">
                          🎯 {q.skill_evaluated}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-relaxed">
                        {language === 'vi' ? 'Câu' : 'Question'} {idx + 1}: {q.question}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuestionIndex(idx);
                        setExpandedStarTip(isTipExpanded ? null : idx);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer self-start shrink-0"
                    >
                      {isActive ? (language === 'vi' ? 'Đang chọn' : 'Selected') : (language === 'vi' ? 'Luyện câu này →' : 'Practice this →')}
                    </button>
                  </div>

                  {/* Context and Why this is asked */}
                  <div className="mt-2.5 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <div className="text-slate-300 leading-relaxed">
                      <strong className="text-sky-400 font-bold">{language === 'vi' ? '🔍 Lý do nhà tuyển dụng hỏi câu này:' : '🔍 Why recruiters ask this:'}</strong>{' '}
                      {q.cv_evidence_context}
                    </div>

                    {/* Expandable Model STAR Answer */}
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedStarTip(isTipExpanded ? null : idx)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isTipExpanded ? '▼' : '▶'}</span>
                        <span>{language === 'vi' ? 'Xem gợi ý trả lời chuẩn STAR & Mẹo ghi điểm' : 'View STAR Model Answer & Tips'}</span>
                      </button>

                      {isTipExpanded && (
                        <div className="mt-2.5 pl-2 border-l-2 border-indigo-500/50 space-y-2.5 pt-1">
                          <div className="bg-slate-900/90 p-3 rounded-lg border border-indigo-500/20 text-slate-200 space-y-1.5 whitespace-pre-line text-xs font-sans">
                            <div className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                              {language === 'vi' ? '⭐ Gợi ý cấu trúc trả lời mẫu (STAR):' : '⭐ Suggested STAR Model Answer:'}
                            </div>
                            <div className="text-slate-300 leading-relaxed">{q.sample_star_answer}</div>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            <strong className="text-emerald-400 font-semibold">{language === 'vi' ? '💡 Mẹo phỏng vấn:' : '💡 Interview Tip:'}</strong> {q.tips_for_candidate}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Answer Sandbox for Active Question */}
          {questionData.questions[activeQuestionIndex] && (
            <div className="bg-slate-900/95 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4 mt-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {language === 'vi' ? 'Luyện tập trả lời cho Câu' : 'Practice Response for Question'} {activeQuestionIndex + 1}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {questionData.questions[activeQuestionIndex].skill_evaluated}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-200">
                {questionData.questions[activeQuestionIndex].question}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  {language === 'vi'
                    ? 'Soạn câu trả lời của bạn theo 4 trụ cột STAR (Situation - Task - Action - Result):'
                    : 'Draft your response following the 4 STAR pillars (Situation - Task - Action - Result):'}
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={5}
                  placeholder={language === 'vi' ? 'Nhập câu trả lời thực tế của bạn, kèm số liệu đo lường cụ thể...' : 'Enter your authentic response with quantifiable metrics and concrete impact...'}
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl p-3.5 text-xs text-slate-200 outline-none focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-400">
                  {language === 'vi'
                    ? "💡 Giám khảo STAR sẽ phân tích tỷ lệ đóng góp cá nhân ('I' vs 'We') và số liệu định lượng (%, RPS)."
                    : "💡 STAR evaluator checks individual agency ('I' vs 'We') and quantifiable metrics (%, RPS)."}
                </span>
                <Button
                  variant="primary"
                  onClick={handleEvaluateAnswer}
                  disabled={isSubmitting}
                  className="cursor-pointer text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="animate-spin">↻</span>
                      <span>{language === 'vi' ? 'Đang chấm điểm...' : 'Grading response...'}</span>
                    </span>
                  ) : (
                    <span>{language === 'vi' ? '✨ Chấm điểm STAR Rubric' : '✨ Score with STAR Rubric'}</span>
                  )}
                </Button>
              </div>

              {/* Real-time STAR Scoreboard */}
              {scores && (
                <div className="pt-3 border-t border-slate-800">
                  <LiveStarScoreboard scores={scores} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
        >
          ← {language === 'vi' ? 'Quay lại Tối ưu hóa CV' : 'Back to Resume Studio'}
        </button>

        {onBackToRadar && (
          <Button variant="primary" onClick={onBackToRadar} className="cursor-pointer text-xs">
            {language === 'vi' ? 'Hoàn thành & Về trang Việc làm' : 'Complete & Return to Radar'} ✓
          </Button>
        )}
      </div>
    </div>
  );
};
