import CalendarPage from "@pages/CalendarPage";
import EventDetailPage from "@pages/EventDetailPage";
import { EventEditPage } from "@pages/EventEditPage";
import EventFormPage from "@pages/EventFormPage";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/events/new" element={<EventFormPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/events/:eventId/edit" element={<EventEditPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
