import { isErr, logger } from "@common/utils";
import {
  DAY_VIEW_EVENT_LEFT,
  DAY_VIEW_EVENT_WIDTH
} from "@features/calendar/constants/calendarConstants";
import {
  calculateEventPosition,
  calculateHorizontalLayout,
} from "@features/calendar/utils/eventLayoutUtils";
import { compareAsc, parseISO } from "date-fns";
import styled from "styled-components";
import { CalendarEvent } from "./CalendarEvent";
import { useMemo } from "react";

const LaneContainer = styled.div`
  position: relative;
  flex: 1;
  min-height: 100%;
  border-left: 1px solid #eee; // week 뷰에서 날짜 구분 선 역할

  &:first-child {
    border-left: none; // 첫 번째 레인 왼쪽 테두리는 제거
  }
`;

export const EventLane = ({ specificDate, events, viewMode }) => {
  logger.debug(`EventLane 렌더링 for ${viewMode} view`, {
    eventCount: events.length,
    date: specificDate,
  });

  // --- 레이아웃 계산 로직 ---
  const eventsWithLayout = useMemo(() => {
    // 이벤트 정렬
    const sortedEvents = events.toSorted((a, b) => {
      try {
        const startComparison = compareAsc(
          parseISO(a.start_time),
          parseISO(b.start_time)
        );
        if (startComparison !== 0) {
          return startComparison;
        }
        return compareAsc(parseISO(a.end_time), parseISO(b.end_time));
      } catch (error) {
        logger.warn("Error sorting evnets:", error, a, b);
        return 0;
      }
    });

    // 가로 레이아웃 계산
    const horizontalLayoutResult = calculateHorizontalLayout(sortedEvents);

    if (isErr(horizontalLayoutResult)) {
      logger.error(
        "Failed to calculate horizontal layout",
        horizontalLayoutResult.error
      );
      // 에러 발생 시, 기본 레이아웃으로 처리
      return sortedEvents.map((event) => ({
        ...event,
        layout: { left: DAY_VIEW_EVENT_LEFT, width: DAY_VIEW_EVENT_WIDTH },
      }));
    }

    const eventsWithHorizontalLayout = horizontalLayoutResult.value;

    // 세로 위치(top, height) 계산 및 최종 데이터 조합
    return eventsWithHorizontalLayout
      .map((eventData) => {
        const positionResult = calculateEventPosition(eventData);

        if (isErr(positionResult)) {
          logger.error(
            `Event ID ${eventData.id} 세로 위치 계산 실패:`,
            positionResult.error
          );
          return null;
        }

        const { top, height } = positionResult.value;

        // 렌더링에 필요한 모든 정보 결합
        return {
          ...eventData,
          renderData: {
            top,
            height,
            left: eventData.layout.left,
            width: eventData.layout.width,
          },
        };
      })
      .filter(Boolean); // 계산 실패(null) 이벤트 제거
  }, [events]);

  // --- 렌더링 로직 ---
  const renderEvents = () => {
    return eventsWithLayout.map((eventData) => {
      return (
        <CalendarEvent
          key={eventData.id}
          event={eventData}
          $top={eventData.renderData.top}
          $height={eventData.renderData.height}
          $left={eventData.renderData.left}
          $width={eventData.renderData.width}
        />
      );
    });
  };

  return <LaneContainer>{renderEvents()}</LaneContainer>;
};
