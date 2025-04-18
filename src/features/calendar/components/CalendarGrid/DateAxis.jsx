import { logger } from "@common/utils";
import { DATE_AXIS_HEIGHT } from "@features/calendar/constants/calendarConstants";
import { DATE_FORMAT_AXIS_DAY } from "@features/calendar/constants/dateFormats";
import { format, isToday, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import styled, { css } from "styled-components";

// 날짜 축 컨테이너
const AxisContainer = styled.div`
  display: flex;
  flex-grow: 1;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  flex-shrink: 0; // 높이 고정
  height: ${DATE_AXIS_HEIGHT}px;
  align-items: center;
`;

// 각 날짜 헤더
const DateHeader = styled.div`
  flex: 1; // 모든 날짜 헤더가 동일 너비 차지
  padding: 0 5px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;

  // 오늘 날짜 강조
  ${(props) =>
    props.$isToday &&
    css`
      color: #1a73e8;
      font-weight: bold;
    `}
`;

/**
 * Date Axis Component
 * @param {object} props
 * @param {Date[]} props.displayDates - 표시할 날짜 배열
 */
export const DateAxis = ({ displayDates = [] }) => {
  if (!Array.isArray(displayDates)) {
    logger.warn(
      "DateAxis: Invalid displayDates props received (not array).",
      displayDates
    );
    return null;
  }

  const allDatesValid = displayDates.every(isValid);
  if (!allDatesValid) {
    logger.error(
      "DateAxis: contains invalid date(s) in displayDayes array.",
      displayDates
    );
    return null;
  }

  if (displayDates.length === 0) {
    logger.warn("DateAxis: displayDates array is empty.");
    return <AxisContainer />;
  }

  return (
    <AxisContainer>
      {displayDates.map((date) => {
        const dateKey = date.toISOString();
        return (
          <DateHeader key={dateKey} $isToday={isToday(date)}>
            {/* 예시: "15 (화)" */}
            {format(date, DATE_FORMAT_AXIS_DAY, { locale: ko })}
          </DateHeader>
        );
      })}
    </AxisContainer>
  );
};
