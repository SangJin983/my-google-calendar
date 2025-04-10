import styled from "styled-components";

const ErrorWrapper = styled.div`
  padding: 10px 15px;
  margin-top: 15px;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`;

export const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return <ErrorWrapper>{message}</ErrorWrapper>;
};
