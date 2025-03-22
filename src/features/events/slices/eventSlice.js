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
  async (eventData) => {
    const data = await createEventApi(eventData);
    return data;
  }
);
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, updates }) => {
    const data = await updateEventApi({ id, updates });
    return data;
  }
);
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id) => {
    await deleteEventApi(id);
    return id;
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

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
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
      .addCase(createEvent.fulfilled, (state, action) => {
        setSuccessStatus(state);
        const newEvent = action.payload[0];
        state.ids.push(newEvent.id);
        state.entities[newEvent.id] = newEvent;
      })
      .addCase(createEvent.rejected, setFailedStatus)
      // updateEvent 액션 처리
      .addCase(updateEvent.pending, setPendingStatus)
      .addCase(updateEvent.fulfilled, (state, action) => {
        setSuccessStatus(state);
        const updatedEvent = action.payload[0];
        state.entities[updatedEvent.id] = updatedEvent;
      })
      .addCase(updateEvent.rejected, setFailedStatus)
      // deleteEvent 액션 처리
      .addCase(deleteEvent.pending, setPendingStatus)
      .addCase(deleteEvent.fulfilled, (state, action) => {
        setSuccessStatus(state);
        const deletedId = action.payload;
        state.ids.filter((id) => id !== deletedId);
        delete state.entities[deletedId];
      })
      .addCase(deleteEvent.rejected, setFailedStatus);
  },
});

export default eventSlice.reducer;
