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

export const useTableContext = () => useContext(TableContext);

const CustomTable = ({
  rows = [],
  columns = [],
  editable = false,
  tableActions = null,
  footerContent = null,
  headerContent = null,
}) => {
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    { field: "make", filter: true },
    { field: "model", filter: true },
    { field: "price" },
  ]);

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => ({
    sortable: true,
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log("cellClicked", event);
  }, []);

  // Example load data from server
  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/row-data.json")
      .then((result) => result.json())
      .then((rowData) => setRowData(rowData));
  }, []);

  // Example using Grid's API
  //   const buttonListener = useCallback( e => {
  //     gridRef.current.api.deselectAll();
  //   }, []);

  return (
    <TableContextProvider tableRef={gridRef} rows={rows} columns={columns}>
      <div className="flex w-100 h-100">
        <div class="table-header">{headerContent}</div>
        <div
          className="ag-theme-alpine table-content"
          style={{ width: "100%", height: "100%" }}
        >
          <AgGridReact
            ref={gridRef} // Ref for accessing Grid's API
            rowData={rowData} // Row Data for Rows
            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties
            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
            rowSelection="multiple" // Options - allows click selection of rows
            onCellClicked={cellClickedListener} // Optional - registering for Grid Event
          />
        </div>
        <div class="table-footer">{footerContent}</div>
      </div>
    </TableContextProvider>
  );
};

export default CustomTable;
