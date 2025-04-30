import { ErrorMessage } from "@common/components";
import { isErr, logger } from "@common/utils";
import {
  createEvent,
  dateToUTCISOString,
  EventFormComponent,
  validateEventData,
} from "@features/events";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const EventFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
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
            : "시간 변환 중 오류가 발생했습니다."
        );
      }

      const eventDataForApi = {
        title: formData.title,
        description: formData.description || "",
        start_time: startTimeUTCResult.value,
        end_time: endTimeUTCResult.value,
      };

      logger.info("[EventFormPage] Dispatching createEvent:", eventDataForApi);
      await dispatch(createEvent(eventDataForApi)).unwrap();

      logger.info("[EventFormPage] Event created successfully.");
      navigate("/calendar", { replace: true });
    } catch (error) {
      logger.error("[EventFormPage] Failed to create event:", error);
      setSubmitError(error.message || "이벤트 생성 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <h1>Create New Event</h1>
      <EventFormComponent onSubmit={handleSubmit} isLoading={isSubmitting} />
      <ErrorMessage message={submitError} />
    </>
  );
};

export default EventFormPage;
