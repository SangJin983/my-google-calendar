import { ConfirmModal, ErrorMessage } from "@common/components";
import { STATUS, UUID_REGEX } from "@common/constants";
import { Err, isOk, logger, Ok } from "@common/utils";
import {
  deleteEvent,
  EventNotFoundError,
  fetchEventByIdApi,
  resetEventStatus,
} from "@features/events";
import { format, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();

  const eventFromStore = useSelector((state) => state.events.entities[eventId]);
  const eventDeleteStatus = useSelector((state) => state.events.status);
  const eventDeleteError = useSelector((state) => state.events.error);

  const [displayEvent, setDisplayEvent] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isDeleting = eventDeleteStatus === STATUS.LOADING;

  const handleEditClick = () => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleDeleteClick = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);
  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);
    logger.info(`[EventDetailPage] Dispatching deleteEvent for ID: ${eventId}`);

    dispatch(deleteEvent(eventId));
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !UUID_REGEX.test(eventId)) {
      logger.warn(`[EventDetailPage] Invalid UUID format received: ${eventId}`);
      setLoadError("유효하지 않은 이벤트 ID 형식입니다.");
      setIsLoadingData(false);
      setDisplayEvent(null);
      return;
    }

    // 스토어에 이벤트가 있는지 확인
    if (eventFromStore) {
      setDisplayEvent(eventFromStore);
      setIsLoadingData(false);
      return;
    }

    const fetchMissingEvent = async () => {
      setIsLoadingData(true);
      setLoadError(null);

      try {
        const data = await fetchEventByIdApi(eventId);
        if (data === null) {
          throw new EventNotFoundError(eventId);
        }
        setDisplayEvent(data);
      } catch (error) {
        if (error instanceof EventNotFoundError) {
          setLoadError(error.message);
        } else {
          logger.error(
            `[EventDetailPage] Event ID ${eventId} 를 불러오는 것을 실패했습니다:`,
            error
          );
          setLoadError(`이벤트를 불러오는 중 오류가 발생했습니다`);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMissingEvent();
  }, [eventId, eventFromStore]);

  useEffect(() => {
    if (eventDeleteStatus === STATUS.SUCCEEDED) {
      dispatch(resetEventStatus());
      navigate("/calendar", { replace: true });
    }
    if (eventDeleteStatus === STATUS.FAILED && eventDeleteError) {
      logger.error(
        `[EventDetailPage] Failed to delete event ${eventId}:`,
        eventDeleteError
      );
    }

    return () => {
      if (eventDeleteStatus === STATUS.FAILED) {
        dispatch(resetEventStatus());
      }
    };
  }, [eventDeleteStatus]);

  if (isLoadingData) {
    return <LoadingSpinner>이벤트 정보 로딩 중...</LoadingSpinner>;
  }
  if (loadError) {
    return <ErrorMessage message={loadError} />;
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
    <>
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
          <Button onClick={handleEditClick} disabled={isDeleting}>
            수정
          </Button>
          <Button
            className="delete"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </ButtonContainer>
          {eventDeleteError && <ErrorMessage message={eventDeleteError} />}
      </DetailContainer>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="이벤트 삭제 확인"
        message={`${displayEvent.title} 이벤트를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  );
};

export default EventDetailPage;
