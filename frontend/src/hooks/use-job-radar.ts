import { useState, useEffect } from 'react';
import { Job } from '@/types';
import { getRecommendedJobs } from '@/services/api';

export function useJobRadar() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    getRecommendedJobs()
      .then((data) => {
        if (mounted) setJobs(data);
      })
      .catch((err) => {
        console.error('Failed fetching jobs:', err);
        // Fallback local mock data
        if (mounted) {
          setJobs([
            {
              id: 'job_1',
              title: 'Senior AI Infrastructure Engineer',
              company: 'DeepScale AI',
              location: 'Remote',
              salary_range: '$140k - $180k',
              job_type: 'Remote',
              url: 'https://example.com',
              description: 'Scale LLM inference clusters using FastAPI and Kubernetes.',
              requirements: ['FastAPI', 'Kubernetes', 'Python', 'vLLM'],
              tech_stack: ['Python', 'Docker', 'CUDA'],
              match_score: 94,
            },
          ]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredJobs = jobs.filter((job) =>
    filterType === 'all' ? true : job.job_type.toLowerCase() === filterType.toLowerCase()
  );

  return { jobs: filteredJobs, loading, filterType, setFilterType };
}
