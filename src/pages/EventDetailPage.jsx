import { ErrorMessage } from "@common/components";
import { UUID_REGEX } from "@common/constants";
import { Err, isOk, logger, Ok } from "@common/utils";
import { EventNotFoundError, fetchEventByIdApi } from "@features/events";
import { format, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

const DetailContainer = styled.div`
  padding: 30px;
  max-width: 700px;
  margin: 20px auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  font-size: 1.2em;
  color: #666;
`;
const EventHeader = styled.h1`
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;
const InfoSection = styled.div`
  margin-bottom: 15px;
  line-height: 1.6;

  strong {
    display: inline-block;
    width: 80px;
    color: #555;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &.delete {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
    &:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
  }
`;

const formatEventTimeKST = (timeString) => {
  if (!timeString) {
    return Err(new Error("시간 정보 없음"));
  }
  try {
    const date = parseISO(timeString);
    if (!isValid(date)) {
      return Err(new Error("유효하지 않은 날짜 형식입니다."));
    }
    const formattedEventTime = format(date, "yyyy년 M월 d일 HH:mm", {
      locale: ko,
    });
    return Ok(formattedEventTime);
  } catch (error) {
    logger.error("포맷팅이 실패했습니다.", error);
    return Err(new Error("시간을 표시하는 중 오류가 발생했습니다."));
  }
};

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const eventFromStore = useSelector((state) => state.events.entities[eventId]);

  const [displayEvent, setDisplayEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleEditClick = () => {
    navigate(`/events/${eventId}/edit`);
  };

  useEffect(() => {
    if (!eventId || !UUID_REGEX.test(eventId)) {
      logger.warn(`[EventDetailPage] Invalid UUID format received: ${eventId}`);
      setError("유효하지 않은 이벤트 ID 형식입니다.");
      setIsLoading(false);
      setDisplayEvent(null);
      return;
    }

    // 스토어에 이벤트가 있는지 확인
    if (eventFromStore) {
      setDisplayEvent(eventFromStore);
      setIsLoading(false);
      return;
    }

    const fetchMissingEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchEventByIdApi(eventId);
        if (data === null) {
          throw new EventNotFoundError(eventId);
        }
        setDisplayEvent(data);
      } catch (error) {
        if (error instanceof EventNotFoundError) {
          setError(error.message);
        } else {
          logger.error(
            `[EventDetailPage] Event ID ${eventId} 를 불러오는 것을 실패했습니다:`,
            error
          );
          setError(`이벤트를 불러오는 중 오류가 발생했습니다`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingEvent();
  }, [eventId, eventFromStore]);

  if (isLoading) {
    return <LoadingSpinner>이벤트 정보 로딩 중...</LoadingSpinner>;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }
  if (!displayEvent) {
    logger.warn(
      "[EventDetailPage] Rendering with no event data after loading/error handling."
    );
    return <ErrorMessage message={"이벤트 정보를 표시할 수 없습니다"} />;
  }

  const startTimeResult = formatEventTimeKST(displayEvent.start_time);
  const endTimeResult = formatEventTimeKST(displayEvent.end_time);

  return (
    <DetailContainer>
      <EventHeader>{displayEvent.title}</EventHeader>
      <InfoSection>
        <strong>설명:</strong>
        <span>{displayEvent.description || ""}</span>
      </InfoSection>
      <InfoSection>
        <strong>시작:</strong>
        <span>
          {isOk(startTimeResult)
            ? startTimeResult.value
            : startTimeResult.error.message}
        </span>
      </InfoSection>
      <InfoSection>
        <strong>종료:</strong>
        <span>
          {isOk(endTimeResult)
            ? endTimeResult.value
            : endTimeResult.error.message}
        </span>
      </InfoSection>
      <ButtonContainer>
        <Button onClick={handleEditClick}>수정</Button>
        <Button className="delete" onClick={() => alert("삭제 기능 구현 예정")}>
          삭제
        </Button>
      </ButtonContainer>
    </DetailContainer>
  );
};

export default EventDetailPage;
