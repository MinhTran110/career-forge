import React, { useState, useEffect } from 'react';
import { getApiKeyStatus, setApiKey } from '@/services/api';
import { ApiKeyStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const { language } = useLanguage();
  const [keyInput, setKeyInput] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getApiKeyStatus();
      setStatus(data);
      if (data.provider) setProvider(data.provider);
      if (data.model) setModel(data.model);
    } catch (err) {
      console.error('Failed fetching API status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMsg(null);
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setMsg({ type: 'error', text: language === 'vi' ? 'Vui lòng nhập API Key.' : 'Please enter an API Key.' });
      return;
    }
    try {
      setSaving(true);
      setMsg(null);
      await setApiKey(keyInput.trim(), provider, model);
      setMsg({
        type: 'success',
        text: language === 'vi' ? 'Đã kích hoạt API Key thành công! Các Multi-Agent đã sẵn sàng hoạt động.' : 'API Key activated successfully!',
      });
      setKeyInput('');
      fetchStatus();
      if (onKeySaved) onKeySaved();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Không thể lưu API Key. Vui lòng kiểm tra lại.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-md shadow-amber-500/20 text-white">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'vi' ? 'Thiết lập API AI (Miễn phí 100%)' : 'AI API Configuration (Free)'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'vi'
                  ? 'Kích hoạt trí tuệ nhân tạo trực tiếp cho toàn bộ 5 Multi-Agent của CareerForge'
                  : 'Activate live LLMs for CareerForge Multi-Agent swarm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-lg p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Active Status Indicator */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                status?.is_configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white">
                {status?.is_configured
                  ? (language === 'vi' ? 'Đã kích hoạt mô hình trực tiếp' : 'Live LLM Active')
                  : (language === 'vi' ? 'Chế độ Dự phòng Heuristic (Chưa có API Key)' : 'Fallback Heuristic Mode')}
              </div>
              <div className="text-[11px] text-slate-400">
                {status?.is_configured
                  ? `${status.provider.toUpperCase()} (${status.model}) • Key: ${status.masked_key}`
                  : (language === 'vi' ? 'Hệ thống dùng thuật toán nội bộ. Hãy gắn API key bên dưới để dùng AI thật.' : 'Add your free Gemini key below to activate live LLM.')}
              </div>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              status?.is_configured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {status?.is_configured ? 'CONNECTED' : 'OFFLINE MODE'}
          </span>
        </div>

        {/* Instructions Card for Free API Key */}
        <div className="bg-gradient-to-br from-sky-950/30 to-indigo-950/30 border border-sky-500/30 rounded-xl p-4 space-y-2 text-xs leading-relaxed text-slate-300">
          <div className="font-bold text-sky-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>💡</span>
              <span>{language === 'vi' ? 'Cách nhận API Key Google Gemini miễn phí (Không cần thẻ tín dụng):' : 'How to get a 100% Free Gemini API Key:'}</span>
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-sky-400 hover:text-sky-200 underline flex items-center gap-0.5 font-bold cursor-pointer"
            >
              <span>aistudio.google.com</span>
              <span>↗</span>
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>
              {language === 'vi' ? 'Truy cập ' : 'Visit '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 underline"
              >
                Google AI Studio (aistudio.google.com)
              </a>
              {language === 'vi' ? ' và đăng nhập bằng tài khoản Gmail bất kỳ.' : ' and log in with your Google account.'}
            </li>
            <li>{language === 'vi' ? 'Nhấn nút ' : 'Click '} <strong className="text-slate-200">"Create API key"</strong> {language === 'vi' ? 'rồi chọn ' : 'and select '} <span className="text-slate-200">"Create API key in new project"</span>.</li>
            <li>
              {language === 'vi' ? (
                <>
                  Gói miễn phí cho phép <span className="text-emerald-400 font-semibold">15 lượt/phút</span>, <span className="text-emerald-400 font-semibold">1.500 lượt/ngày</span> và <span className="text-emerald-400 font-semibold">1 triệu tokens/phút</span> hoàn toàn <strong className="text-emerald-400">0đ trọn đời</strong>.
                </>
              ) : (
                'Free tier gives 15 RPM, 1,500 RPD, and 1M TPM with $0 cost.'
              )}
            </li>
            <li>{language === 'vi' ? 'Sao chép đoạn mã (bắt đầu bằng ' : 'Copy the key (starts with '} <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">AIzaSy...</code>) {language === 'vi' ? 'và dán vào ô bên dưới.' : 'and paste below.'}</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'vi' ? 'Nhà cung cấp (Provider)' : 'Provider'}
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  if (e.target.value === 'gemini') setModel('gemini-1.5-flash');
                  else if (e.target.value === 'openai') setModel('gpt-4o-mini');
                  else if (e.target.value === 'anthropic') setModel('claude-3-5-sonnet-20241022');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="gemini">Google AI Studio (Gemini - Miễn phí)</option>
                <option value="openai">OpenAI / Groq / vLLM</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'vi' ? 'Mô hình (Model)' : 'Model'}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemini-1.5-flash"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              API Key ({provider.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Dán mã khóa API tại đây (vd: AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                title={showKey ? 'Ẩn' : 'Hiện'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border ${
                msg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex justify-end items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <span className="animate-spin">↻</span>}
              <span>{language === 'vi' ? 'Lưu & Kích hoạt Agent' : 'Save & Activate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
