import React, { useState } from 'react';
import { analyzeCustomJd } from '@/services/api';
import { Job } from '@/types';

interface CustomJdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const CustomJdModal: React.FC<CustomJdModalProps> = ({ isOpen, onClose, onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('$120,000 - $160,000');
  const [location, setLocation] = useState('Remote');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !title.trim()) {
      setError('Please provide at least a Job Title and Description.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const newJob = await analyzeCustomJd({
        title: title.trim(),
        company: company.trim() || 'Tech Company',
        description: description.trim(),
        salary_range: salary.trim(),
        location: location.trim(),
      });
      onJobCreated(newJob);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to analyze JD. Please verify input text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>Analyze External Job Posting</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste any JD from LinkedIn, Indeed, or TopCV to extract skills and rank compatibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, OpenAI..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$100k - $140k"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Hybrid"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description (JD Text) *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job requirements, responsibilities, and qualifications here..."
              rows={6}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white outline-none font-mono resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? 'Extracting & Ranking...' : 'Analyze with Market Hunter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
