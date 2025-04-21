import { ErrorMessage } from "@common/components";
import { STATUS, UUID_REGEX } from "@common/constants";
import { Err, isErr, logger, Ok } from "@common/utils";
import {
  convertUtcToLocalDateTimeString,
  dateToUTCISOString,
  EventFormComponent,
  EventNotFoundError,
  fetchEventByIdApi,
  resetEventStatus,
  updateEvent,
  validateEventData,
} from "@features/events";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  font-size: 1.2em;
  color: #666;
`;

const formatEventDataForForm = (eventData) => {
  const startTimeLocalResult = convertUtcToLocalDateTimeString(
    eventData.start_time
  );
  const endTimeLocalResult = convertUtcToLocalDateTimeString(
    eventData.end_time
  );

  if (isErr(startTimeLocalResult) || isErr(endTimeLocalResult)) {
    const conversionError = isErr(startTimeLocalResult)
      ? startTimeLocalResult.error
      : endTimeLocalResult.error;
    return Err(conversionError);
  }

  return Ok({
    title: eventData.title,
    description: eventData.description,
    startTime: startTimeLocalResult.value,
    endTime: endTimeLocalResult.value,
  });
};

export const EventEditPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const eventFromStore = useSelector((state) => state.events.entities[eventId]);
  const updateStatus = useSelector((state) => state.events.status);

  const [initialEventFormData, setInitialEventFormData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const isUpdating = updateStatus === STATUS.LOADING;

  useEffect(() => {
    if (!eventId || !UUID_REGEX.test(eventId)) {
      logger.warn(`[EventEditPage] Invalid UUID format received: ${eventId}`);
      setLoadError("유효하지 않은 이벤트 ID 형식입니다.");
      setInitialEventFormData(null);
      setIsLoadingData(false);
      return;
    }

    logger.info(
      `[EventEditPage] Effect for ID: ${eventId}. Checking stroe first.`
    );
    setIsLoadingData(true);
    setLoadError(null);
    setSubmitError(null);

    if (eventFromStore) {
      const formDataResult = formatEventDataForForm(eventFromStore);

      if (isErr(formDataResult)) {
        setLoadError(
          formDataResult.error instanceof Error
            ? formDataResult.error.message
            : formDataResult.error
        );
        setIsLoadingData(false);
        return;
      }

      setInitialEventFormData(formDataResult.value);
      setIsLoadingData(false);
      return;
    }

    logger.warn(
      `[EventEditPage] Event ${eventId} not found in store. Fetching from API`
    );
    const fetchInitialData = async () => {
      try {
        const data = await fetchEventByIdApi(eventId);
        if (data === null) {
          throw new EventNotFoundError(eventId);
        }
        const formDataResult = formatEventDataForForm(data);
        if (isErr(formDataResult)) {
          throw formDataResult.error;
        }

        setInitialEventFormData(formDataResult.value);
      } catch (error) {
        logger.error(
          `[EventEditPage] Failed to load initial data for ${eventId}:`,
          error
        );
        if (error instanceof EventNotFoundError) {
          setLoadError(error.message);
        } else {
          setLoadError(error instanceof Error ? error.message : error);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, [eventId, eventFromStore]);

  const handleUpadateSubmit = useCallback(
    async (formData) => {
      const validationResult = validateEventData(formData);
      if (isErr(validationResult)) {
        setSubmitError(
          validationResult.error instanceof Error
            ? validationResult.error.message
            : validationResult.error
        );
        return;
      }

      setSubmitError(null);

      try {
        const { startDate, endDate } = validationResult.value;
        const startTimeUTCResult = dateToUTCISOString(startDate);
        const endTimeUTCResult = dateToUTCISOString(endDate);

        if (isErr(startTimeUTCResult) || isErr(endTimeUTCResult)) {
          const conversionError = isErr(startTimeUTCResult)
            ? startTimeUTCResult.error
            : endTimeUTCResult.error;
          setSubmitError(
            conversionError instanceof Error
              ? conversionError.message
              : "시간 변환 중 오류가 발생했습니다."
          );
          return;
        }

        const updates = {
          title: formData.title,
          description: formData.description || "",
          start_time: startTimeUTCResult.value,
          end_time: endTimeUTCResult.value,
        };

        logger.info(
          `[EventEditPage] Dispatching updateEvent for ID: ${eventId}`
        );
        await dispatch(updateEvent({ id: eventId, updates })).unwrap(); // 성공시 바로 처리하기 위함

        logger.info(`[EventEditPage] Event ${eventId} updated successfully.`);
        dispatch(resetEventStatus());
        navigate(`/events/${eventId}`, { replace: true });
      } catch (error) {
        logger.error(
          `[EventEditPage] Failed to update event ${eventId}:`,
          error
        );
        setSubmitError(error.message);
        dispatch(resetEventStatus());
      }
    },
    [eventId]
  );

  if (isLoadingData) {
    return <LoadingSpinner>이벤트 정보 로딩 중...</LoadingSpinner>;
  }
  if (loadError) {
    return <ErrorMessage message={loadError} />;
  }

  return (
    <>
      <EventFormComponent
        onSubmit={handleUpadateSubmit}
        isLoading={isUpdating}
        initialData={initialEventFormData}
      />
      <ErrorMessage message={submitError} />
    </>
  );
};
