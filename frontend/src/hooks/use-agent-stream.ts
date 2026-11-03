import { useState, useEffect } from 'react';
import { AgentEvent } from '@/types';

export function useAgentStream(workflowId: string | null) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!workflowId) return;

    const eventSource = new EventSource(`http://localhost:8000/api/v1/streams/agent-events/${workflowId}`);

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onmessage = (event) => {
      try {
        const parsed: AgentEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, parsed]);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [workflowId]);

  return { events, isConnected };
}
