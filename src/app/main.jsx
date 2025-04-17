import GlobalStyle from "@common/styles/globalStyles.js";
import { consoleLogHandler } from "@common/utils/index.js";
import { createLogger } from "@common/utils/logger/logger.js";
import { getLoggerLevel } from "@config/loggerConfig.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./store/store.js";

// --- 로거 설정 및 초기화 ---
const logLevel = getLoggerLevel();
createLogger({ level: logLevel, handler: consoleLogHandler });

// --- 애플리케이션 렌더링 ---
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <GlobalStyle />
        <App />
      </BrowserRouter>
    </ReduxProvider>
  </StrictMode>
);
