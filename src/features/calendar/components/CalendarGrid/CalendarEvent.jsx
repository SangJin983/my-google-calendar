import { logger } from "@common/utils";
import { HOUR_HEIGHT } from "@features/calendar/constants/calendarConstants";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// 개별 이벤트 스타일
const EventWrapper = styled.div.attrs((props) => ({
  style: {
    top: `${props.$top || 0}px`,
    height: `${props.$height || HOUR_HEIGHT}px`,
    left: `${props.$left || "0%"}`,
    width: `${props.$width || "100%"}`,
  },
}))`
  position: absolute;
  background-color: #e9f5ff;
  border: 1px solid #aed6f1;
  border-left: 3px solid #3498db;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 0.75rem;
  color: #2c3e50;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d4eaff;
  }
`;

const EventContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Calendar Event Component
 * 이벤트 데이터를 받아 시각적으로 표시하고 클릭 이벤트를 처리합니다
 * 위치(top, heigth, left, width)는 props로 전달 받습니다
 *
 * @param {object} props
 * @param {object} props.event - 이벤트 데이터 객체
 * @param {number} [props.$top] - 계산된 top 위치 (px) // $ 표시 (DOM 요소에 전달x)
 * @param {number} [props.$height] - 계산된 height (px)
 * @param {number | string} [props.$left] - 계산된 left 위치 (%, px 등)
 * @param {number | string} [props.$width] - 계산된 width (%, px 등)
 */
export const CalendarEvent = ({ event, $top, $height, $left, $width }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    logger.info(`Navigating to event detail: ${event.id}`);
    navigate(`/events/${event.id}`);
  };

  // 위치 정보가 유효한지 확인
  if (
    $top === undefined ||
    $height === undefined ||
    $left === undefined ||
    $width === undefined
  ) {
    logger.warn(
      `Event ID ${event.id}에 유효하지 않은 위치 props가 전달되었습니다`
    );
    return null;
  }

  return (
    <EventWrapper
      onClick={handleClick}
      $top={$top}
      $height={$height}
      $left={$left}
      $width={$width}
      title={event.title}
      aria-label={`이벤트: ${event.title}`}
    >
      <EventContent>{event.title || "제목 없음"}</EventContent>
    </EventWrapper>
  );
};
