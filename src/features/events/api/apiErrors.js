export class EventNotFoundError extends Error {
  constructor(id) {
    super(`이벤트 ID ${id} 를 발견하지 못 했습니다.`);
    this.name = "EventNotFoundError";
    this.eventId = id;
  }
}
