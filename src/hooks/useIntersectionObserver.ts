import { useRef, useEffect } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
}

/**
 * Hook to observe element intersection with viewport
 * @param callback Function called when intersection state changes
 * @param options IntersectionObserver options
 * @returns ref to attach to the observed element
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
    callback: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
    options: UseIntersectionObserverOptions = {}
) {
    const ref = useRef<T>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                callbackRef.current(entry.isIntersecting, entry);
            },
            {
                threshold: options.threshold ?? 0.5,
                root: options.root ?? null,
                rootMargin: options.rootMargin ?? '0px',
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [options.threshold, options.root, options.rootMargin]);

    return ref;
}
