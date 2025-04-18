import { Err, logger, Ok } from "@common/utils";
import {
  HOUR_HEIGHT,
  USER_TIME_ZONE,
} from "@features/calendar/constants/calendarConstants";
import {
  differenceInHours,
  getHours,
  isAfter,
  isBefore,
  isValid,
  parseISO,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * 이벤트 객체를 받아 캘린더 그리드 상의 위치(top)와 높이(height)를 계산합니다.
 * 계산 성공 시 Ok({top, height}), 실패 시 Err(error)를 반환합니다.
 *
 * @param {object} event - 이벤트 객체 (start_time, end_time 포함)
 * @returns {Result<{top: number, height: number}, Error>} 계산 결과 또는 에러
 */
export const calculateEventPosition = (event) => {
  try {
    if (!event || typeof event !== "object") {
      return Err(new Error("Invalid event object provided."));
    }
    if (!event.start_time || typeof event.start_time !== "string") {
      return Err(new Error("Invalid or missing start_time string."));
    }
    if (!event.end_time || typeof event.end_time !== "string") {
      return Err(new Error("Invalid or missing end_time string."));
    }

    // 2. UTC 시간 문자열을 Date 객체로 파싱
    const startUtc = parseISO(event.start_time);
    const endUtc = parseISO(event.end_time);

    // 파싱된 Date 객체 유효성 검사
    if (!isValid(startUtc)) {
      return Err(new Error(`Failed to parse start_time: ${event.start_time}`));
    }
    if (!isValid(endUtc)) {
      return Err(new Error(`Failed to parse end_time: ${event.end_time}`));
    }

    // 3. UTC Date 객체를 사용자 시간대(KST) 기준으로 변환
    const startKST = toZonedTime(startUtc, USER_TIME_ZONE);
    const endKST = toZonedTime(endUtc, USER_TIME_ZONE);

    // 4. KST 기준 시작 시간(hour)으로 top 위치 계산
    const startHourKST = getHours(startKST);
    const top = startHourKST * HOUR_HEIGHT;

    // 5. KST 기준 시작 시간과 종료 시간의 시간(hour) 차이로 height 계산
    const durationInHours = differenceInHours(endKST, startKST);

    // duration이 0 또는 음수인 경우 에러 처리
    if (durationInHours <= 0) {
      // 종료 시간이 시작 시간보다 같거나 이전인 경우
      return Err(
        new Error(
          `Invalid event duration: start=${event.start_time}, end=${event.end_time}. Duration must be at least 1 hour.`
        )
      );
    }
    const height = durationInHours * HOUR_HEIGHT;

    // 성공 시
    return Ok({ top, height });
  } catch (error) {
    logger.error(
      `calculateEventPosition unexpected error (Event ID: ${event?.id}):`,
      error
    );
    // 예상치 못한 에러 발생 시 Err 객체 반환
    return Err(
      error instanceof Error ? error : new Error("Unknown calculation error")
    );
  }
};

/**
 * 시간 슬롯 기반으로 이벤트 목록의 가로 레이아웃(left, width)을 계산합니다.
 * (요구사항: 이벤트는 1시간 단위 정시 시작/종료)
 * @param {Array} sortedEvents - 시작 시간 기준으로 정렬된 이벤트 목록
 * @param {number} [totalWidthPercent=100] - 사용 가능한 전체 너비 비율
 * @param {number} [eventGapPercent=1] - 이벤트 사이의 간격 비율
 * @returns {Result <Array, Error>} 각 이벤트에 {...object, layout: {left: string, width: string}} 객체가 추가된 배열 또는 에러
 */
export const calculateHorizontalLayout = (
  sortedEvents,
  totalWidthPercent = 100,
  eventGapPercent = 1
) => {
  if (!Array.isArray(sortedEvents)) {
    return Err(new Error("Invalid input: sortedEvents must be an array."));
  }
  if (sortedEvents.length === 0) {
    return Ok([]);
  }

  try {
    // --- 1. 초기화 및 데이터 변환 ---
    const timeSlots = Array.from({ length: 24 }, () => ({
      eventIds: new Set(), // 각 슬롯에 포함될 이벤트 ID 를 Set 으로 관리 (중복 제거, 빠른 조회)
    }));
    const layoutInfo = []; // 각 아이템을 { evnet, startTime, endTime, layout } 형식으로 저장

    // 이후 작업을 위한 이벤트 데이터 파싱 및 layoutInfo 초기화
    for (const [index, event] of sortedEvents.entries()) {
      if (
        !event ||
        typeof event !== "object" ||
        !event.start_time ||
        !event.end_time
      ) {
        return Err(new Error(`Invalid evnet object at index ${index}`));
      }
      const startTime = parseISO(event.start_time);
      const endTime = parseISO(event.end_time);
      if (!isValid(startTime) || !isValid(endTime)) {
        return Err(
          new Error(
            `Invalid start or end time for event ID ${event.id || index}`
          )
        );
      }
      layoutInfo.push({
        event,
        startTime,
        endTime,
        layout: { left: 0, width: 100, maxOverlap: 1, columnIndex: -1 },
      });

      // 시간 슬롯에 이벤트 ID 기록
      const startHour = getHours(startTime);
      const endHour = getHours(endTime);
      for (let hour = startHour; hour < endHour; hour += 1) {
        if (hour >= 0 && hour < 24) {
          timeSlots[hour].eventIds.add(event.id);
        } else {
          logger.warn(`Event ${event.id} has invalid hour range: ${hour}`);
        }
      }
    }

    // --- 2. 각 이벤트의 최대 동시 겹침 수 계산 ---
    layoutInfo.forEach((info) => {
      let maxOverlapForEvent = 1;
      const startHour = getHours(info.startTime);
      const endHour = getHours(info.endTime);

      for (let hour = startHour; hour < endHour; hour += 1) {
        if (hour >= 0 && hour < 24) {
          maxOverlapForEvent = Math.max(
            maxOverlapForEvent,
            timeSlots[hour].eventIds.size
          );
        }
      }

      info.layout.maxOverlap = maxOverlapForEvent;
    });

    // --- 3. 컬럼 할당 로직 ---
    const columnsEndTime = []; // 각 컬럼의 마지막 이벤트 종료시간을 저장
    for (let i = 0; i < layoutInfo.length; i += 1) {
      const currentEventInfo = layoutInfo[i];
      let placedColumnIndex = -1;

      for (let colIndex = 0; colIndex < columnsEndTime.length; colIndex += 1) {
        // 기존 컬럼에 배치 가능한지 확인
        if (!isBefore(currentEventInfo.startTime, columnsEndTime[colIndex])) {
          placedColumnIndex = colIndex;
          break;
        }
      }

      if (placedColumnIndex !== -1) {
        // 배치 가능한 컬럼이 있다면
        currentEventInfo.layout.columnIndex = placedColumnIndex;
        if (
          isAfter(currentEventInfo.endTime, columnsEndTime[placedColumnIndex])
        ) {
          columnsEndTime[placedColumnIndex] = currentEventInfo.endTime; // 종료 시간 갱신
        }
      } else {
        currentEventInfo.layout.columnIndex = columnsEndTime.length;
        columnsEndTime.push(currentEventInfo.endTime);
      }
    }

    // --- 4. left, width 계산 ---
    const results = layoutInfo.map((info) => {
      const { event, layout } = info;
      const { columnIndex, maxOverlap } = layout;

      const width =
        (totalWidthPercent - (maxOverlap - 1) * eventGapPercent) / maxOverlap;
      const left = columnIndex * (width + eventGapPercent);

      return { ...event, layout: { left: `${left}%`, width: `${width}%` } };
    });

    return Ok(results);
  } catch (error) {
    logger.error("Error calculating horizontal layout:", error);
    return Err(
      error instanceof Error
        ? error
        : new Error("Unknown layout calculation error")
    );
  }
};
