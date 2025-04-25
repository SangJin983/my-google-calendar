import { ErrorMessage } from "@common/components";
import { STATUS } from "@common/constants";
import { isErr, logger } from "@common/utils";
import {
  createEvent,
  dateToUTCISOString,
  EventFormComponent,
  resetEventStatus,
  validateEventData
} from "@features/events";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EventFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.events.status);
  const reduxError = useSelector((state) => state.events.error);
  const [formError, setFormError] = useState(null);
  const prevStatusRef = useRef(status);

  const isLoading = status === STATUS.LOADING;

  const handleSubmit = (eventDataFromForm) => {
    setFormError(null);

    // 유효성 검사 수행 및 Result 처리
    const validationResult = validateEventData(eventDataFromForm);
    if (isErr(validationResult)) {
      setFormError(
        validationResult.error instanceof Error
          ? validationResult.error.message
          : validationResult.error
      );
      return;
    }
    // API 에 데이터 전송을 하기위한 Date 객체 추출 및 UTC 변환
    const { startDate, endDate } = validationResult.value;
    const startTimeUTCResult = dateToUTCISOString(startDate);
    const endTimeUTCResult = dateToUTCISOString(endDate);

    if (isErr(startTimeUTCResult) || isErr(endTimeUTCResult)) {
      // 변환 실패시 처리
      const conversionError = isErr(startTimeUTCResult)
        ? startTimeUTCResult.error
        : endTimeUTCResult.error;
      setFormError(
        conversionError instanceof Error
          ? conversionError.message
          : "시간 변환 중 오류가 발생했습니다."
      );
      return;
    }
    // 성공 시
    const eventDataForApi = {
      title: eventDataFromForm.title,
      description: eventDataFromForm.description || "",
      start_time: startTimeUTCResult.value,
      end_time: endTimeUTCResult.value,
    };

    dispatch(createEvent(eventDataForApi));
  };

  useEffect(() => {
    // status가 변경 될 때만 처리
    if (prevStatusRef.current !== status) {
      logger.debug(`Status changed: ${prevStatusRef.current} -> ${status}`);

      if (status === STATUS.SUCCEEDED) {
        logger.info(
          "이벤트 생성 성공. calendar 페이지로 이동하고 status를 리셋 합니다."
        );
        navigate("/calendar", { replace: true });
        dispatch(resetEventStatus());
      }
      if (status === STATUS.FAILED && reduxError) {
        logger.warn("이벤트 생성 실패:", reduxError);
        setFormError(reduxError);
        dispatch(resetEventStatus()); // 실패 시에도 Redux 상태 초기화
      }
    }

    prevStatusRef.current = status; // 다음 렌더링 시 비교하기 위해 status를 저장
  }, [status, reduxError]);

  return (
    <>
      <h1>Create New Event</h1>
      <EventFormComponent onSubmit={handleSubmit} isLoading={isLoading} />
      <ErrorMessage message={formError} />
    </>
  );
};

export default EventFormPage;
