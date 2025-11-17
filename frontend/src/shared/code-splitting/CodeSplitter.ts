/**
 * @title CodeSplitter
 * @description Code splitting strategy implementation
 */

export const CodeSplitter = {
  loadComponent: async (path: string) => {
    return import(/* webpackChunkName: "[request]" */ `@/${path}`);
  },

  preloadComponent: (path: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  },

  getChunkName: (path: string) => {
    return path.split('/').pop()?.replace('.tsx', '').replace('.ts', '');
  },
};

