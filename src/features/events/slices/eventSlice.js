import { STATUS } from "@common/constants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createEventApi,
  deleteEventApi,
  fetchEventsApi,
  updateEventApi,
} from "../api/eventApi";

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const data = await fetchEventsApi();
  return data;
});
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData, { dispatch }) => {
    await createEventApi(eventData);
    dispatch(fetchEvents()); // 서버와 클라이언트 동기화 요청
  }
);
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, updates }, { dispatch }) => {
    await updateEventApi({ id, updates });
    dispatch(fetchEvents());
  }
);
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { dispatch }) => {
    await deleteEventApi(id);
    dispatch(fetchEvents());
  }
);

const initialState = {
  ids: [],
  entities: {},
  status: STATUS.IDLE,
  error: null,
};

const setPendingStatus = (state) => {
  state.status = STATUS.LOADING;
  state.error = null; // 에러 메세지 초기화
};
const setSuccessStatus = (state) => {
  state.status = STATUS.SUCCEEDED;
  state.error = null;
};
const setFailedStatus = (state, action) => {
  state.status = STATUS.FAILED;
  state.error = action.error.message;
};
const setIdleStatus = (state) => {
  state.status = STATUS.IDLE;
  state.error = null;
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    resetEventStatus: setIdleStatus,
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents 액션 처리
      .addCase(fetchEvents.pending, setPendingStatus)
      .addCase(fetchEvents.fulfilled, (state, action) => {
        setSuccessStatus(state);
        // 데이터를 정규화 상태에 맞게 초기화
        state.ids = [];
        state.entities = {};
        // 데이터 저장
        action.payload.forEach((event) => {
          state.ids.push(event.id);
          state.entities[event.id] = event;
        });
      })
      .addCase(fetchEvents.rejected, setFailedStatus)
      // createEvent 액션 처리
      .addCase(createEvent.pending, setPendingStatus)
      .addCase(createEvent.fulfilled, setSuccessStatus)
      .addCase(createEvent.rejected, setFailedStatus)
      // updateEvent 액션 처리
      .addCase(updateEvent.pending, setPendingStatus)
      .addCase(updateEvent.fulfilled, setSuccessStatus)
      .addCase(updateEvent.rejected, setFailedStatus)
      // deleteEvent 액션 처리
      .addCase(deleteEvent.pending, setPendingStatus)
      .addCase(deleteEvent.fulfilled, setSuccessStatus)
      .addCase(deleteEvent.rejected, setFailedStatus);
  },
});

export const { resetEventStatus } = eventSlice.actions;
export default eventSlice.reducer;
