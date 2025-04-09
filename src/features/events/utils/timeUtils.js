import { Err, logger, Ok } from "@common/utils";
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

// -- 커스텀 에러 정의 --
class InvalidDateFormatError extends Error {
  constructor(message = "Invalid date format") {
    super(message);
    this.name = "InvaildDateFormatError";
  }
}
class DateCalculationError extends Error {
  constructor(message = "Date calculation error") {
    super(message);
    this.name = "DateCalculationError";
  }
}

const LOCAL_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

// 현지 시간 문자열 -> Date 객체 변환 및 정시 처리
const parseAndAdjustTimeToHour = (dateTimeString) => {
  if (!dateTimeString) {
    return Err(new Error("Input string is empty"));
  }
  try {
    // 'yyyy-MM-ddTHH:mm' 형식으로 파싱 시도
    const parsedDate = parse(dateTimeString, LOCAL_DATETIME_FORMAT, new Date());
    // 유효한 날짜인지 확인
    if (!isValid(parsedDate)) {
      return Err(new InvalidDateFormatError());
    }
    // Date에 정시처리
    return Ok(startOfHour(parsedDate));
  } catch (error) {
    logger.error("Unexpected error parsing date time:", error, dateTimeString);
    return Err(
      error instanceof Error ? error : new Error("Unknown parsing error")
    );
  }
};

// Date 객체 -> 현지 시간 문자열 (YYYY-MM-DDTHH:mm) 변환
const formatDateToLocalDateTimeString = (date) => {
  if (!date || !isValid(date)) {
    return Err(new Error("Invalid Date object provided"));
  }
  try {
    return Ok(format(date, LOCAL_DATETIME_FORMAT));
  } catch (error) {
    logger.error("Error formating date to local string:", error, date);
    return Err(
      error instanceof Error ? error : new Error("Unknown formatting error")
    );
  }
};

const dateToUTCISOString = (date) => {
  if (!date || !isValid(date)) {
    return Err(new Error("Invalid Date object provided"));
  }
  try {
    return Ok(date.toISOString());
  } catch (error) {
    logger.error("Error converting date to UTC ISO string:", error, date);
    return Err(
      error instanceof Error ? error : new Error("Unknown conversion error")
    );
  }
};

const calculateStartTimeConstraints = (endDate) => {
  if (!endDate || !isValid(endDate)) {
    return Err(new Error("Invalid end date provided"));
  }
  try {
    const minStartDate = startOfDay(endDate);
    const maxStartDate = subHours(endDate, 1);

    // maxStartDate가 minStartDate 이전인 경우 처리 (ex: 종료 시간이 00시인 경우)
    if (isBefore(maxStartDate, minStartDate)) {
      return Ok({ min: minStartDate, max: minStartDate });
    }
    return Ok({ min: minStartDate, max: maxStartDate });
  } catch (error) {
    logger.error("Error calculating start time constraints:", error, endDate);
    return Err(
      new DateCalculationError("Failed to calculate start constraints")
    );
  }
};

const calculateEndTimeConstraints = (startDate) => {
  if (!startDate || !isValid(startDate)) {
    return Err(new Error("Invalid start date provided"));
  }
  try {
    const minEndDate = addHours(startDate, 1);
    const maxEndDate = setHours(startDate, 23);

    // minEndDate가 maxEndDate 이후인 경우 처리 (ex: 시작 시간이 23시인 경우)
    if (isAfter(minEndDate, maxEndDate)) {
      return Ok({ min: maxEndDate, max: maxEndDate });
    }

    return Ok({ min: minEndDate, max: maxEndDate });
  } catch (error) {
    logger.error("Error calculating end time constraints:", error, startDate);
    return Err(new DateCalculationError("Failed to calculate end constraints"));
  }
};

export {
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  DateCalculationError,
  dateToUTCISOString,
  formatDateToLocalDateTimeString,
  InvalidDateFormatError,
  parseAndAdjustTimeToHour,
};
