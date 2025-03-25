import { supabase } from "@services/supabaseClient";

const EVENT_DOMAIN = "events";

const executeSupabaseOperation = async (operationPromise) => {
  const { data, error } = await operationPromise;

  if (error) {
    throw error;
  }

  return data;
};

export const fetchEventsApi = async () => {
  const selectAllEvents = supabase.from(EVENT_DOMAIN).select("*");
  return await executeSupabaseOperation(selectAllEvents);
};

export const createEventApi = async (eventData) => {
  const createEvent = supabase.from(EVENT_DOMAIN).insert(eventData);
  return await executeSupabaseOperation(createEvent);
};

export const updateEventApi = async ({ id, updates }) => {
  const updateEvent = supabase.from(EVENT_DOMAIN).update(updates).eq("id", id);
  return await executeSupabaseOperation(updateEvent);
};

export const deleteEventApi = async (id) => {
  const deleteEvent = supabase.from(EVENT_DOMAIN).delete().eq("id", id);
  return await executeSupabaseOperation(deleteEvent);
};
