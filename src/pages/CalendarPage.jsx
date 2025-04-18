import { STATUS } from "@common/constants";
import { logger } from "@common/utils";
import {
  CalendarGrid,
  CalendarHeader,
  useCalendarNavigation,
} from "@features/calendar";
import { fetchEvents } from "@features/events";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

// 로딩 및 에러 컴포넌트 (임시)
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;
const ErrorMessageContainer = styled.div`
  padding: 20px;
  color: red;
  text-align: center;
`;

const CalendarPage = () => {
  const dispatch = useDispatch();
  const entities = useSelector((state) => state.events.entities);
  const status = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);

  const { currentDate, goToNext, goToPrev, goToToday, viewMode, setViewMode } =
    useCalendarNavigation();

  useEffect(() => {
    if (status === STATUS.IDLE) {
      // 최초 로드 또는 상태 초기화 시에만 호출
      logger.info("Fetching events (CalendarPage mount/update)");
      dispatch(fetchEvents());
    }
  }, [status]);

  if (status === STATUS.LOADING && Object.keys(entities).length === 0) {
    logger.info("CalendarPage: Displaying loading spinner");
    return <LoadingSpinner>캘린더 로딩 중...</LoadingSpinner>;
  }

  if (status === STATUS.FAILED && error) {
    logger.error("CalendarPage: Displaying error message:", error);
    return (
      <ErrorMessageContainer>
        이벤트 중 오류가 발생했습니다: {error}
      </ErrorMessageContainer>
    );
  }

  const allEvents = Object.values(entities);

  return (
    <CalendarContainer>
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={goToPrev}
        onNext={goToNext}
        onGoToToday={goToToday}
        onSetViewMode={setViewMode}
      />
      <CalendarGrid
        currentDate={currentDate}
        events={allEvents}
        viewMode={viewMode}
      />
    </CalendarContainer>
  );
};

export default CalendarPage;
