import React, { useState, useEffect, useMemo } from 'react';
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
import { Dialog } from '@/components/common/Dialog';

export const MockInterviewPage: React.FC<{
  onBack: () => void;
  onBackToRadar?: () => void;
}> = ({ onBack, onBackToRadar }) => {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobTitle, setCustomJobTitle] = useState<string>('Senior Backend Engineer');
  const [customJdText, setCustomJdText] = useState<string>('');
  const [useCustomJd, setUseCustomJd] = useState(false);

  // Question Generation State
  const [numQuestions, setNumQuestions] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [questionData, setQuestionData] = useState<GenerateQuestionsResponse | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [expandedStarTip, setExpandedStarTip] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Custom Question Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customQText, setCustomQText] = useState('');
  const [customQSkill, setCustomQSkill] = useState('');
  const [customQCategory, setCustomQCategory] = useState('Kỹ thuật chuyên sâu (CV Skills)');
  const [customQWhy, setCustomQWhy] = useState('');
  const [customQSampleAnswer, setCustomQSampleAnswer] = useState('');

  // Answer & Evaluation State
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scores, setScores] = useState<StarScores | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Dynamic Categories from available questions
  const categories = useMemo(() => {
    if (!questionData || !questionData.questions.length) return ['ALL'];
    const uniqueCats = Array.from(new Set(questionData.questions.map((q) => q.category)));
    return ['ALL', ...uniqueCats];
  }, [questionData]);

  // Filtered visible questions
  const visibleQuestions = useMemo(() => {
    if (!questionData) return [];
    if (selectedCategory === 'ALL') return questionData.questions;
    return questionData.questions.filter((q) => q.category === selectedCategory);
  }, [questionData, selectedCategory]);

  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);
      setScores(null);
      setSelectedCategory('ALL');
      const cvSkills = profile?.verified_skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis'];

      let payload: any = {
        cv_skills: cvSkills,
        num_questions: numQuestions,
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

  const handleLoadMoreQuestions = async () => {
    if (!questionData) return;
    try {
      setIsGeneratingMore(true);
      const cvSkills = profile?.verified_skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis'];
      const existingIds = questionData.questions.map((q) => q.id);

      let payload: any = {
        cv_skills: cvSkills,
        num_questions: 3,
        existing_question_ids: existingIds,
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
      if (res && res.questions && res.questions.length > 0) {
        const newQuestions = res.questions.filter((nq) => !existingIds.includes(nq.id));
        const toAppend = newQuestions.length > 0
          ? newQuestions
          : res.questions.map((q, i) => ({ ...q, id: `more_${Date.now()}_${i}` }));

        setQuestionData((prev) => {
          if (!prev) return res;
          return {
            ...prev,
            questions: [...prev.questions, ...toAppend],
          };
        });

        setToastMessage(
          language === 'vi'
            ? `✨ Đã tạo thêm thành công ${toAppend.length} câu hỏi phỏng vấn mới!`
            : `✨ Generated ${toAppend.length} new interview questions!`
        );
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed generating more questions:', err);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQText.trim()) return;

    const newQuestion: InterviewQuestionItem = {
      id: `custom_${Date.now()}`,
      category: customQCategory || (language === 'vi' ? 'Câu hỏi tự thêm' : 'Custom Question'),
      question: customQText.trim(),
      skill_evaluated: customQSkill.trim() || (language === 'vi' ? 'Kỹ năng chuyên môn' : 'Technical Skill'),
      cv_evidence_context: customQWhy.trim() || (language === 'vi'
        ? 'Câu hỏi thực tế do bạn tự cấu hình để kiểm tra năng lực phản xạ và lập luận theo STAR.'
        : 'Custom question added by candidate to practice STAR response.'),
      sample_star_answer: customQSampleAnswer.trim() || (language === 'vi'
        ? 'Tình huống: Nêu rõ bối cảnh dự án, quy mô hệ thống hoặc công nghệ đang sử dụng.\nNhiệm vụ: Chỉ rõ mục tiêu, khó khăn chính hoặc chỉ số SLA cần đạt được.\nHành động: Trình bày chi tiết giải pháp kỹ thuật cá nhân bạn đã thực hiện.\nKết quả: Nêu số liệu định lượng (%, RPS, độ trễ p99, doanh thu hoặc thời gian tiết kiệm).'
        : 'Situation: Context, architecture scale, and engineering constraints.\nTask: Concrete problem definition and success criteria.\nAction: Technical contributions, tradeoffs, and execution steps.\nResult: Measurable business or performance outcome (%, RPS, ms).'),
      tips_for_candidate: language === 'vi'
        ? 'Duy trì tỷ lệ đóng góp cá nhân cao, tránh chỉ nói "Chúng tôi" (We), hãy nêu rõ "Tôi đã phân tích... Tôi đã triển khai..." (I).'
        : 'Emphasize individual engineering decisions and quantifiable business metrics.',
    };

    setQuestionData((prev) => {
      if (!prev) {
        return {
          job_title: selectedJob?.title || customJobTitle,
          matched_skills: profile?.verified_skills || [],
          missing_skills: [],
          questions: [newQuestion],
        };
      }
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });

    const newIndex = questionData ? questionData.questions.length : 0;
    setActiveQuestionIndex(newIndex);
    setExpandedStarTip(newIndex);
    setUserAnswer(newQuestion.sample_star_answer);
    setScores(null);

    setCustomQText('');
    setCustomQSkill('');
    setCustomQWhy('');
    setCustomQSampleAnswer('');
    setIsAddModalOpen(false);

    setToastMessage(t('interview.added_success'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    try {
      setIsSubmitting(true);
      const currentQuestion = questionData?.questions[activeQuestionIndex];
      const qText = currentQuestion?.question || '';

      // Initialize a session if not exists
      let currentSessId = sessionId;
      if (!currentSessId) {
        const sess = await createInterviewSession(
          selectedJob?.id,
          `${selectedJob?.title || customJobTitle} CV-Tailored Interview`,
          questionData?.questions
        );
        currentSessId = sess.id;
        setSessionId(sess.id);
      }

      if (!currentSessId) return;
      const res = await submitInterviewAnswer(currentSessId, activeQuestionIndex, userAnswer.trim(), qText);
      const answeredQ = res.questions?.[activeQuestionIndex] || res.questions?.[res.questions.length - 1];
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

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">{t('interview.num_questions_label')}</span>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-xs text-sky-400 font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value={4}>4 {language === 'vi' ? 'câu hỏi' : 'questions'}</option>
                <option value={6}>6 {language === 'vi' ? 'câu hỏi' : 'questions'}</option>
                <option value={8}>8 {language === 'vi' ? 'câu hỏi' : 'questions'}</option>
                <option value={10}>10 {language === 'vi' ? 'câu hỏi' : 'questions'}</option>
              </select>
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
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-sky-500/20 border border-purple-500/40 rounded-xl px-4 py-3 text-xs text-purple-200 flex items-center justify-between shadow-lg animate-fadeIn">
          <span className="font-semibold flex items-center gap-2">
            <span>🎉</span>
            <span>{toastMessage}</span>
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Generated Questions List & Category Filtering */}
      {questionData && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📋</span>
                <span>{language === 'vi' ? 'Bộ câu hỏi phỏng vấn sát thực tế' : 'Generated Interview Questions'}</span>
              </span>
              <span className="text-xs text-purple-400 font-bold bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                {t('interview.total_count', { count: questionData.questions.length })}
              </span>
            </div>

            {/* Extra Question Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoadMoreQuestions}
                disabled={isGeneratingMore}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:border-purple-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isGeneratingMore ? (
                  <>
                    <span className="animate-spin text-xs">↻</span>
                    <span>{t('interview.loading_more')}</span>
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    <span>{t('interview.load_more_btn')}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 hover:border-sky-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>✍️</span>
                <span>{t('interview.add_custom_btn')}</span>
              </button>
            </div>
          </div>

          {/* Matched vs Gap skills tags & Category filter */}
          <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400">{language === 'vi' ? 'Trùng khớp:' : 'Matched:'}</span>
                {questionData.matched_skills.slice(0, 4).map((m) => (
                  <span key={m} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ {m}
                  </span>
                ))}
                {questionData.missing_skills.length > 0 && (
                  <>
                    <span className="text-slate-400 ml-1">{language === 'vi' ? 'Cần bổ sung:' : 'Gaps:'}</span>
                    {questionData.missing_skills.slice(0, 3).map((g) => (
                      <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        ⚠ {g}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            {categories.length > 2 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">
                  {t('interview.filter_label')}
                </span>
                {categories.map((cat) => {
                  const isCatActive = selectedCategory === cat;
                  const label = cat === 'ALL' ? t('interview.filter_all') : cat;
                  const count = cat === 'ALL'
                    ? questionData.questions.length
                    : questionData.questions.filter((q) => q.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer border ${
                        isCatActive
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Questions Accordion Cards */}
          <div className="space-y-3">
            {visibleQuestions.map((q: InterviewQuestionItem) => {
              const realIndex = questionData.questions.findIndex((item) => item.id === q.id);
              const targetIndex = realIndex >= 0 ? realIndex : 0;
              const isActive = activeQuestionIndex === targetIndex;
              const isTipExpanded = expandedStarTip === targetIndex;
              const isCustom = q.id.startsWith('custom_');

              return (
                <div
                  key={q.id || targetIndex}
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
                        {isCustom && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                            ✨ {t('interview.custom_badge')}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-sky-400">
                          🎯 {q.skill_evaluated}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-relaxed">
                        {language === 'vi' ? 'Câu' : 'Question'} {targetIndex + 1}: {q.question}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuestionIndex(targetIndex);
                        setExpandedStarTip(isTipExpanded ? null : targetIndex);
                        if (!userAnswer.trim() && q.sample_star_answer) {
                          setUserAnswer(q.sample_star_answer);
                        }
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
                        onClick={() => setExpandedStarTip(isTipExpanded ? null : targetIndex)}
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

      {/* Add Custom Question Modal Dialog */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('interview.custom_modal_title')}
      >
        <form onSubmit={handleAddCustomQuestion} className="space-y-4">
          <p className="text-xs text-slate-400">
            {t('interview.custom_modal_desc')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('interview.custom_q_label')}
            </label>
            <textarea
              required
              rows={3}
              value={customQText}
              onChange={(e) => setCustomQText(e.target.value)}
              placeholder={t('interview.custom_q_placeholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-purple-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('interview.custom_skill_label')}
              </label>
              <input
                required
                type="text"
                value={customQSkill}
                onChange={(e) => setCustomQSkill(e.target.value)}
                placeholder={t('interview.custom_skill_placeholder')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('interview.custom_category_label')}
              </label>
              <select
                value={customQCategory}
                onChange={(e) => setCustomQCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Kỹ thuật chuyên sâu (CV Skills)">Kỹ thuật chuyên sâu (CV Skills)</option>
                <option value="Kiến trúc hệ thống & Tích hợp">Kiến trúc hệ thống & Tích hợp</option>
                <option value="Tối ưu hóa Database & Caching">Tối ưu hóa Database & Caching</option>
                <option value="Khả năng chịu tải & Độ tin cậy API">Khả năng chịu tải & Độ tin cậy API</option>
                <option value="Bảo mật & Xác thực hệ thống">Bảo mật & Xác thực hệ thống</option>
                <option value="Quan sát hệ thống & Giám sát (Observability)">Quan sát hệ thống & Giám sát (Observability)</option>
                <option value="CI/CD & Vận hành Hạ tầng">CI/CD & Vận hành Hạ tầng</option>
                <option value="Tình huống thực tế & Văn hóa (STAR)">Tình huống thực tế & Văn hóa (STAR)</option>
                <option value="Lãnh đạo kỹ thuật & Văn hóa Đội ngũ">Lãnh đạo kỹ thuật & Văn hóa Đội ngũ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'vi' ? 'Bối cảnh hoặc lý do câu hỏi này quan trọng (Tùy chọn):' : 'Context or why this question matters (Optional):'}
            </label>
            <input
              type="text"
              value={customQWhy}
              onChange={(e) => setCustomQWhy(e.target.value)}
              placeholder={language === 'vi' ? 'Ví dụ: Nhà tuyển dụng muốn kiểm tra kinh nghiệm thực chiến khi gặp sự cố...' : 'e.g., Recruiter wants to check incident handling under pressure...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
            >
              {t('interview.cancel_btn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md cursor-pointer transition-all active:scale-95"
            >
              {t('interview.add_btn')}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
