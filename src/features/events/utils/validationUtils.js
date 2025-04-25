import { Err, isErr, Ok } from "@common/utils";
import { parseAndAdjustTimeToHour } from "./timeUtils";
import { differenceInHours, isSameDay } from "date-fns";


export const validateEventData = ({ title, startTime, endTime }) => {
  if (!title) {
    return Err("이벤트 제목을 입력해주세요.");
  }

  const startDateResult = parseAndAdjustTimeToHour(startTime);
  const endDateResult = parseAndAdjustTimeToHour(endTime);

  // 파싱 실패시 에러 반환
  if (isErr(startDateResult)) {
    return Err("시작 시간을 올바르게 입력해주세요.");
  }
  if (isErr(endDateResult)) {
    return Err("종료 시간을 올바르게 입력해주세요.");
  }

  // 성공 시 Date 객체 추출
  const startDate = startDateResult.value;
  const endDate = endDateResult.value;

  // 유효성 검사
  if (!isSameDay(startDate, endDate)) {
    return Err("시작 날짜와 종료 날짜는 같아야 합니다.");
  }
  if (differenceInHours(endDate, startDate) < 1) {
    return Err("종료 시간은 시작 시간보다 최소 1시간 이후여야 합니다.");
  }

  return Ok({ startDate, endDate });
};
