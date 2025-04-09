import { LOG_LEVELS } from "@common/constants";
import { LOGGER_CONFIG } from "@config/loggerConfig";

const CURRENT_LOG_LEVEL = LOGGER_CONFIG.LEVEL;
const CURRENT_LOG_HANDLER = LOGGER_CONFIG.HANDLER;

const getLogLevelName = (levelValue) => {
  return (
    Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === levelValue) ||
    "UNKNOWN"
  );
};

const safeJsonStringify = (value, indent = 2) => {
  try {
    return JSON.stringify(value, null, indent);
  } catch (e) {
    return "(Cannot stringify value)";
  }
};

const formatErrorArg = (errorObject) => {
  if (!(errorObject instanceof Error)) {
    return ""; // Error 객체가 아니라면 빈 문자열 반환
  }

  return `\nError:${errorObject.message}\nStack:${errorObject.stack}`;
};
const formatOtherArgs = (args) => {
  if (!args || args.length === 0) {
    return "";
  }

  return `\nArgs:${safeJsonStringify(args)}`;
};

const formatLogMessage = (level, message, args) => {
  const timeStamp = new Date().toISOString();
  const levelName = getLogLevelName(level);
  const baseMessage = `[${timeStamp}] [${levelName}] ${message}`;

  if (!args || args.length === 0) {
    return baseMessage;
  }

  // Error 객체 찾기
  const errorObject = args.find((arg) => arg instanceof Error);

  // 요청한 로그의 레벨이 ERROR 이상이고 Error 객체가 존재한다면 에러 포멧팅 적용
  if (level >= LOG_LEVELS.ERROR && errorObject) {
    const otherArgs = args.filter((arg) => arg !== errorObject); // Error 객체가 아닌 나머지 인자 필터링
    const formattedErrorMessage = formatErrorArg(errorObject);
    const formattedOtherMessage = formatOtherArgs(otherArgs);

    // 기본 메시지 + 에러 포멧 + 나머지 인자 포멧
    return `${baseMessage}${formattedErrorMessage}${formattedOtherMessage}`;
  }

  const formattedArgsMessage = formatOtherArgs(args);
  return `${baseMessage}${formattedArgsMessage}`;
};

const log = (level, message, ...args) => {
  if (level < CURRENT_LOG_LEVEL) {
    return;
  }

  const formattedMessage = formatLogMessage(level, message, args);
  const levelName = getLogLevelName(level);

  // 주입된 핸들러의 handleLog 메서드 호출
  try {
    // 핸들러가 존재하고 handleLog 메서드가 있는지 확인
    if (
      CURRENT_LOG_HANDLER &&
      typeof CURRENT_LOG_HANDLER.handleLog === "function"
    ) {
      CURRENT_LOG_HANDLER.handleLog(level, levelName, formattedMessage);
    } else {
      // 핸들러가 없거나 잘못된 경우 대비
      console.error("Logger handler is not configured correctly.");
      console.log(`[${levelName}] ${formattedMessage}`);
    }
  } catch (handlerError) {
    // 핸들러 자체의 오류인 경우
    console.error("Logging handler failed:", handlerError);
    console.error("Original log message:", formattedMessage);
  }
};

export const logger = {
  debug: (msg, ...args) => log(LOG_LEVELS.DEBUG, msg, ...args),
  info: (msg, ...args) => log(LOG_LEVELS.INFO, msg, ...args),
  warn: (msg, ...args) => log(LOG_LEVELS.WARN, msg, ...args),
  // Error 객체의 필요성을 명시적으로 표현
  error: (msg, errorObject, ...args) => {
    if (errorObject instanceof Error) {
      log(LOG_LEVELS.ERROR, msg, errorObject, ...args);
    } else {
      log(LOG_LEVELS.ERROR, msg, errorObject, ...args);
    }
  },
};
