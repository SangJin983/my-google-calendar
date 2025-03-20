import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@services/supabaseClient";

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const { data, error } = await supabase.from("events").select("*");

  if (error) {
    throw error;
  }

  return data;
});

const initialState = {
  ids: [],
  entities: {},
  status: "idle",
  error: null,
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 데이터를 정규화 상태에 맞게 초기화
        state.ids = [];
        state.entities = {};
        // 데이터 저장
        action.payload.forEach((event) => {
          state.ids.push(event.id);
          state.entities[event.id] = event;
        });
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default eventSlice.reducer;
