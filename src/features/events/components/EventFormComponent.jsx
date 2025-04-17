import { useState } from "react";
import styled from "styled-components";
import { useEventTimeInput } from "../hooks/useEventTimeInput";

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 16px;
  height: 150px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const EventFormComponent = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const {
    startTime,
    endTime,
    startTimeConstraints,
    endTimeConstraints,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventTimeInput();

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    // prettier-ignore
    onSubmit?.({ title, description, startTime, endTime }); // Optional Chaining 사용
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">이벤트 제목</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="이벤트 제목을 입력하세요"
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">이벤트 설명 (선택)</Label>
        <Textarea
          id={"description"}
          value={description}
          onChange={handleDescriptionChange}
          placeholder="이벤트 설명을 입력하세요 (선택사항)"
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="startTime">시작 시간</Label>
        <Input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={handleStartTimeChange}
          step={3600}
          min={startTimeConstraints.min}
          max={startTimeConstraints.max}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="endTime">종료 시간</Label>
        <Input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={handleEndTimeChange}
          step={3600}
          min={endTimeConstraints.min}
          max={endTimeConstraints.max}
          disabled={isLoading}
        />
      </FormGroup>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? "저장 중..." : "이벤트 저장"}
      </SubmitButton>
    </FormContainer>
  );
};

export default EventFormComponent;
