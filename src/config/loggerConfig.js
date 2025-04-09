import { LOG_LEVELS } from "@common/constants";
import { consoleLogHandler } from "@common/utils";

const logLevelName =
  import.meta.env.VITE_LOG_LEVEL || (import.meta.env.PROD ? "INFO" : "DEBUG");

const currentLogLevel =
  LOG_LEVELS[logLevelName.toUpperCase()] ?? LOG_LEVELS.DEBUG;

const currentLogHandler = consoleLogHandler;

export const LOGGER_CONFIG = {
  LEVEL: currentLogLevel,
  LEVEL_NAME: logLevelName,
  HANDLER: currentLogHandler,
};
