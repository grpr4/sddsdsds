import { useState, useEffect } from 'react';
import api from '../api/client';

interface Subscription {
  id: number;
  status: string;
  plan_type: string;
  expires_at: string;
}

export function useSubscription() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      const response = await api.get('/subscription/status');
      setHasSubscription(response.data.hasSubscription);
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return { hasSubscription, subscription, loading, refetch: checkSubscription };
}
