import { logger } from "@common/utils";
import {
  addHours,
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  setHours,
  startOfDay,
  startOfHour,
  subHours,
} from "date-fns";

const LOCAL_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

// 현지 시간 문자열 -> Date 객체 변환 및 정시 처리
const parseAndAdjustTimeToHour = (dateTimeString) => {
  if (!dateTimeString) {
    return null;
  }
  try {
    // 'yyyy-MM-ddTHH:mm' 형식으로 파싱 시도
    const parsedDate = parse(dateTimeString, LOCAL_DATETIME_FORMAT, new Date());
    // 유효한 날짜인지 확인
    if (!isValid(parsedDate)) {
      throw new Error("Invalid date format");
    }
    // Date에 정시처리
    return startOfHour(parsedDate);
  } catch (error) {
    logger.error("Error parsing date time:", error, dateTimeString);
    return null;
  }
};

// Date 객체 -> 현지 시간 문자열 (YYYY-MM-DDTHH:mm) 변환
const formatDateToLocalDateTimeString = (date) => {
  if (!date || !isValid(date)) {
    return "";
  }
  try {
    return format(date, LOCAL_DATETIME_FORMAT);
  } catch (error) {
    logger.error("Error formating date to local string:", error, date);
    return "";
  }
};

const dateToUTCISOString = (date) => {
  if (!date || !isValid(date)) {
    return "";
  }
  try {
    return date.toISOString();
  } catch (error) {
    logger.error("Error converting date to UTC ISO string:", error, date);
    return "";
  }
};

const calculateStartTimeConstraints = (endDate) => {
  if (!endDate || !isValid(endDate)) {
    return { min: null, max: null };
  }
  try {
    const minStartDate = startOfDay(endDate);
    const maxStartDate = subHours(endDate, 1);

    // maxStartDate가 minStartDate 이전인 경우 처리 (ex: 종료 시간이 00시인 경우)
    if (isBefore(maxStartDate, minStartDate)) {
      return { min: minStartDate, max: minStartDate };
    }

    return { min: minStartDate, max: maxStartDate };
  } catch (error) {
    logger.error("Error calculating start time constraints:", error, endDate);
    return { min: null, max: null };
  }
};

const calculateEndTimeConstraints = (startDate) => {
  if (!startDate || !isValid(startDate)) {
    return { min: null, max: null };
  }
  try {
    const minEndDate = addHours(startDate, 1);
    const maxEndDate = setHours(startDate, 23);

    // minEndDate가 maxEndDate 이후인 경우 처리 (ex: 시작 시간이 23시인 경우)
    if (isAfter(minEndDate, maxEndDate)) {
      return { min: maxEndDate, max: maxEndDate };
    }

    return { min: minEndDate, max: maxEndDate };
  } catch (error) {
    logger.error("Error calculating end time constraints:", error, startDate);
    return { min: null, max: null };
  }
};

export {
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  dateToUTCISOString,
  formatDateToLocalDateTimeString,
  parseAndAdjustTimeToHour
};

