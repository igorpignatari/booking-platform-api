export const createCorrelationId = (): string => {
  return crypto.randomUUID();
};
