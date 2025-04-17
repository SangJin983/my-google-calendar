import { isErr, isOk, Ok } from "@common/utils";
import { isAfter, isBefore, isSameDay } from "date-fns";
import { useMemo, useState } from "react";
import {
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  formatDateToLocalDateTimeString,
  parseAndAdjustTimeToHour,
} from "../utils/timeUtils";

const initialConstraints = Ok({ min: null, max: null }); // Result 객체로 관리하기 위함

export const useEventTimeInput = (
  initialStartTime = "",
  initialEndTime = ""
) => {
  // 시간은 Result 확인 후 value(Date객체)값 혹은 null로 관리
  const [startTime, setStartTime] = useState(() => {
    const result = parseAndAdjustTimeToHour(initialStartTime);
    return isOk(result) ? result.value : null;
  });
  const [endTime, setEndTime] = useState(() => {
    const result = parseAndAdjustTimeToHour(initialEndTime);
    return isOk(result) ? result.value : null;
  });
  // 제약조건 또한 Result 객체로 관리
  const [startTimeConstraints, setStartTimeConstraints] =
    useState(initialConstraints);
  const [endTimeConstraints, setEndTimeConstraints] =
    useState(initialConstraints);

  // Input 에 표시될 시간 문자열
  const startTimeLocalString = useMemo(() => {
    const result = formatDateToLocalDateTimeString(startTime);
    return isOk(result) ? result.value : "";
  }, [startTime]);
  const endTimeLocalString = useMemo(() => {
    const result = formatDateToLocalDateTimeString(endTime);
    return isOk(result) ? result.value : "";
  }, [endTime]);

  // 제약 조건 문자열 (Input min/max 속성용)
  const startTimeConstraintStrings = useMemo(() => {
    if (isErr(startTimeConstraints)) {
      return { min: "", max: "" };
    }
    const constraints = startTimeConstraints.value;
    const minResult = formatDateToLocalDateTimeString(constraints.min);
    const maxResult = formatDateToLocalDateTimeString(constraints.max);
    return {
      min: isOk(minResult) ? minResult.value : "",
      max: isOk(maxResult) ? maxResult.value : "",
    };
  }, [startTimeConstraints]);
  const endTimeConstraintStrings = useMemo(() => {
    if (isErr(endTimeConstraints)) {
      return { min: "", max: "" };
    }
    const constraints = endTimeConstraints.value;
    const minResult = formatDateToLocalDateTimeString(constraints.min);
    const maxResult = formatDateToLocalDateTimeString(constraints.max);
    return {
      min: isOk(minResult) ? minResult.value : "",
      max: isOk(maxResult) ? maxResult.value : "",
    };
  }, [endTimeConstraints]);

  const handleStartTimeChange = (e) => {
    const parseResult = parseAndAdjustTimeToHour(e.target.value);

    if (isErr(parseResult)) {
      // 에러 발생시 (ex: 입력 초기화) 시간 제약조건 모두 초기화
      setStartTime(null);
      setStartTimeConstraints(initialConstraints);
      setEndTimeConstraints(initialConstraints);
      if (endTime) {
        // endTime이 있을 경우, 시작시간 제약조건 다시 설정
        const constraintsResult = calculateStartTimeConstraints(endTime);
        setStartTimeConstraints(constraintsResult);
      }
      return;
    }

    const newStartTime = parseResult.value;
    setStartTime(newStartTime);

    const constraintsResult = calculateEndTimeConstraints(newStartTime);
    setEndTimeConstraints(constraintsResult);

    // 종료시간 초기화 로직
    if (isOk(constraintsResult)) { // 제약 조건 계산 성공 시에만 비교
      const constraints = constraintsResult.value;
      if (
        endTime &&
        constraints.min &&
        (isBefore(endTime, constraints.min) ||
          !isSameDay(endTime, newStartTime))
      ) {
        setEndTime(null);
      }
    }
  };

  const handleEndTimeChange = (e) => {
    const parseResult = parseAndAdjustTimeToHour(e.target.value);

    if (isErr(parseResult)) {
      setEndTime(null);
      setStartTimeConstraints(initialConstraints);
      setEndTimeConstraints(initialConstraints);
      if (startTime) {
        // startTime이 있을 경우, 종료시간 제약조건 다시 설정
        const constraintsResult = calculateEndTimeConstraints(startTime);
        setEndTimeConstraints(constraintsResult);
      }
      return;
    }

    const newEndTime = parseResult.value;
    setEndTime(newEndTime);

    const constraintsResult = calculateStartTimeConstraints(newEndTime);
    setStartTimeConstraints(constraintsResult);

    // 시작시간 초기화 로직
    if (isOk(constraintsResult)) {
      const constraints = constraintsResult.value;
      if (
        startTime &&
        constraints.max &&
        (isAfter(startTime, constraints.max) ||
          !isSameDay(startTime, newEndTime))
      ) {
        setStartTime(null);
      }
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
