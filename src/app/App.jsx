import { NavBar } from "@common/components";
import CalendarPage from "@pages/CalendarPage";
import EventDetailPage from "@pages/EventDetailPage";
import EventFormPage from "@pages/EventFormPage";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; // 화면을 꽉 채움
`;

const ContentContainer = styled.main`
  flex-grow: 1;
  overflow-y: auto; // 넘칠 때만 세로 스크롤 바
`;

function App() {
  return (
    <AppContainer>
      <NavBar />
      <ContentContainer>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/events/new" element={<EventFormPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
