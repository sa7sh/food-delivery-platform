// Stub for cacheMiddleware to allow the service to start
export const cacheResponse = (durationInSeconds) => {
  return (req, res, next) => next();
};

export const clearCache = async (url) => {};

export const clearPatternCache = async (pattern) => {};
