import { ErrorMessage } from "@common/components";
import { Err, isErr, logger, Ok } from "@common/utils";
import {
  AXIS_WIDTH,
  DATE_AXIS_HEIGHT,
  HOUR_HEIGHT,
  HOURS_IN_DAY,
  TOTAL_CALENDAR_HEIGHT,
  USER_TIME_ZONE,
} from "@features/calendar/constants/calendarConstants";
import {
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isValid,
  parseISO,
  startOfWeek,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import styled from "styled-components";
import { DateAxis } from "./DateAxis";
import { EventLane } from "./EventLane";
import { TimeAxis } from "./TimeAxis";

// 전체 Grid 컨테이너
const GridContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
`;

// 날짜 축 영역
const DateAxisArea = styled.div`
  display: flex;
  flex-shrink: 0; // 높이 고정
`;

// 시간 축 위 빈 공간
const TimeAxisGap = styled.div`
  width: ${AXIS_WIDTH}px;
  flex-shrink: 0;
  height: ${DATE_AXIS_HEIGHT}px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
`;

// 스크롤이 적용될 메인 컨텐츠 영역 (TimeAxis + ContentArea)
const ScrollableContent = styled.div`
  flex-grow: 1;
  display: flex; // TimeAxis 와 Content 를 가로로 배치
  overflow-y: scroll; // 세로 스크롤
`;

// 이벤트 내용 영역
const ContentArea = styled.div`
  flex-grow: 1;
  display: flex; // 여러 EventLane을 가로로 배치
  position: relative;
  border-left: 1px solid #e0e0e0;
  min-height: ${TOTAL_CALENDAR_HEIGHT}px;
`;

// 시간 구분선 컨테이너 (ContentArea 위에 겹쳐짐)
const TimeLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; // 이벤트 클릭 방해하지 않도록 설정
  display: flex; // 내부 라인 정렬
`;

const TimeLineColumn = styled.div`
  flex: 1; // 각 날짜 열 너비만큼 차지
  height: 100%;
`;
// 개별 시간 구분선
const TimeLine = styled.div`
  height: ${HOUR_HEIGHT}px;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #eee;

  &:first-child {
    border-top: 1px solid #eee; // 맨 위에도 선 추가
  }
`;

const FirstTimeLineColumn = styled(TimeLineColumn)`
  ${TimeLine} {
    border-left: none;
  }
`;

/**
 * 주어진 날짜가 속한 주의 모든 날짜 배열을 반환
 * @param {Date} date
 * @returns {Date[]}
 */
const getWeekDays = (date) => {
  try {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return Ok(eachDayOfInterval({ start, end }));
  } catch (error) {
    logger.error("Error claculating week days:", error);
    return Err(new Error("Failed to calculate week days"));
  }
};

/**
 * 특정 날짜에 해당하는 이벤트들을 필터링 (KST 기준)
 * @param {Array} allEvents - 전체 이벤트 목록
 * @param {Date} targetDate - 필터링 기준 날짜 (Date 객체)
 * @returns {Array} 필터링 된 이벤트 목록
 */
const filterEventsForDate = (allEvents, targetDate) => {
  if (!allEvents || !Array.isArray(allEvents)) {
    logger.warn("[filterEventsForDate] Invalid allEvents received:", allEvents);
    return []; // 유효하지 않은 이벤트 목록 처리
  }
  if (!isValid(targetDate)) {
    logger.warn(
      "[filterEventsForDate] Invalid targetDate received:",
      targetDate
    );
    return []; // 유효하지 않은 날짜 객체 처리
  }

  return allEvents.filter((event) => {
    // event 객체 및 start_time 검사
    if (
      !event ||
      typeof event !== "object" ||
      typeof event.start_time !== "string"
    ) {
      logger.warn(
        `[filterEventsForDate] Skipping invalid event object or missing start_time:`,
        event
      );
      return false;
    }

    try {
      // 1. DB에서 온 UTC ISO 문자열 파싱
      const startUtc = parseISO(event.start_time);

      if (!isValid(startUtc)) {
        logger.warn(
          `[filterEventsForDate] Failed to parse start_time for event ID ${event.id}: ${event.start_time}`
        );
        return false;
      }

      // 2. UTC Date 객체를 KST 시간으로 변환
      const startKST = toZonedTime(startUtc, USER_TIME_ZONE);

      // 3. KST 기준 이벤트 시작 날짜와 targetDate 비교
      const result = isSameDay(startKST, targetDate);

      return result;
    } catch (error) {
      logger.warn(
        `[filterEventsForDate] Error processing event time for filtering (ID: ${event.id}):`,
        error
      );
      return false;
    }
  });
};

/**
 * Calendar Grid Component: 시간/날짜 축 및 이벤트 표시 영역 레이아웃
 * @param {object} props
 * @param {Date} props.currentDate - 현재 표시 날짜
 * @param {Array} props.events - 표시할 이벤트 목록
 * @param {"day" | "week"} props.viewMode - 보기 모드 ("day" 또는 "week")
 */
export const CalendarGrid = ({ currentDate, events, viewMode }) => {
  logger.debug("CalendarGrid 렌더링", { viewMode, eventCount: events.length });
  const hours = HOURS_IN_DAY;

  const displayDatesResult =
    viewMode === "week" ? getWeekDays(currentDate) : Ok([currentDate]);

  let displayDates = [];
  if (isErr(displayDatesResult)) {
    logger.error("Failed to get displat dates:", displayDatesResult.error);
    return <ErrorMessage message={"날짜 정보를 표시할 수 없습니다."} />;
  } else {
    displayDates = displayDatesResult.value;
  }

  return (
    <GridContainer>
      {/* 상단: 날짜 축 영역 */}
      <DateAxisArea>
        <TimeAxisGap />
        <DateAxis
          currentDate={currentDate}
          viewMode={viewMode}
          displayDates={displayDates}
        />
      </DateAxisArea>

      {/* 하단: 스크롤 가능한 컨텐츠 영역 */}
      <ScrollableContent>
        {/* 왼쪽: 시간 축 */}
        <TimeAxis />

        {/* 오른쪽: 이벤트 내용 */}
        <ContentArea>
          <TimeLines>
            {displayDates.map((date, index) => {
              const ColumnComponent =
                index === 0 ? FirstTimeLineColumn : TimeLineColumn;
              return (
                <ColumnComponent key={date.toISOString()}>
                  {hours.map((hour) => (
                    <TimeLine key={hour} />
                  ))}
                </ColumnComponent>
              );
            })}
          </TimeLines>

          {displayDates.map((date) => (
            <EventLane
              key={date.toISOString()}
              specificDate={date}
              events={filterEventsForDate(events, date)}
              viewMode={viewMode}
            />
          ))}
        </ContentArea>
      </ScrollableContent>
    </GridContainer>
  );
};
