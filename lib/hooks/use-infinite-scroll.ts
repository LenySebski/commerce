"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll<T = HTMLDivElement>(
  fetchMore: () => Promise<void>,
  hasNextPage: boolean,
  isLoading: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = "50px" } = options;
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<T | null>(null);

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry?.isIntersecting && hasNextPage && !isLoading && !isFetching) {
        setIsFetching(true);
        try {
          await fetchMore();
        } catch (error) {
          console.error("Error fetching more items:", error);
        } finally {
          setIsFetching(false);
        }
      }
    },
    [fetchMore, hasNextPage, isLoading, isFetching]
  );

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect, threshold, rootMargin]);

  return {
    targetRef,
    isFetching,
  };
}
