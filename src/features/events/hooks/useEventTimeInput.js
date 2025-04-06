import { isAfter, isBefore, isSameDay } from "date-fns";
import { useMemo, useState } from "react";
import {
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  formatDateToLocalDateTimeString,
  parseAndAdjustTimeToHour,
} from "../utils/timeUtils";

const initialConstraints = { min: null, max: null };

export const useEventTimeInput = (
  initialStartTime = "",
  initialEndTime = ""
) => {
  const [startTime, setStartTime] = useState(
    parseAndAdjustTimeToHour(initialStartTime)
  );
  const [endTime, setEndTime] = useState(
    parseAndAdjustTimeToHour(initialEndTime)
  );
  const [startTimeConstraints, setStartTimeConstraints] =
    useState(initialConstraints);
  const [endTimeConstraints, setEndTimeConstraints] =
    useState(initialConstraints);

  const startTimeLocalString = useMemo(
    () => formatDateToLocalDateTimeString(startTime),
    [startTime]
  );
  const endTimeLocalString = useMemo(() =>
    formatDateToLocalDateTimeString(endTime, [endTime])
  );
  const startTimeConstraintStrings = useMemo(
    () => ({
      min: formatDateToLocalDateTimeString(startTimeConstraints.min),
      max: formatDateToLocalDateTimeString(startTimeConstraints.max),
    }),
    [startTimeConstraints]
  );
  const endTimeConstraintStrings = useMemo(
    () => ({
      min: formatDateToLocalDateTimeString(endTimeConstraints.min),
      max: formatDateToLocalDateTimeString(endTimeConstraints.max),
    }),
    [endTimeConstraints]
  );

  const handleStartTimeChange = (e) => {
    const newStartTime = parseAndAdjustTimeToHour(e.target.value);
    setStartTime(newStartTime);

    if (!newStartTime) {
      // startTime 입력 초기화 시, 시간 제약조건 모두 초기화
      setStartTimeConstraints(initialConstraints);
      setEndTimeConstraints(initialConstraints);
      if (endTime) {
        // endTime 있을 경우, 시작시간 제약조건 다시 설정
        const constraints = calculateStartTimeConstraints(endTime);
        setStartTimeConstraints(constraints);
      }
      return;
    }
    // startTime 입력 시, 종료시간 제약조건 설정
    const constraints = calculateEndTimeConstraints(newStartTime);
    setEndTimeConstraints(constraints);

    // 종료 시간 초기화 로직
    if (
      endTime &&
      constraints.min &&
      (isBefore(endTime, constraints.min) || !isSameDay(endTime, newStartTime))
    ) {
      setEndTime(null);
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndDate = parseAndAdjustTimeToHour(e.target.value);
    setEndTime(newEndDate);

    if (!newEndDate) {
      setStartTimeConstraints(initialConstraints);
      setEndTimeConstraints(initialConstraints);
      if (startTime) {
        const constraints = calculateEndTimeConstraints(startTime);
        setEndTimeConstraints(constraints);
      }
      return;
    }
    // endTime 입력 시, 시작시간 제약조건 설정
    const constraints = calculateStartTimeConstraints(newEndDate);
    setStartTimeConstraints(constraints);

    // 시작 시간 초기화 로직
    if (
      startTime &&
      constraints.max &&
      (isAfter(startTime, constraints.max) || !isSameDay(startTime, newEndDate))
    ) {
      setStartTime(null);
    }
  };

  return {
    startTime: startTimeLocalString,
    endTime: endTimeLocalString,
    startTimeConstraints: startTimeConstraintStrings,
    endTimeConstraints: endTimeConstraintStrings,
    handleStartTimeChange,
    handleEndTimeChange,
  };
};
