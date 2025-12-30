import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarketSentiment {
  aiAnxietyMultiplier: number;
  trainingInterestMultiplier: number;
  newsContext: string;
  timestamp: number;
}

interface UseOpenAIContextReturn {
  marketSentiment: MarketSentiment;
  isLoading: boolean;
  error: string | null;
  refreshSentiment: () => Promise<void>;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const STORAGE_KEY = 'market_sentiment_cache';

const defaultSentiment: MarketSentiment = {
  aiAnxietyMultiplier: 1.0,
  trainingInterestMultiplier: 1.0,
  newsContext: 'Standard market conditions',
  timestamp: Date.now()
};

export const useOpenAIContext = (): UseOpenAIContextReturn => {
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>(defaultSentiment);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    cancelRef.current = false;
    return () => {
      isMountedRef.current = false;
      cancelRef.current = true;
    };
  }, []);

  // Load cached sentiment from localStorage
  const loadCachedSentiment = useCallback((): MarketSentiment | null => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        
        // Return cached data if it's less than 1 hour old
        if (age < CACHE_DURATION) {
          console.log('Using cached market sentiment, age:', Math.round(age / 60000), 'minutes');
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading cached sentiment:', error);
    }
    return null;
  }, []);

  // Save sentiment to localStorage
  const cacheSentiment = useCallback((sentiment: MarketSentiment) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sentiment));
    } catch (error) {
      console.error('Error caching sentiment:', error);
    }
  }, []);

  // Fetch fresh sentiment from OpenAI via Supabase Edge Function
  const fetchMarketSentiment = useCallback(async (): Promise<MarketSentiment> => {
    console.log('Fetching fresh market sentiment...');
    
    const { data, error: supabaseError } = await supabase.functions.invoke('get-market-sentiment', {
      body: {}
    });

    if (supabaseError) {
      console.error('Supabase function error:', supabaseError);
      throw new Error(`Failed to fetch market sentiment: ${supabaseError.message}`);
    }

    if (!data) {
      throw new Error('No data received from market sentiment function');
    }

    console.log('Fresh market sentiment received:', data);
    return data as MarketSentiment;
  }, []);

  // Main function to get sentiment (cached or fresh)
  const refreshSentiment = useCallback(async () => {
    if (!isMountedRef.current) return; // Component unmounted, don't start
    
    // Reset cancellation flag for new request
    cancelRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      // Try to get fresh sentiment
      const sentiment = await fetchMarketSentiment();
      if (cancelRef.current || !isMountedRef.current) return; // Component unmounted or cancelled, don't update state
      setMarketSentiment(sentiment);
      cacheSentiment(sentiment);
    } catch (err) {
      if (cancelRef.current || !isMountedRef.current) return; // Component unmounted or cancelled, don't update state
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching market sentiment:', errorMessage);
      setError(errorMessage);
      
      // On error, try to use cached data even if expired
      const cached = loadCachedSentiment();
      if (cached && !cancelRef.current && isMountedRef.current) {
        console.log('Using expired cache due to fetch error');
        setMarketSentiment(cached);
      }
      // Otherwise keep default sentiment
    } finally {
      if (!cancelRef.current && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchMarketSentiment, cacheSentiment, loadCachedSentiment]);

  // Initialize on mount - only run once
  useEffect(() => {
    const cached = loadCachedSentiment();
    if (cached) {
      setMarketSentiment(cached);
    } else {
      // No cache or expired, fetch fresh data
      refreshSentiment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - loadCachedSentiment and refreshSentiment are stable

  return {
    marketSentiment,
    isLoading,
    error,
    refreshSentiment
  };
};
