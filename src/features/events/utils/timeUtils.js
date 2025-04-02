const formatDateToLocalDateTimeString = (date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  try {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = "00"; // 정각으로 고정

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return "";
  }
};

const adjustTimeToHour = (dateTimeString) => {
  if (!dateTimeString) {
    return "";
  }
  try {
    const [date, time] = dateTimeString.split("T");
    const hour = time?.split(":")[0];

    if (hour === undefined) {
      throw new Error("Invalid time format");
    }

    const adjustedTime = `${date}T${hour.padStart(2, "0")}:00`;

    return adjustedTime;
  } catch (error) {
    console.error("Error adjusting time:", error, dateTimeString)
    return dateTimeString;
  }
};

const calculateStartTimeConstraints = (endDateTimeString) => {
  if (!endDateTimeString) {
    return { min: "", max: "" };
  }
  try {
    const datePart = endDateTimeString.split("T")[0];
    const minStartTimeLocalString = `${datePart}T00:00`;

    const maxStartDate = new Date(endDateTimeString); // 정확한 계산을 위해 Date 객체로 변환
    maxStartDate.setHours(maxStartDate.getHours() - 1);
    const maxStartTimeLocalString =
      formatDateToLocalDateTimeString(maxStartDate);

    // min과 max값 비교(종료시간이 00시와 같이, 날짜가 넘어간 케이스 대비)
    if (maxStartDate < new Date(minStartTimeLocalString)) {
      return { min: minStartTimeLocalString, max: minStartTimeLocalString };
    }

    return { min: minStartTimeLocalString, max: maxStartTimeLocalString };
  } catch {
    return { min: "", max: "" };
  }
};

const calculateEndTimeConstraints = (startDateTimeString) => {
  if (!startDateTimeString) {
    return { min: "", max: "" };
  }
  try {
    const datePart = startDateTimeString.split("T")[0];
    const maxEndTimeLocalString = `${datePart}T23:00`;

    const minEndDate = new Date(startDateTimeString);
    minEndDate.setHours(minEndDate.getHours() + 1);
    const minEndTimeLocalString = formatDateToLocalDateTimeString(minEndDate);

    // 시작시간 23시와 같이 종료시간 날짜가 넘어가는 케이스 대비
    if (minEndDate > new Date(maxEndTimeLocalString)) {
      return { min: maxEndTimeLocalString, max: maxEndTimeLocalString };
    }

    return { min: minEndTimeLocalString, max: maxEndTimeLocalString };
  } catch {
    return { min: "", max: "" };
  }
};

const isTimeBefore = (time1LocalString, time2LocalString) => {
  if (!time1LocalString || !time2LocalString) {
    return false;
  }
  try {
    return new Date(time1LocalString) < new Date(time2LocalString);
  } catch {
    return false;
  }
};

const isTimeAfter = (time1LocalString, time2LocalString) => {
  if (!time1LocalString || !time2LocalString) {
    return false;
  }
  try {
    return new Date(time1LocalString) > new Date(time2LocalString);
  } catch {
    return false;
  }
};

const areSameLocalDateString = (dateTimeString1, dateTimeString2) => {
  if (!dateTimeString1 || !dateTimeString2) {
    return false;
  }
  try {
    return dateTimeString1.split("T")[0] === dateTimeString2.split("T")[0];
  } catch {
    return false;
  }
};

export {
  adjustTimeToHour,
  areSameLocalDateString,
  calculateEndTimeConstraints,
  calculateStartTimeConstraints,
  isTimeBefore,
  isTimeAfter,
};
