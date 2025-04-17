import { LOG_LEVELS } from "@common/constants";

const getLogLevelFromEnv = () => {
  const logLevelName =
    import.meta.env.VITE_LOG_LEVEL || (import.meta.env.PROD ? "INFO" : "DEBUG");

  return LOG_LEVELS[logLevelName.toUpperCase()] ?? LOG_LEVELS.DEBUG;
};

const getLogLevelNameFromEnv = () => {
  return (
    import.meta.env.VITE_LOG_LEVEL || (import.meta.env.PROD ? "INFO" : "DEBUG")
  );
};

export const getLoggerLevel = getLogLevelFromEnv;
export const getLoggerLevelName = getLogLevelNameFromEnv;
