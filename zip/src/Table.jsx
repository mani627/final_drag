import React, { useEffect, useRef } from "react";
import "./styles.scss";

const Table = ({
  tableId,
  tableName,
  columns,
  addConnection,
  onRemove,
  setConnecting,
}) => {
  const tableRef = useRef(null);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.style.resize = "both";
      tableElement.style.overflow = "auto";
    }
  }, []);

  return (
    <div className="table" id={tableId}>
      <div className="table_header">
        <div>{tableName}</div>{" "}
        <button onClick={() => onRemove(tableId)}>x</button>
      </div>

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

export default Table;
