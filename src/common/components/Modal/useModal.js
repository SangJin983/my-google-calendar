import { useCallback, useEffect } from "react";

/**
 * 모달의 상태 관리 및 기본 동작(ESC, 배경 클릭 닫기) 로직을 제공하는 Headless 훅
 * @param {object} options
 * @param {boolean} options.isOpen - 모달 열림 상태 (외부에서 제어)
 * @param {() => void} options.onClose - 모달 닫기 요청 함수
 * @returns {{
 *  handleOverlayClick: (event: React.MouseEvent<HTMLDivElement>) => void,
 *  getDialogProps: () => object,
 * }}
 */
export const useModal = ({ isOpen, onClose }) => {
  const handleEsc = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    } else {
      document.removeEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleEsc]);

  const handleOverlayClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const getDialogProps = useCallback(
    () => ({
      role: "dialog",
      "aria-modal": "true",
    }),
    []
  );

  return {
    handleOverlayClick,
    getDialogProps,
  };
};
