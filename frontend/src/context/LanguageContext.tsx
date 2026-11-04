import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Top Nav
    'nav.jobs': '1. Việc làm phù hợp',
    'nav.skills': '2. Đánh giá & Bổ sung kỹ năng',
    'nav.resume': '3. Tối ưu hóa CV',
    'nav.interview': '4. Luyện phỏng vấn',
    'nav.optional': 'Tùy chọn',
    'nav.sign_in': 'Đăng nhập',

    // Stepper 6 Steps
    'step.1.title': '1. Quét việc làm',
    'step.1.desc': 'Tìm vị trí phù hợp',
    'step.2.title': '2. Phân tích hồ sơ',
    'step.2.desc': 'Xác thực năng lực thật',
    'step.3.title': '3. So sánh kỹ năng',
    'step.3.desc': 'Lộ trình bổ sung',
    'step.4.title': '4. Tối ưu hóa CV',
    'step.4.desc': 'Viết lại chuẩn nộp đơn',
    'step.5.title': '5. Kiểm chứng sự thật',
    'step.5.desc': 'Loại bỏ bịa đặt',
    'step.6.title': '6. Luyện phỏng vấn',
    'step.6.desc': 'Mô phỏng trả lời',
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

    // Detail & Roadmap
    'detail.back_radar': 'Quay lại Việc làm phù hợp',
    'detail.step_badge': 'Bước 2: So sánh kỹ năng & Kế hoạch bổ sung',
    'detail.next_resume': 'Tiếp theo: Tối ưu hóa CV cho việc này',
    'detail.practice_mock': 'Luyện phỏng vấn (Tùy chọn)',

    // Resume Studio
    'resume.back_skills': 'Quay lại Đánh giá kỹ năng',
    'resume.step_badge': 'Bước 3: Tối ưu hóa CV theo tin tuyển dụng',
    'resume.title': 'Xưởng Tối Ưu Hóa CV Theo Nhà Tuyển Dụng',
    'resume.sub': 'Đã đối chiếu xác thực 100% với kinh nghiệm thật của bạn • Không chém gió, không bịa đặt',
    'resume.prompt_console': 'Hướng dẫn AI chỉnh sửa CV',
    'resume.prompt_placeholder': 'Nhập yêu cầu: Ví dụ: Nhấn mạnh kinh nghiệm giảm 35% độ trễ và tối ưu bộ nhớ...',
    'resume.btn_rewrite': 'AI Viết lại CV',
    'resume.optimizing': 'AI đang tối ưu hóa...',
    'resume.copy': 'Sao chép CV',
    'resume.copied': 'Đã sao chép!',
    'resume.download': 'Tải CV về máy (.md)',

    // Mock Interview
    'interview.back_resume': 'Quay lại Tối ưu hóa CV',
    'interview.step_badge': 'Bước 4: Phòng Luyện Phỏng Vấn Thử (Tùy chọn)',
    'interview.finish_radar': 'Hoàn thành & Về trang Việc làm phù hợp',
    'interview.text_mode': 'Trả lời dạng văn bản (Chuẩn)',
    'interview.voice_mode': 'Luyện nói (Tùy chọn)',
  },
  en: {
    // Top Nav
    'nav.jobs': '1. Matched Jobs',
    'nav.skills': '2. Skill & Roadmap',
    'nav.resume': '3. Resume Studio',
    'nav.interview': '4. Mock Interview',
    'nav.optional': 'Optional',
    'nav.sign_in': 'Sign In',

    // Stepper 6 Steps
    'step.1.title': '1. Job Radar',
    'step.1.desc': 'Discover matched jobs',
    'step.2.title': '2. Profile Grounding',
    'step.2.desc': 'Verify verified skills',
    'step.3.title': '3. Skill Gap Blueprint',
    'step.3.desc': '48h Project roadmap',
    'step.4.title': '4. Resume Optimizer',
    'step.4.desc': 'Google X-Y-Z format',
    'step.5.title': '5. Fact-Check Audit',
    'step.5.desc': 'Zero-hallucination review',
    'step.6.title': '6. Mock Interview',
    'step.6.desc': 'STAR rubric practice',
    'step.completed': 'Completed',
    'step.in_progress': 'In Progress',
    'step.pending': 'Pending',
    'step.mark_done': 'Mark as Done',
    'step.mark_undone': 'Unmark',
    'step.go_to': 'Navigate to Step',

    // Dashboard
    'dash.step_badge': 'Step 1: Skill Profile & Matched Opportunities',
    'dash.title': 'Jobs Matched To Your Verified Profile',
    'dash.desc': 'Automatically cross-references your real skills from CV and GitHub into 3 matching tiers',
    'dash.add_jd': 'Paste Custom JD',
    'dash.rescan': 'Scan New Jobs',
    'dash.scanning': 'Scanning...',
    'dash.recommended': 'Recommended Positions',
    'dash.live_updates': 'Live Updates',
    'dash.positions_found': 'matched positions found',
    'dash.tier_all': 'All Roles',
    'dash.tier_safe': 'Safe Tier',
    'dash.tier_target': 'Target Tier',
    'dash.tier_reach': 'Reach Tier',

    // Detail & Roadmap
    'detail.back_radar': 'Back to Matched Jobs',
    'detail.step_badge': 'Step 2: Skill Gap Analysis & 48h Sprint Blueprint',
    'detail.next_resume': 'Next: Tailor Resume for this Job',
    'detail.practice_mock': 'Practice Mock (Optional)',

    // Resume Studio
    'resume.back_skills': 'Back to Skill Blueprint',
    'resume.step_badge': 'Step 3: ATS-Optimized Resume Studio',
    'resume.title': 'ATS-Optimized Resume Studio',
    'resume.sub': 'Zero-Hallucination Verified against Qdrant Lake • 100% Grounded',
    'resume.prompt_console': 'AI Prompt Steering Console',
    'resume.prompt_placeholder': 'E.g., Emphasize my 35% latency reduction and distributed caching achievements...',
    'resume.btn_rewrite': 'Direct AI Rewrite',
    'resume.optimizing': 'Dual-Loop Optimizing...',
    'resume.copy': 'Copy Markdown',
    'resume.copied': 'Copied!',
    'resume.download': 'Download Resume (.md)',

    // Mock Interview
    'interview.back_resume': 'Back to Resume Studio',
    'interview.step_badge': 'Step 4: STAR Mock Interview Simulator (Optional)',
    'interview.finish_radar': 'Finish & Return to Matched Jobs',
    'interview.text_mode': 'Text Response (Standard)',
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
