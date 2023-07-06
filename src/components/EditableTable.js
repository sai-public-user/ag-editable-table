import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Form } from "react-bootstrap";

// backspace starts the editor on Windows
const KEY_BACKSPACE = "Backspace";
const KEY_F2 = "F2";
const KEY_ENTER = "Enter";
const KEY_TAB = "Tab";

const NumericEditor = memo(
  forwardRef((props, ref) => {
    const createInitialState = () => {
      let startValue;
      let highlightAllOnFocus = true;
      const eventKey = props.eventKey;

      if (eventKey === KEY_BACKSPACE) {
        // if backspace or delete pressed, we clear the cell
        startValue = "";
      } else if (eventKey && eventKey.length === 1) {
        // if a letter was pressed, we start with the letter
        startValue = eventKey;
        highlightAllOnFocus = false;
      } else {
        // otherwise we start with the current value
        startValue = props.value;
        if (props.eventKey === KEY_F2) {
          highlightAllOnFocus = false;
        }
      }

      return {
        value: startValue,
        highlightAllOnFocus,
      };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value);
    const [highlightAllOnFocus, setHighlightAllOnFocus] = useState(
      initialState.highlightAllOnFocus
    );
    const [invalid, setInvalid] = useState(false);
    const refInput = useRef(null);

    // focus on the input
    useEffect(() => {
      // get ref from React component
      const eInput = refInput.current;
      eInput.focus();
      if (highlightAllOnFocus) {
        eInput.select();

        setHighlightAllOnFocus(false);
      } else {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const length = eInput.value ? eInput.value.length : 0;
        if (length > 0) {
          eInput.setSelectionRange(length, length);
        }
      }
    }, []);

    const isLeftOrRight = (event) => {
      return ["ArrowLeft", "ArrowLeft"].indexOf(event.key) > -1;
    };

    const isCharNumeric = (charStr) => {
      return !!/\d/.test(charStr);
    };

    const isNumericKey = (event) => {
      const charStr = event.key;
      return isCharNumeric(charStr);
    };

    const isBackspace = (event) => {
      return event.key === KEY_BACKSPACE;
    };

    const finishedEditingPressed = (event) => {
      const key = event.key;
      return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = (event) => {
      if (isLeftOrRight(event) || isBackspace(event)) {
        event.stopPropagation();
        return;
      }

      if (!finishedEditingPressed(event) && !isNumericKey(event)) {
        if (event.preventDefault) event.preventDefault();
      }

      if (finishedEditingPressed(event)) {
        props.stopEditing();
      }
    };

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
      return {
        getValue() {
          return value === "" || value == null ? null : parseInt(value);
        },
        isCancelAfterEnd() {
          const finalValue = this.getValue();
          if (!invalid) {
            props.data[props.column.colId] = finalValue;
          }
        },
      };
    });

    const onValueChange = ({ target: { value } }) => {
      setValue(value);
      if (
        props.column.colId === "high" &&
        Number(value) <= Number(props.data.low)
      ) {
        setInvalid(true);
      } else {
        setInvalid(false);
      }
    };

    return (
      <>
        <Form.Control
          ref={refInput}
          type="number"
          value={value}
          onChange={onValueChange}
          onKeyDown={(event) => onKeyDown(event)}
          className="numeric-input w-100 p-0 h-100"
          isInvalid={invalid}
          required={invalid}
        />
        {invalid && (
          <Form.Control.Feedback
            className="m-0 mt-1 text-wrap lh-base"
            type="invalid"
          >
            Please enter proper data
          </Form.Control.Feedback>
        )}
      </>
    );
  })
);

const EditableTable = ({ rows, columns }) => {
  const tableRef = useRef();
  const [rowsData, setRowsData] = useState([...rows]);

  const getEditingRows = useCallback(() => {
    var cellDefs = tableRef?.current?.api?.getEditingCells();
    if (cellDefs.length > 0) {
      return cellDefs[0];
    } else {
      return null;
    }
  }, [tableRef]);

  const setStartEditing = useCallback(
    (rowIndex, colName, key) => {
      tableRef?.current?.api?.setFocusedCell(rowIndex, colName);
      tableRef?.current?.api?.startEditingCell({
        rowIndex: rowIndex,
        colKey: colName,
        key,
      });
    },
    [tableRef]
  );

  const getCellEditor = (type) => {
    switch (type) {
      case "number":
        return NumericEditor;
      default:
        return undefined;
    }
  };

  const columnDefs = useMemo(
    () =>
      columns.map((col) => {
        const cellEditor = getCellEditor(col.type);
        return { ...col, cellEditor, type: undefined };
      }),
    [columns]
  );

  const onCancel = useCallback(() => {
    setRowsData([...rows]);
  }, [rows]);

  const disableAddRow = useMemo(() => {
    return rowsData?.some(({ low, high, amount }) => !low || !high || !amount);
  }, [rowsData]);

  const onAddRow = useCallback(() => {
    const newRow = {
      ...rowsData.slice(rowsData.length - 1, rowsData.length)[0],
    };
    newRow.low = newRow.high + 0.1;
    newRow.high = "";
    const newRows = [...rowsData, newRow];
    setRowsData(newRows);
    setTimeout(() => {
      setStartEditing(newRows.length - 1, "high", 0.0);
    }, 500);
  }, [rowsData, setStartEditing]);

  const onClearRates = useCallback(() => {}, []);
  const onClearThreshold = useCallback(() => {}, []);
  const onClearAll = useCallback(() => {}, []);
  const onSave = useCallback(() => {}, []);

  return (
    <div className="w-100 h-100 p-3">
      <div className="d-flex justify-content-end gap-2 pb-3">
        <Button variant="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" disabled={disableAddRow} onClick={onAddRow}>
          Add Row
        </Button>
        <Button variant="primary" onClick={onClearRates}>
          Clear Rates
        </Button>
        <Button variant="primary" onClick={onClearThreshold}>
          Clear Threshold
        </Button>
        <Button variant="primary" onClick={onClearAll}>
          Clear All
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </div>
      <div className="ag-theme-alpine test-grid w-100 h-100">
        <AgGridReact
          columnDefs={columnDefs}
          ref={tableRef}
          rowData={rowsData}
          defaultColDef={{
            sortable: true,
            flex: 1,
            minWidth: 100,
            resizable: true,
            // editable: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditableTable;
