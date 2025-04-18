import { addDays, addWeeks, subDays, subWeeks } from "date-fns";
import { useCallback, useState } from "react";

/**
 * 캘린더 네비게이션 및 뷰 모드 상태 관리 훅
 * @param {Date} [initialDate=new Date()] - 초기 날짜
 * @param {"day" | "week"} [initialViewMode="day"] - 초기 뷰 모드
 * @returns {{
 * currentDate: Date,
 * viewMode: "day" | "week",
 * setViewMode: (mode: "day" | "week") => void,
 * goToNext: () => void,
 * goToPrev: () => void,
 * goToToday: () => void,
 * }}
 */
export const useCalendarNavigation = (
  initialDate = new Date(),
  initialViewMode = "day"
) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewModeState] = useState(initialViewMode);

  const setViewMode = useCallback((mode) => {
    if (mode === "day" || mode === "week") {
      setViewModeState(mode);
    }
  }, []);

  const goToNext = useCallback(() => {
    if (viewMode === "day") {
      setCurrentDate((current) => addDays(current, 1));
    } else {
      // viewMode === "week"
      setCurrentDate((current) => addWeeks(current, 1));
    }
  }, [viewMode]);

  const goToPrev = useCallback(() => {
    if (viewMode === "day") {
      setCurrentDate((current) => subDays(current, 1));
    } else {
      setCurrentDate((current) => subWeeks(current, 1));
    }
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setViewModeState("day");
  }, []);

  return {
    currentDate,
    viewMode,
    setViewMode,
    goToNext,
    goToPrev,
    goToToday,
  };
};
