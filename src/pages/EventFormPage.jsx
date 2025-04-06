import { ErrorMessage } from "@common/components";
import { STATUS } from "@common/constants";
import { logger } from "@common/utils";
import { createEvent, EventFormComponent } from "@features/events";
import { resetEventStatus } from "@features/events/slices/eventSlice";
import {
  dateToUTCISOString,
  parseAndAdjustTimeToHour,
} from "@features/events/utils/timeUtils";
import { differenceInHours, isSameDay, isValid } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EventFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.events.status);
  const reduxError = useSelector((state) => state.events.error);
  const [formError, setFormError] = useState(null);

  const isSubmitting = status === STATUS.LOADING;
  const validateEventData = ({ title, startTime, endTime }) => {
    if (!title) {
      return { error: "이벤트 제목을 입력해주세요." };
    }

    const startDate = parseAndAdjustTimeToHour(startTime);
    const endDate = parseAndAdjustTimeToHour(endTime);

    if (!startTime || !isValid(startDate)) {
      return { error: "시작 시간을 선택해주세요." };
    }
    if (!endTime || !isValid(endDate)) {
      return { error: "종료 시간을 선택해주세요." };
    }
    if (!isSameDay(startDate, endDate)) {
      return { error: "시작 날짜와 종료 날짜는 같아야 합니다." };
    }
    if (differenceInHours(endDate, startDate) < 1) {
      return { error: "종료 시간은 시작 시간보다 최소 1시간 이후여야 합니다." };
    }

    return { error: null, startDate, endDate };
  };

  const handleSubmit = (eventDataFromForm) => {
    setFormError(null);

    const {
      error: validationError,
      startDate,
      endDate,
    } = validateEventData(eventDataFromForm);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const eventDataForApi = {
      title: eventDataFromForm.title,
      description: eventDataFromForm.description,
      start_time: dateToUTCISOString(startDate),
      end_time: dateToUTCISOString(endDate),
    };

    if (!eventDataForApi.start_time || !eventDataForApi.end_time) {
      setFormError("시간 변환 중 오류가 발생했습니다.");
      return;
    }

    dispatch(createEvent(eventDataForApi));
  };

  useEffect(() => {
    let didNavigate = false;

    if (status === STATUS.SUCCEEDED) {
      didNavigate = true;
      navigate("/calendar", { replace: true });
    } else if (status === STATUS.FAILED && reduxError) {
      setFormError(reduxError);
    }

    return () => {
      if (status === STATUS.SUCCEEDED || status === STATUS.FAILED) {
        logger.debug("resetEventStatus 동작확인");
        dispatch(resetEventStatus());
      }
    };
  }, [status, reduxError]);

  return (
    <>
      <h1>Create New Event</h1>
      <EventFormComponent onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      <ErrorMessage message={formError} />
    </>
  );
};

export default EventFormPage;
