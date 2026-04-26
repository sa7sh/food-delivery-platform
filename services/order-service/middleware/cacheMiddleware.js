// Simplified Cache Middleware Stub
export const cacheResponse = (durationInSeconds) => {
  return (req, res, next) => {
    next();
  };
};

export const clearCache = async (url) => {
  console.log(`[Cache Stub] Clear requested for: ${url}`);
};

export const clearPatternCache = async (pattern) => {
  console.log(`[Cache Stub] Pattern clear requested for: ${pattern}`);
};
