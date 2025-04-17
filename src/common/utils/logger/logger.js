import { LOG_LEVELS } from "@common/constants";

let logger;

// --- 유틸 함수 ---
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

// --- 로거 생성(초기화) 함수 ---
/**
 * 주입 받은 설정으로 로거 인스턴스를 초기화합니다.
 * @param {object} config - 로거 설정 객체
 * @param {number} config.level - 로그 레벨 (숫자)
 * @param {object} config.handler - 로그 핸들러 객체 (handleLog 메서드 필요)
 * @return {object} - logger 인스턴스 (debug, info, warn, error 메서드 포함)
 */
const createLogger = (config) => {
  if (typeof config?.level !== "number" || !config?.handler?.handleLog) {
    console.error(
      "유효 하지 않은 로거 설정이 주입되었습니다. 기본 콘솔 로거를 사용합니다.",
      config
    );
    return {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  }

  const CURRENT_LOG_LEVEL = config.level;
  const CURRENT_LOG_HANDLER = config.handler;

  const log = (level, message, ...args) => {
    if (level < CURRENT_LOG_LEVEL) {
      return;
    }

    const formattedMessage = formatLogMessage(level, message, args);
    const levelName = getLogLevelName(level);

    try {
      // 설정에서 주입 받은 핸들러 사용
      CURRENT_LOG_HANDLER.handleLog(level, levelName, formattedMessage);
    } catch (handlerError) {
      console.error("Logging handler failed:", handlerError);
      console.error("Original log message:", formattedMessage);
    }
  };

  // 최종 로거 인스턴스 반환
  logger = {
    debug: (msg, ...args) => log(LOG_LEVELS.DEBUG, msg, ...args),
    info: (msg, ...args) => log(LOG_LEVELS.INFO, msg, ...args),
    warn: (msg, ...args) => log(LOG_LEVELS.WARN, msg, ...args),
    error: (msg, ...args) => log(LOG_LEVELS.ERROR, msg, ...args),
  };
};

export { createLogger, logger };
