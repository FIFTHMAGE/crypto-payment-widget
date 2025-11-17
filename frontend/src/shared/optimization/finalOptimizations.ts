/** Final Performance Optimizations */
export const optimizations = {
  preconnect: ['https://api.example.com', 'https://cdn.example.com'],
  prefetch: ['/payment', '/history'],
  preload: ['/assets/critical.css', '/assets/font.woff2'],
  
  applyOptimizations() {
    this.preconnect.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

