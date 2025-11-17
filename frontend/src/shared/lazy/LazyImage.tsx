/** LazyImage - Lazy loading for images */
import { useState, useEffect, useRef } from 'react';
export const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsLoaded(true); observer.disconnect(); }
    });
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);
  return <img ref={imgRef} src={isLoaded ? src : ''} alt={alt} className="w-full h-auto" />;
};

