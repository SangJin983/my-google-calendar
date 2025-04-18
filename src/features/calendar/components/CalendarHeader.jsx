import { logger } from "@common/utils";
import { endOfWeek, format, isValid, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo } from "react";
import styled, { css } from "styled-components";
import {
  DATE_FORMAT_DAY_ONLY,
  DATE_FORMAT_DAY_WITH_SUFFIX,
  DATE_FORMAT_MONTH_DAY,
  DATE_FORMAT_YEAR_MONTH_DAY,
} from "../constants/dateFormats";

const HeaderContainer = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  flex-shrink: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: flex-start;
`;
const Button = styled.button`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  background-color: #fff;

  &:hover {
    background-color: #f8f9fa;
  }

  &:active {
    background-color: #e9ecef;
  }

  // 활성 스타일
  ${(props) =>
    props.$active &&
    css`
      background-color: #e9ecef;
      border-color: #adb5bd;
      font-weight: bold;
    `}
`;

const CurrentDateText = styled.h2`
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0 20px;
  text-align: center;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

/**
 * Calendar Header Component
 * @param {object} props
 * @param {Date} props.currentDate - 현재 표시 날짜 Date 객체
 * @param {()=>void} props.onPrev - 이전 기간 이동 함수
 * @param {()=>void} props.onNext - 다음 기간 이동 함수
 * @param {()=>void} props.onGoToToday - 오늘 날짜 이동 함수
 * @param {(mode: "day" | "week")=>void} props.onSetViewMode - 뷰 모드 변경 함수
 */
export const CalendarHeader = ({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onGoToToday,
  onSetViewMode,
}) => {
  // 날짜 포맷팅
  const formattedDate = useMemo(() => {
    if (!currentDate || !isValid(currentDate)) {
      logger.warn(
        "Invalid currentDate prop received in CalendarHeader:",
        currentDate
      );
      return "날짜 정보 없음";
    }
    try {
      if (viewMode === "day") {
        // "yyyy년 M월 d일 (EEE)"
        return format(
          currentDate,
          `${DATE_FORMAT_YEAR_MONTH_DAY} ${DATE_FORMAT_DAY_WITH_SUFFIX}`,
          { locale: ko }
        );
      } else {
        // viewMode === "week"
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        const startFormatted = format(start, DATE_FORMAT_YEAR_MONTH_DAY, {
          locale: ko,
        });
        // 월이 같으면 "yyyy년 M월 d일 - d일", 다르면 "yyyy년 M월 d일 - M월 d일"
        if (start.getMonth() === end.getMonth()) {
          const endFormatted = format(end, DATE_FORMAT_DAY_ONLY, {
            locale: ko,
          });
          return `${startFormatted} - ${endFormatted}`;
        } else {
          const endFormatted = format(end, DATE_FORMAT_MONTH_DAY, {
            locale: ko,
          });
          return `${startFormatted} - ${endFormatted}`;
        }
      }
    } catch (error) {
      logger.error(
        "Error formatting date in CalendarHeader:",
        error,
        currentDate,
        viewMode
      );
      return "날짜 표시 오류";
    }
  }, [currentDate, viewMode]);

  return (
    <HeaderContainer>
      <ButtonGroup>
        <Button onClick={onGoToToday} aria-label="오늘 날짜로 이동">
          오늘
        </Button>
        <Button
          onClick={onPrev}
          aria-label={viewMode === "day" ? "이전 날짜" : "이전 주"}
        >
          &lt;
        </Button>
        <Button
          onClick={onNext}
          aria-label={viewMode === "day" ? "다음 날짜" : "다음 주"}
        >
          &gt;
        </Button>
      </ButtonGroup>

      <CurrentDateText>{formattedDate}</CurrentDateText>

      <RightSection>
        <Button
          onClick={() => onSetViewMode("day")}
          $active={viewMode === "day"}
          aria-pressed={viewMode === "day"}
        >
          일간
        </Button>
        <Button
          onClick={() => onSetViewMode("week")}
          $active={viewMode === "week"}
          aria-pressed={viewMode === "week"}
        >
          주간
        </Button>
      </RightSection>
    </HeaderContainer>
  );
};
