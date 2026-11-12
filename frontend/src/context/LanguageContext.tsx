import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
    'dash.empty_tier': 'Không tìm thấy vị trí tuyển dụng trong nhóm này.',
    'dash.scanning_message': 'Đang quét và đối chiếu vị trí tuyển dụng với hồ sơ năng lực của bạn...',
    'dash.original_post': 'Xem tin gốc',
    'dash.custom_jd_badge': 'Tin tự nhập (Custom JD)',
    'dash.close': 'Đóng',
    'dash.job_desc': 'Mô tả công việc:',
    'dash.job_reqs': 'Yêu cầu chính:',
    'dash.open_original': 'Mở bài đăng tuyển dụng gốc',
    'dash.search_google': 'Tìm kiếm bài đăng trên Google',

    // Candidate Profile Card
    'profile.card_title': 'Hồ sơ năng lực & Bằng chứng thực tế',
    'profile.card_tag': 'Đã lập chỉ mục Qdrant',
    'profile.commits_repos': 'Xác thực không bịa đặt ({commits} commits, {repos} repos)',
    'profile.verified_skills_title': 'Kỹ năng đã xác thực qua bằng chứng:',
    'profile.upload_title': 'Tải lên CV thực tế (PDF/Scan) & Đồng bộ GitHub:',
    'profile.choose_cv': 'Chọn file CV (PDF, PNG, JPG)...',
    'profile.sync_btn': 'Đồng bộ hồ sơ',
    'profile.verifying': 'Đang xác thực...',
    'profile.synced_success': 'Đã xác thực 100% bằng chứng! Hồ sơ đã được cập nhật.',

    // Custom JD Modal
    'custom_jd.title': 'Phân tích tin tuyển dụng ngoài (Custom JD)',
    'custom_jd.sub': 'Dán nội dung JD bất kỳ để hệ thống tự động bóc tách kỹ năng và may đo CV',
    'custom_jd.job_title': 'Chức danh vị trí *',
    'custom_jd.company': 'Tên công ty',
    'custom_jd.salary': 'Mức lương dự kiến',
    'custom_jd.location': 'Địa điểm',
    'custom_jd.url': 'Đường dẫn bài đăng gốc (Tùy chọn)',
    'custom_jd.desc_label': 'Nội dung mô tả công việc (JD) *',
    'custom_jd.cancel': 'Hủy',
    'custom_jd.submit': 'Bóc tách & Phân tích JD',
    'custom_jd.analyzing': 'Đang phân tích...',

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
    'resume.click_skill_tip': '(Bấm vào kỹ năng cần lưu ý để tự động điền lệnh yêu cầu AI tối ưu)',
    'resume.toggle_swarm_hide': '⚡ Ẩn luồng Agent Swarm',
    'resume.toggle_swarm_show': '⚡ Xem luồng tranh luận AI',
    'resume.prompt_pill_missing': '🎯 Bổ sung kỹ năng còn thiếu',
    'resume.prompt_pill_metrics': '⚡ Thêm số liệu ấn tượng (Google X-Y-Z)',
    'resume.prompt_pill_lead': '👔 Giọng văn Kỹ sư Trưởng / Quản lý',
    'resume.prompt_pill_label': 'Gợi ý yêu cầu nhanh:',
    'resume.prompt_console_tag': 'Ra lệnh trực tiếp cho AI',
    'resume.ai_assistants': 'Trợ lý AI: Chuyên gia Tối ưu CV & Chuyên gia Kiểm chứng sự thật',
    'resume.job_fit': 'Độ khớp với công việc',
    'resume.realtime': '(Tính theo thời gian thực)',
    'resume.status_ready': 'SẴN SÀNG NỘP ĐƠN',
    'resume.status_good': 'PHÙ HỢP KHÁ',
    'resume.status_gap': 'CẦN BỔ SUNG',
    'resume.coverage_label': 'Độ phủ kỹ năng',
    'resume.grounding_label': 'Độ xác thực bằng chứng thật (30%)',
    'resume.metric_label': 'Mật độ số liệu ({count} con số định lượng)',
    'resume.transformations_title': 'Gợi ý nâng cấp câu mô tả ({count} câu)',
    'resume.flexible_prompt': 'Linh hoạt theo Prompt',
    'resume.google_formula': 'Cấu trúc: Đạt [Kết quả X] bằng [Giải pháp Y] làm [Hành động Z]',
    'resume.original_label': '❌ Câu cũ:',
    'resume.improved_label': '✅ AI viết lại:',
    'resume.grounded_label': '🛡️ Bằng chứng thật',
    'resume.source_from': 'Từ:',
    'resume.applied_btn': '✓ Đã áp dụng vào CV',
    'resume.apply_btn': '⚡ Áp dụng câu này vào CV',

    // Markdown Split View & Preview
    'editor.title': 'Soạn thảo nội dung CV',
    'editor.tag': 'Số liệu định lượng chuẩn',
    'editor.stats': '{lines} dòng • {chars} ký tự',
    'editor.ready_pdf': 'Sẵn sàng xuất file PDF',
    'editor.preview_title': 'Xem trước CV khi in / nộp tuyển',
    'editor.preview_tag': 'Qua 100% cổng lọc tự động',
    'editor.zoom_fit': 'Thu gọn vừa màn hình',
    'editor.zoom_100': 'Tỷ lệ thật 100%',
    'editor.watermark_left': 'ĐỊNH DẠNG KHỔ GIẤY A4 CHUẨN • BỐ CỤC 1 CỘT DỄ ĐỌC',
    'editor.watermark_right': 'TƯƠNG THÍCH MÁY QUÉT CV: 99.8%',

    // ATS Keyword Density
    'ats.density_title': 'Mật độ từ khóa ATS',
    'ats.matched': 'Khớp với JD ({count}):',
    'ats.missing': 'Còn thiếu trong CV ({count}):',

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
    'dash.empty_tier': 'No job postings found in this tier.',
    'dash.scanning_message': 'Scanning and cross-referencing jobs with your verified profile...',
    'dash.original_post': 'Original Post',
    'dash.custom_jd_badge': 'Custom JD',
    'dash.close': 'Close',
    'dash.job_desc': 'Job Description:',
    'dash.job_reqs': 'Key Requirements:',
    'dash.open_original': 'Open Original Job Post',
    'dash.search_google': 'Search Job on Google',

    // Candidate Profile Card
    'profile.card_title': 'Candidate Evidence Lake',
    'profile.card_tag': 'Qdrant Indexed',
    'profile.commits_repos': 'Zero-Hallucination Ground Truth ({commits} commits, {repos} repos)',
    'profile.verified_skills_title': 'Verified Ground-Truth Skills:',
    'profile.upload_title': 'Upload Real CV (PDF/Scan) & Sync GitHub:',
    'profile.choose_cv': 'Choose CV (PDF, PNG, JPG)...',
    'profile.sync_btn': 'Sync Evidence Lake',
    'profile.verifying': 'Verifying...',
    'profile.synced_success': 'Verified 100% ground-truth! Evidence Lake updated.',

    // Custom JD Modal
    'custom_jd.title': 'Analyze External Job Posting',
    'custom_jd.sub': 'Paste any job description to extract technical requirements and tailor resume',
    'custom_jd.job_title': 'Job Title *',
    'custom_jd.company': 'Company Name',
    'custom_jd.salary': 'Expected Salary',
    'custom_jd.location': 'Location',
    'custom_jd.url': 'Original Job URL (Optional)',
    'custom_jd.desc_label': 'Job Description Text *',
    'custom_jd.cancel': 'Cancel',
    'custom_jd.submit': 'Extract & Analyze JD',
    'custom_jd.analyzing': 'Analyzing...',

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
    'resume.click_skill_tip': '(Click on a gap skill to auto-fill AI optimization prompt)',
    'resume.toggle_swarm_hide': '⚡ Hide Agent Swarm',
    'resume.toggle_swarm_show': '⚡ View AI Debate Stream',
    'resume.prompt_pill_missing': '🎯 Add Missing Skills',
    'resume.prompt_pill_metrics': '⚡ Add Impact Metrics (Google X-Y-Z)',
    'resume.prompt_pill_lead': '👔 Lead / Principal Tone',
    'resume.prompt_pill_label': 'Quick prompt suggestions:',
    'resume.prompt_console_tag': 'Direct Agent Steering',
    'resume.ai_assistants': 'AI Assistants: Resume Strategist & Fact Checker Critic',
    'resume.job_fit': 'Job Match Score',
    'resume.realtime': '(Real-time computed)',
    'resume.status_ready': 'APPLICATION READY',
    'resume.status_good': 'GOOD MATCH',
    'resume.status_gap': 'GAPS IDENTIFIED',
    'resume.coverage_label': 'Skill Coverage',
    'resume.grounding_label': 'Ground-Truth Verification (30%)',
    'resume.metric_label': 'Quantitative Metrics ({count} metrics)',
    'resume.transformations_title': 'Transformation Suggestions ({count} items)',
    'resume.flexible_prompt': 'Dynamic via Prompt',
    'resume.google_formula': 'Formula: Accomplished [X] measured by [Y], by doing [Z]',
    'resume.original_label': '❌ Original:',
    'resume.improved_label': '✅ AI Improved:',
    'resume.grounded_label': '🛡️ Verified Evidence',
    'resume.source_from': 'From:',
    'resume.applied_btn': '✓ Applied to Resume',
    'resume.apply_btn': '⚡ Apply to Resume',

    // Markdown Split View & Preview
    'editor.title': 'Resume Markdown Editor',
    'editor.tag': 'Standard Metrics',
    'editor.stats': '{lines} lines • {chars} characters',
    'editor.ready_pdf': 'Ready for PDF Export',
    'editor.preview_title': 'A4 Print / ATS Submission Preview',
    'editor.preview_tag': '100% ATS Parser Safe',
    'editor.zoom_fit': 'Fit to Screen',
    'editor.zoom_100': '100% Scale',
    'editor.watermark_left': 'STANDARD A4 FORMAT • HIGHLY READABLE 1-COLUMN LAYOUT',
    'editor.watermark_right': 'ATS PARSER COMPATIBILITY: 99.8%',

    // ATS Keyword Density
    'ats.density_title': 'ATS Keyword Match Density',
    'ats.matched': 'Matched ({count}):',
    'ats.missing': 'Missing from Resume ({count}):',

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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let str = translations[language]?.[key] || translations['vi']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
