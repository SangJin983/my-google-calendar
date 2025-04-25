import {
  AXIS_WIDTH,
  HOUR_HEIGHT,
  HOURS_IN_DAY,
  TOTAL_CALENDAR_HEIGHT,
} from "@features/calendar/constants/calendarConstants";
import styled from "styled-components";

const AxisContainer = styled.div`
  width: ${AXIS_WIDTH}px;
  flex-shrink: 0;
  position: relative; // span 위치 조정을 위해
  background-color: #f8f9fa;
  min-height: ${TOTAL_CALENDAR_HEIGHT}px;
`;

const TimeSlot = styled.div`
  height: ${HOUR_HEIGHT}px;
  position: relative;
  text-align: right;
  padding-right: 8px;
  font-size: 0.75rem;
  color: #6c757d;

  /* 시간 텍스트 */
  & > span {
    position: absolute;
    top: -8px; // 선과 겹치지 않도록 살짝 위로
    right: 8px;
    background-color: #f8f9fa; // 아래 선 가리기 위한 배경색
    padding: 0 2px; // 좌우 약간 여백
  }
`;

export const TimeAxis = () => {
  return (
    <AxisContainer>
      {HOURS_IN_DAY.map((hour) => (
        <TimeSlot key={hour}>
          {hour > 0 && <span>{`${hour.toString().padStart(2, "0")}:00`}</span>}
        </TimeSlot>
      ))}
    </AxisContainer>
  );
};
