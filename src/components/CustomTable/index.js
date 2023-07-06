import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import TableContextProvider, { TableContext } from "./TableContext";
// import { Row } from "react-bootstrap";

export const useTableContext = () => useContext(TableContext);

const CustomTable = ({
  rows = [],
  columns = [],
  editable = false,
  tableActions = null,
  footerContent = null,
  headerContent = null,
  ...tableProps
}) => {
  const gridRef = useRef();

  // const fullWidthCellRenderer = (props) => {
  //   console.log('props ==> ', props);
  //   return <Row>{props.node}</Row>
  // }

  return (
    <TableContextProvider tableRef={gridRef} rows={rows} columns={columns}>
      <div className="flex w-100 h-100">
        <div className="table-header">{headerContent}</div>
        <div
          className="ag-theme-alpine table-content w-100 h-100"
        >
          <AgGridReact
            ref={gridRef}
            rowData={rows}
            columnDefs={columns}
            getRowHeight={() => 68}
            // isFullWidthRow={() => true}
            // fullWidthCellRenderer={fullWidthCellRenderer}
            {...tableProps}
          />
        </div>
        <div className="table-footer">{footerContent}</div>
      </div>
    </TableContextProvider>
  );
};

export default CustomTable;
