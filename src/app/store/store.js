import { eventsReducer } from "@features/events";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({ reducer: { events: eventsReducer } });

export default store;
