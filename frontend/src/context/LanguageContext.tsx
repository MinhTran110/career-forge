import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Top Nav (3 Workspaces)
    'nav.jobs': '1. Việc làm & Hồ sơ',
    'nav.resume': '2. ATS Resume Studio',
    'nav.interview': '3. Luyện phỏng vấn',
    'nav.optional': 'Tùy chọn',
    'nav.sign_in': 'Đăng nhập',

    // Stepper 4 Steps
    'step.1.title': '1. Hồ sơ & Radar',
    'step.1.desc': 'Xác thực & Tìm việc',
    'step.2.title': '2. Tranh luận Agent',
    'step.2.desc': 'Actor-Critic Swarm',
    'step.3.title': '3. ATS Resume Studio',
    'step.3.desc': 'Google X-Y-Z & Diff',
    'step.4.title': '4. Phỏng vấn STAR',
    'step.4.desc': 'Chấm điểm 4 trụ cột',
    'step.completed': 'Đã hoàn thành',
    'step.in_progress': 'Đang thực hiện',
    'step.pending': 'Chờ thực hiện',
    'step.mark_done': 'Đánh dấu hoàn thành',
    'step.mark_undone': 'Bỏ đánh dấu',
    'step.go_to': 'Chuyển tới bước này',

    // Dashboard
    'dash.step_badge': 'Bước 1: Hồ sơ năng lực & Danh sách việc làm phù hợp',
    'dash.title': 'Việc Làm Phù Hợp Với Hồ Sơ Của Bạn',
    'dash.desc': 'Tự động đối chiếu kỹ năng thực tế từ CV và GitHub của bạn để phân loại cơ hội việc làm theo 3 mức độ',
    'dash.add_jd': 'Thêm tin tuyển dụng (JD)',
    'dash.rescan': 'Quét việc làm mới',
    'dash.scanning': 'Đang tìm kiếm...',
    'dash.recommended': 'Vị trí gợi ý cho bạn',
    'dash.live_updates': 'Cập nhật liên tục',
    'dash.positions_found': 'vị trí phù hợp',
    'dash.tier_all': 'Tất cả',
    'dash.tier_safe': 'Vừa sức',
    'dash.tier_target': 'Mục tiêu',
    'dash.tier_reach': 'Thử thách',
    'dash.tailor_now': 'May đo CV với AI',
    'dash.quick_view': 'Xem chi tiết JD',

    // Resume Studio
    'resume.back_jobs': 'Quay lại Việc làm & Hồ sơ',
    'resume.step_badge': 'Bước 2: Xưởng Tối Ưu Hóa CV Đa Tác Nhân (Multi-Agent Swarm)',
    'resume.title': 'Xưởng Tối Ưu Hóa CV Chuẩn ATS',
    'resume.sub': 'Đã đối chiếu xác thực 100% với bằng chứng thật trong Qdrant • Chống bịa đặt & phóng đại',
    'resume.prompt_console': 'Hướng dẫn AI chỉnh sửa CV',
    'resume.prompt_placeholder': 'Nhập yêu cầu: Ví dụ: Nhấn mạnh kinh nghiệm giảm 35% độ trễ và tối ưu bộ nhớ...',
    'resume.btn_rewrite': 'AI Viết lại CV',
    'resume.optimizing': 'AI đang tối ưu hóa...',
    'resume.copy': 'Sao chép CV',
    'resume.copied': 'Đã sao chép!',
    'resume.download': 'Tải CV về máy (.md)',
    'resume.to_interview': 'Luyện phỏng vấn với JD này',
    'resume.skill_analysis': 'Phân tích kỹ năng theo JD mục tiêu',
    'resume.verified_skills': 'Đã xác thực trong bằng chứng',
    'resume.gap_skills': 'Chưa có bằng chứng (Cần lưu ý)',

    // Mock Interview
    'interview.back_resume': 'Quay lại Tối ưu hóa CV',
    'interview.step_badge': 'Bước 3: Phòng Luyện Phỏng Vấn Thử (STAR Rubric)',
    'interview.finish_radar': 'Hoàn thành & Về trang Việc làm phù hợp',
    'interview.text_mode': 'Trả lời dạng văn bản (Chuẩn)',
    'interview.voice_mode': 'Luyện nói (Tùy chọn)',
  },
  en: {
    // Top Nav (3 Workspaces)
    'nav.jobs': '1. Jobs & Radar',
    'nav.resume': '2. ATS Resume Studio',
    'nav.interview': '3. Mock Interview',
    'nav.optional': 'Optional',
    'nav.sign_in': 'Sign In',

    // Stepper 4 Steps
    'step.1.title': '1. Profile & Radar',
    'step.1.desc': 'Grounding & Match',
    'step.2.title': '2. Agent Swarm',
    'step.2.desc': 'Actor-Critic Debate',
    'step.3.title': '3. Resume Studio',
    'step.3.desc': 'Google X-Y-Z & Diff',
    'step.4.title': '4. STAR Interview',
    'step.4.desc': '4-Pillar Evaluation',
    'step.completed': 'Completed',
    'step.in_progress': 'In Progress',
    'step.pending': 'Pending',
    'step.mark_done': 'Mark as Done',
    'step.mark_undone': 'Unmark',
    'step.go_to': 'Jump to step',

    // Dashboard
    'dash.step_badge': 'Step 1: Verified Capabilities & Real-Time Job Radar',
    'dash.title': 'Jobs Matched to Your Verified Profile',
    'dash.desc': 'Cross-referencing verified CV chunks & GitHub repositories with live market demand into 3 tiers',
    'dash.add_jd': 'Paste Custom JD',
    'dash.rescan': 'Rescan Market',
    'dash.scanning': 'Scanning market...',
    'dash.recommended': 'Recommended Positions',
    'dash.live_updates': 'Live market sync',
    'dash.positions_found': 'matches found',
    'dash.tier_all': 'All',
    'dash.tier_safe': 'Safe',
    'dash.tier_target': 'Target',
    'dash.tier_reach': 'Reach',
    'dash.tailor_now': 'Tailor with AI',
    'dash.quick_view': 'Quick View JD',

    // Resume Studio
    'resume.back_jobs': 'Back to Jobs & Radar',
    'resume.step_badge': 'Step 2: Multi-Agent Swarm ATS Tailor Studio',
    'resume.title': 'ATS Resume Optimization Studio',
    'resume.sub': '100% verified against immutable Qdrant evidence lake • Anti-hallucination guardrails active',
    'resume.prompt_console': 'Instruct AI Optimizer',
    'resume.prompt_placeholder': 'e.g. Emphasize p99 latency reduction and Redis caching...',
    'resume.btn_rewrite': 'AI Rewrite Bullet Points',
    'resume.optimizing': 'Swarm Optimizing...',
    'resume.copy': 'Copy Markdown',
    'resume.copied': 'Copied to Clipboard!',
    'resume.download': 'Download Resume (.md)',
    'resume.to_interview': 'Practice Mock Interview for this Job',
    'resume.skill_analysis': 'Skill Match & Gap Analysis for Target JD',
    'resume.verified_skills': 'Verified in Ground-Truth Evidence',
    'resume.gap_skills': 'Unverified in Evidence (Notice)',

    // Mock Interview
    'interview.back_resume': 'Back to Resume Studio',
    'interview.step_badge': 'Step 3: Technical Mock Interview Lab (STAR Framework)',
    'interview.finish_radar': 'Finish & Return to Jobs',
    'interview.text_mode': 'Text Mode (Standard)',
    'interview.voice_mode': 'Voice Practice (Optional)',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('cf_language') as Language) || 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cf_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
