import { useId } from "react";
import styled from "styled-components";
import { ModalBase } from "./ModalBase";

const ConfirmModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
  color: #333;
`;

const ConfirmModalMessage = styled.p`
  margin-bottom: 25px;
  color: #555;
  line-height: 1.5;
`;

const ConfirmModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &.confirm {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
    &:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
  }
  &.cancel {
    background-color: #f8f9fa;
    &:hover {
      background-color: #e2e6ea;
    }
  }
`;

/**
 * @param {object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {() => void} props.onClose - 모달 닫기 요청 함수 (취소 버튼, ESC, 배경 클릭 시 호출됨)
 * @param {() => void} prpos.onConfirm - 확인 버튼 클릭 시 실행될 함수
 * @param {string} [props.title="확인"] - 모달 제목
 * @param {string} props.message - 모달 본문 메시지
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "확인",
  message,
}) => {
  const handleConfirmClick = () => {
    onConfirm();
  };

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const messageId = `${baseId}-message`;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      ariaDescribedBy={messageId}
    >
      <ConfirmModalHeader id={titleId}>{title}</ConfirmModalHeader>
      <ConfirmModalMessage id={messageId}>{message}</ConfirmModalMessage>
      <ConfirmModalFooter>
        <ConfirmButton className="cancel" onClick={onClose}>
          취소
        </ConfirmButton>
        <ConfirmButton className="confirm" onClick={handleConfirmClick}>
          확인
        </ConfirmButton>
      </ConfirmModalFooter>
    </ModalBase>
  );
};
