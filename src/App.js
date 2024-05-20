import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import Xarrow from "react-xarrows";
import "./styles.css";

const Table = ({ tableId, tableName, columns, addConnection, onRemove, setConnecting }) => {
  return (
    <div className="table" id={tableId}>
      <h3>
        {tableName} <button onClick={() => onRemove(tableId)}>x</button>
      </h3>
      <ul>
        {columns.map((column) => (
          <li
            key={column.column_id}
            id={`${tableId}-${column.column_id}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "column",
                JSON.stringify({ tableId, columnId: column.column_id })
              );
              setConnecting(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData("column");
              if (data) {
                const draggedColumn = JSON.parse(data);
                if (
                  draggedColumn.tableId !== tableId ||
                  draggedColumn.columnId !== column.column_id
                ) {
                  addConnection({
                    start: `${draggedColumn.tableId}-${draggedColumn.columnId}`,
                    end: `${tableId}-${column.column_id}`,
                  });
                }
              }
              setConnecting(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => setConnecting(false)}
          >
            {column.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  const [connections, setConnections] = useState([]);
  const [tablePositions, setTablePositions] = useState({});
  const [droppedTables, setDroppedTables] = useState([]);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (droppedTables.length === mockTables.length) {
      alert("All tables are dragged");
    }
  }, [droppedTables]);


  const handleStop = (e, data, tableId) => {
    const newPosition = { x: data.x, y: data.y };
    let adjustedPosition = { ...newPosition };
    let isOverlapping;

    do {
      isOverlapping = false;
      for (let key in tablePositions) {
        if (key !== tableId) {
          const pos = tablePositions[key];
          if (
            Math.abs(adjustedPosition.x - pos.x) < 220 &&
            Math.abs(adjustedPosition.y - pos.y) < 220
          ) {
            isOverlapping = true;
            adjustedPosition = {
              x: adjustedPosition.x + 10,
              y: adjustedPosition.y + 10,
            };
            break;
          }
        }
      }
    } while (isOverlapping);

    setTablePositions((prevPositions) => ({
      ...prevPositions,
      [tableId]: adjustedPosition,
    }));
  };

  const addConnection = (connection) => {
    setConnections((prev) => [...prev, connection]);
  };

  const handleDrop = (e) => {
    const data = e.dataTransfer.getData("table");
    if (data) {
      const table = JSON.parse(data);
      if (!droppedTables.some((t) => t.id === table.id)) {
        let newPosition = { x: e.clientX - 250, y: e.clientY - 50 };
        let adjustedPosition = { ...newPosition };
        let isOverlapping;

        do {
          isOverlapping = false;
          for (let key in tablePositions) {
            const pos = tablePositions[key];
            if (
              Math.abs(adjustedPosition.x - pos.x) < 220 &&
              Math.abs(adjustedPosition.y - pos.y) < 220
            ) {
              isOverlapping = true;
              adjustedPosition = {
                x: adjustedPosition.x + 10,
                y: adjustedPosition.y + 10,
              };
              break;
            }
          }
        } while (isOverlapping);

        setDroppedTables([...droppedTables, table]);
        setTablePositions((prevPositions) => ({
          ...prevPositions,
          [table.id]: adjustedPosition,
        }));
      }
    }
  };

  const handleRemove = (tableId) => {
    setDroppedTables((prevTables) =>
      prevTables.filter((table) => table.id !== tableId)
    );
    setTablePositions((prevPositions) => {
      const newPositions = { ...prevPositions };
      delete newPositions[tableId];
      return newPositions;
    });
    setConnections((prevConnections) =>
      prevConnections.filter((conn) => {
        return (
          conn.start.split("-")[0] !== tableId &&
          conn.end.split("-")[0] !== tableId
        );
      })
    );
  };

  return (
    <div className="app">
      <div className="left-panel">
        <input type="text" placeholder="Filter by Table Name" />
        <ul>
          {mockTables.map((table) => (
            <li
              key={table.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("table", JSON.stringify(table));
              }}
            >
              {table.name}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="right-panel"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {droppedTables.map((table) => (
          <Draggable
            key={table.id}
            onStop={(e, data) => handleStop(e, data, table.id)}
            position={tablePositions[table.id]}
            disabled={connecting} // Disable dragging if connecting
          >
            <div>
              <Table
                tableId={table.id}
                tableName={table.name}
                columns={table.columns}
                addConnection={addConnection}
                onRemove={handleRemove}
                setConnecting={setConnecting} // Pass setConnecting to Table
              />
            </div>
          </Draggable>
        ))}
        {connections.map((conn, index) => (
          <Xarrow
            key={index}
            start={conn.start}
            end={conn.end}
            startAnchor="right"
            endAnchor="left"
          />
        ))}
      </div>
    </div>
  );
};

const mockTables = [
  {
    id: "1",
    name: "Employees",
    columns: [
      { column_id: "1_1", name: "Name", column_data_type: "String" },
      { column_id: "1_2", name: "Age", column_data_type: "Number" },
    ],
  },
  {
    id: "2",
    name: "Patients",
    columns: [
      { column_id: "2_1", name: "PatientName", column_data_type: "String" },
      { column_id: "2_2", name: "Disease", column_data_type: "String" },
    ],
  },
  {
    id: "3",
    name: "Associates",
    columns: [
      { column_id: "3_1", name: "AssociatesName", column_data_type: "String" },
      { column_id: "3_2", name: "AssociatesAge", column_data_type: "String" },
    ],
  },
  {
    id: "4",
    name: "Contract Workers",
    columns: [
      {
        column_id: "4_1",
        name: "Contract WorkersName",
        column_data_type: "String",
      },
      {
        column_id: "4_2",
        name: "Contract WorkersAge",
        column_data_type: "String",
      },
      { column_id: "4_3", name: "Contract Period", column_data_type: "String" },
      { column_id: "4_4", name: "Joined Date", column_data_type: "String" },
      { column_id: "4_5", name: "Role", column_data_type: "String" },
      { column_id: "4_6", name: "Location", column_data_type: "String" },
    ],
  },
  {
    id: "5",
    name: "Securities",
    columns: [
      { column_id: "5_1", name: "SecuritiesName", column_data_type: "String" },
      { column_id: "5_2", name: "SecuritiesAge", column_data_type: "String" },
      { column_id: "5_3", name: "Field Name", column_data_type: "String" },
      { column_id: "5_4", name: "Place on Demand", column_data_type: "String" },
    ],
  },
  {
    id: "6",
    name: "Business Team",
    columns: [
      { column_id: "6_1", name: "Name", column_data_type: "String" },
      { column_id: "6_2", name: "YOE", column_data_type: "String" },
      { column_id: "6_3", name: "Company Name", column_data_type: "String" },
      { column_id: "6_4", name: "Contribution", column_data_type: "String" },
    ],
  },
  {
    id: "7",
    name: "HR Teams",
    columns: [
      { column_id: "7_1", name: "Name", column_data_type: "String" },
      { column_id: "7_2", name: "Age", column_data_type: "String" },
      { column_id: "7_3", name: "Location", column_data_type: "String" },
      { column_id: "7_4", name: "YOJ", column_data_type: "String" },
    ],
  },
];

export default App;
