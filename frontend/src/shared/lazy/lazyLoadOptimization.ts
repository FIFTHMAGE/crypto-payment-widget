/** Lazy Loading Optimization */
export const optimizeLazyLoad = () => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('loaded'));
    });
    return observer;
  }
  return null;
};

