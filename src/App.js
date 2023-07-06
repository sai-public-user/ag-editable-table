import "./App.css";
import CustomTable from "./components/CustomTable";
import EditableCell from "./components/CustomTable/EditableCell";
import EditableTable from "./components/EditableTable";

const cols = [
  {
    headerName: "Annual BPS / $ Amount",
    field: "amount",
    type: 'number',
    editable: true,
    width: '33.33%',
  },
  { headerName: "Low Balance Threshold", field: "low", width: '33.33%', },
  {
    headerName: "High Balance Threshold",
    field: "high",
    type: 'number',
    editable: true,
    width: '33.33%',
  },
];

const rows = [{ amount: "90899", low: "0", high: "1000" }];

function App() {
  return (
    <div className="App">
      {/* <CustomTable animateRows rows={rows} columns={cols} /> */}
      <EditableTable rows={rows} columns={cols} />
    </div>
  );
}

export default App;
