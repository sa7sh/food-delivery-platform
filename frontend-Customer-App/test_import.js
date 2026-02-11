try {
  const resolvedPath = require.resolve('nativewind/metro');
  console.log('Resolved path:', resolvedPath);
  const { withNativeWind } = require(resolvedPath);
  console.log('Success requiring resolved path');
} catch (e) {
  console.error('Error with require.resolve:', e);
}
