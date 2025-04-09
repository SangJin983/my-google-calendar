import { LOG_LEVELS } from "@common/constants";

export const consoleLogHandler = {
  /**
   * 로그 메시지를 콘솔에 출력 합니다.
   * @param {number} level - 로그 레벨 숫자 값 (LOG_LEVELS 참고)
   * @param {string} levelName - 로그 레벨 이름 ('DEBUG', 'INFO' 등)
   * @param {string} formattedMessage - 포맷팅된 로그 메시지
   */

  handleLog: (level, levelName, formattedMessage) => {
    // levelName 은 현재 직접 사용하지 않지만 인터페이스 유지를 위해 받음
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      default:
        console.log(`[${levelName}] ${formattedMessage}`); // 기본 console.log 에 levelName 추가
        break;
    }
  },
};
