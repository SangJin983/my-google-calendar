import { supabase } from "@services/supabaseClient";

const EVENT_DOMAIN = "events";

const executeSupabaseQuery = async (queryPromise) => {
  const { data, error } = await queryPromise;

  if (error) {
    throw error;
  }

  return data;
};

export const fetchEventsApi = async () => {
  const selectAllEvents = supabase.from(EVENT_DOMAIN).select("*");
  return await executeSupabaseQuery(selectAllEvents);
};

export const fetchEventByIdApi = async (id) => {
  const selectSingleEvent = supabase
    .from(EVENT_DOMAIN)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return await executeSupabaseQuery(selectSingleEvent);
};

export const createEventApi = async (eventData) => {
  const createEvent = supabase.from(EVENT_DOMAIN).insert(eventData);
  return await executeSupabaseQuery(createEvent);
};

export const updateEventApi = async ({ id, updates }) => {
  const updateEvent = supabase.from(EVENT_DOMAIN).update(updates).eq("id", id);
  return await executeSupabaseQuery(updateEvent);
};

export const deleteEventApi = async (id) => {
  const deleteEvent = supabase.from(EVENT_DOMAIN).delete().eq("id", id);
  return await executeSupabaseQuery(deleteEvent);
};
