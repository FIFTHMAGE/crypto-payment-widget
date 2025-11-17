/** Feature Flags System */
export const featureFlags = {
  subscriptions: process.env.FEATURE_SUBSCRIPTIONS === 'true',
  crossChain: process.env.FEATURE_CROSS_CHAIN === 'true',
  streaming: process.env.FEATURE_STREAMING === 'true',
  gasless: process.env.FEATURE_GASLESS === 'true'
};

export const isFeatureEnabled = (feature: keyof typeof featureFlags) => featureFlags[feature];

