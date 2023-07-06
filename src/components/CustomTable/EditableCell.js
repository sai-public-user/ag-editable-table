import React, {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FloatingLabel, Form, InputGroup, Row } from "react-bootstrap";
import { TableContext } from "./TableContext";

const EditableCell = forwardRef(
  (
    {
      label = "Edit",
      onUpdate = () => {},
      type = "text",
      showLabel = false,
      helperText = null,
      id = "editable-table-cell",
      formProps = {},
      floatingLabel = false,
      prependText = null,
      postpendText = null,
      isValid = () => true,
      errorMsg = "Please enter proper value",
      hasEdit = true,
      ...restProps
    },
    ref
  ) => {
    const data = useContext(TableContext);
    console.log("rest props ==> ", restProps, data);
    const [editable, setEditable] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [value, setValue] = useState(restProps.value);

    const { column, data: rowData, rowIndex } = restProps;

    const uniqueId = useMemo(
      () => `${id}_${column.colId}_${rowIndex}`,
      [id, column.colId, rowIndex]
    );

    const handleChange = useCallback(
      ({ target: { value } }) => {
        if (isValid(rowData, value)) {
          setInvalid(false);
          onUpdate(value);
          setEditable(false);
        } else {
          setInvalid(true);
        }
      },
      [onUpdate, isValid, rowData]
    );

    const onValueChange = useCallback(
      ({ target: { value } }) => {
        setInvalid(false);
        setValue(value);
      },
      [setValue]
    );

    const handleClick = (e) => {
      console.log("click", e);
      if (e.detail === 2) {
        console.log("double clicked");
        setEditable((prev) => !prev);
      }
    };

    const getFieldContent = useCallback(
      (content) => {
        return (
          <InputGroup hasValidation>
            {prependText && <InputGroup.Text>{prependText}</InputGroup.Text>}
            {floatingLabel ? (
              <FloatingLabel label={label}>{content}</FloatingLabel>
            ) : (
              <>
                {showLabel && (
                  <Form.Label htmlFor={uniqueId}>{label}</Form.Label>
                )}
                {content}
              </>
            )}
            {postpendText && <InputGroup.Text>{postpendText}</InputGroup.Text>}
            {!invalid && helperText && (
              <Form.Text
                className="m-0 mt-1 text-wrap lh-base"
                id={uniqueId}
                muted
              >
                {helperText}
              </Form.Text>
            )}
            {invalid && (
              <Form.Control.Feedback
                className="m-0 mt-1 text-wrap lh-base"
                type="invalid"
              >
                {errorMsg}
              </Form.Control.Feedback>
            )}
          </InputGroup>
        );
      },
      [
        floatingLabel,
        label,
        uniqueId,
        showLabel,
        helperText,
        invalid,
        postpendText,
        prependText,
        errorMsg,
      ]
    );

    const content = useMemo(() => {
      const defaultValue = (
        <Form.Label ref={ref} onClick={handleClick}>
          {restProps.value}
        </Form.Label>
      );
      if (editable) {
        switch (type) {
          case "text":
            return getFieldContent(
              <Form.Control
                type="text"
                id={uniqueId}
                aria-describedby="passwordHelpBlock"
                required={invalid}
                isInvalid={invalid}
                size="sm"
                onChange={onValueChange}
                value={value}
                onBlur={handleChange}
                ref={ref}
                {...formProps}
              />
            );
          default:
            return defaultValue;
        }
      }
      return defaultValue;
    }, [
      type,
      invalid,
      uniqueId,
      formProps,
      editable,
      getFieldContent,
      handleChange,
      ref,
      restProps,
      onValueChange,
      value,
    ]);

    return (
      <Row>
        {hasEdit ? (
          content
        ) : (
          <Form.Label ref={ref}>{restProps.value}</Form.Label>
        )}
      </Row>
    );
  }
);

export default EditableCell;
