export const HOURS_IN_DAY = Array.from({ length: 24 }, (_, i) => i); // 0부터 23
export const HOUR_HEIGHT = 50; // 시간 슬롯 높이 (px)
export const AXIS_WIDTH = 60; // 시간 축 너비 (px)
export const DATE_AXIS_HEIGHT = 30; // 날짜 축 높이 (px)
export const TOTAL_CALENDAR_HEIGHT = HOUR_HEIGHT * HOURS_IN_DAY.length;

export const USER_TIME_ZONE = "Asia/Seoul";

export const DAY_VIEW_EVENT_LEFT = '5%';
export const DAY_VIEW_EVENT_WIDTH = '90%';