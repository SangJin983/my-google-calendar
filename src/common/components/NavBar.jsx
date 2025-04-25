import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";

const NavContainer = styled.nav`
  background-color: #f8f9fa;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const NavLink = styled(Link)`
  color: #333;
  padding: 8px 10px;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e9ecef;
  }

  // 현재 경로와 링크 경로가 일치하면 활성 스타일 적용
  ${(props) =>
    props.$active &&
    css`
      background-color: #d0d9e2;
      color: #0056b3;
    `}
`;

const Logo = styled(Link)`
  font-size: 1.5em;
  font-weight: bold;
  color: #007bff;
`;

export const NavBar = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <Logo to="/calendar">My Calendar</Logo>
      <NavLinks>
        <NavLink
          to="/calendar"
          $active={
            location.pathname.startsWith("/calendar") ||
            location.pathname === "/"
          }
        >
          캘린더
        </NavLink>
        <NavLink to="/events/new" $active={location.pathname === "/events/new"}>
          새 이벤트
        </NavLink>
      </NavLinks>
    </NavContainer>
  );
};
