import { ErrorMessage } from "@common/components";
import { UUID_REGEX } from "@common/constants";
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

const prepareInitialFormData = (eventData) => {
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

  const [initialFormData, setInitialFormData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!eventId || !UUID_REGEX.test(eventId)) {
      setLoadError("유효하지 않은 이벤트 ID 형식입니다.");
      setInitialFormData(null);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setLoadError(null);
    setSubmitError(null);

    const loadAndSetInitialData = async () => {
      try {
        let eventToFormat = eventFromStore;
        if (!eventToFormat) {
          logger.warn(
            `[EventEditPage] Event ${eventId} not found in store. Fetching from API`
          );
          eventToFormat = await fetchEventByIdApi(eventId);
          if (eventToFormat === null) {
            throw new EventNotFoundError(eventId);
          }
        }

        const formDataResult = prepareInitialFormData(eventToFormat);
        if (isErr(formDataResult)) {
          throw formDataResult.error;
        }
        setInitialFormData(formDataResult.value);
      } catch (error) {
        logger.error(
          `[EventEditPage] Failed to load initial data for ${eventId}:`,
          error
        );
        setLoadError(
          error.message || "데이터 로딩 또는 변환 중에 오류가 발생했습니다"
        );
        setInitialFormData(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAndSetInitialData();
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
      setIsSubmitting(true);

      try {
        const { startDate, endDate } = validationResult.value;
        const startTimeUTCResult = dateToUTCISOString(startDate);
        const endTimeUTCResult = dateToUTCISOString(endDate);

        if (isErr(startTimeUTCResult) || isErr(endTimeUTCResult)) {
          const conversionError = isErr(startTimeUTCResult)
            ? startTimeUTCResult.error
            : endTimeUTCResult.error;
          throw new Error(
            conversionError instanceof Error
              ? conversionError.message
              : "시간 변환 중 오류가 발생했습니다"
          );
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
        await dispatch(updateEvent({ id: eventId, updates })).unwrap();

        logger.info(`[EventEditPage] Event ${eventId} updated successfully.`);
        dispatch(resetEventStatus());
        navigate(`/events/${eventId}`, { replace: true });
      } catch (error) {
        logger.error(
          `[EventEditPage] Failed to update event ${eventId}:`,
          error
        );
        setSubmitError(error.message || "이벤트 수정 중 오류가 발생했습니다");
        dispatch(resetEventStatus());
      } finally {
        setIsSubmitting(false);
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
  if (!initialFormData) {
    return <ErrorMessage message="이벤트 데이터를 표시할 수 없습니다." />;
  }

  return (
    <>
      <EventFormComponent
        onSubmit={handleUpadateSubmit}
        isLoading={isSubmitting}
        initialData={initialFormData}
      />
      <ErrorMessage message={submitError} />
    </>
  );
};
