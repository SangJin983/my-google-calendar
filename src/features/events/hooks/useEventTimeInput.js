import { useState } from "react";
import {
  adjustTimeToHour,
  areSameLocalDateString,
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  isTimeAfter,
  isTimeBefore,
} from "../utils/timeUtils";

const initialConstraints = { min: "", max: "" };

export const useEventTimeInput = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startTimeConstraints, setStartTimeConstraints] =
    useState(initialConstraints);
  const [endTimeConstraints, setEndTimeConstraints] =
    useState(initialConstraints);

  const handleStartTimeChange = (e) => {
    const adjustedStartTime = adjustTimeToHour(e.target.value);
    setStartTime(adjustedStartTime);

    // 시작시간 입력 초기화시("")
    if (!adjustedStartTime) {
      // 시작시간과 종료시간의 제약 조건 초기화
      setStartTimeConstraints(initialConstraints);
      setEndTimeConstraints(initialConstraints);
      // endTime이 있을경우
      if (endTime) {
        // 시작시간 제약 조건 다시 설정
        const constraints = calculateStartTimeConstraints(endTime);
        setStartTimeConstraints(constraints);
      }
      return; // early return
    }

    // 시작시간 입력 시, 종료 시간 제약 설정
    const constraints = calculateEndTimeConstraints(adjustedStartTime);
    setEndTimeConstraints(constraints);

    // 종료시간 제약 조건 확인 및 초기화 로직
    if (
      endTime &&
      (isTimeBefore(endTime, constraints.min) ||
        !areSameLocalDateString(endTime, adjustedStartTime))
    ) {
      setEndTime("");
    }
  };

  const handleEndTimeChange = (e) => {
    const adjustedEndTime = adjustTimeToHour(e.target.value);
    setEndTime(adjustedEndTime);

    // 종료시간 입력 초기화 시 로직
    if (!adjustedEndTime) {
      setEndTimeConstraints(initialConstraints);
      setStartTimeConstraints(initialConstraints);

      if (startTime) {
        const constraints = calculateEndTimeConstraints(startTime);
        setEndTimeConstraints(constraints);
      }
      return;
    }

    // 종료시간 입력 시, 시작 시간 제약 설정
    const constraints = calculateStartTimeConstraints(adjustedEndTime);
    setStartTimeConstraints(constraints);
    // 시작 시간 제약조건 확인 및 초기화 로직
    if (
      startTime &&
      (isTimeAfter(startTime, constraints.max) ||
        !areSameLocalDateString(startTime, adjustedEndTime))
    ) {
      setStartTime("");
    }
  };

  return {
    startTime,
    endTime,
    startTimeConstraints,
    endTimeConstraints,
    handleStartTimeChange,
    handleEndTimeChange,
  };
};
