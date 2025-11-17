/** Chaos Engineering Tests */
export const chaosScenarios = {
  killDatabase: () => console.log('Simulating DB failure'),
  networkDelay: (ms: number) => new Promise(r => setTimeout(r, ms)),
  randomError: () => Math.random() > 0.9 && new Error('Chaos!')
};

