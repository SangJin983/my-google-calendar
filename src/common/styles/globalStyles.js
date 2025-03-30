import { createGlobalStyle } from "styled-components";
import normalize from "styled-normalize";

const GlobalStyle = createGlobalStyle`
  ${normalize} // Normalize CSS 적용

  *,
  *::before,
  *::after {
    box-sizing: border-box; // 보다 정확한 높이와 너비를 위한 전역 box-sizing 설정
  }
`;

export default GlobalStyle;
