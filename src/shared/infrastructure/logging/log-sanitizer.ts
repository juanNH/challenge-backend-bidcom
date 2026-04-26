const sensitiveKeys = new Set([
  'authorization',
  'cookie',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
]);

export const sanitizeLogPayload = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogPayload(item));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((result, [key, item]) => {
      result[key] = sensitiveKeys.has(key)
        ? '[REDACTED]'
        : sanitizeLogPayload(item);

      return result;
    }, {});
  }

  return value;
};
