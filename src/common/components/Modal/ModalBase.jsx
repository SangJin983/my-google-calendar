import { createPortal } from "react-dom";
import styled from "styled-components";
import { useModal } from "./useModal";

const modalRoot = document.getElementById("modal-root") || document.body;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 25px 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 500px;
`;

export const ModalBase = ({
  isOpen,
  onClose,
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const { handleOverlayClick, getDialogProps } = useModal({
    isOpen,
    onClose,
  });

  if (!isOpen || !modalRoot) {
    return null;
  }

  const dialogProps = {
    ...getDialogProps(),
    ...(ariaLabelledBy && { "aria-labelledby": ariaLabelledBy }),
    ...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy }),
  };

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer {...dialogProps}>{children}</ModalContainer>
    </Overlay>,
    modalRoot
  );
};
