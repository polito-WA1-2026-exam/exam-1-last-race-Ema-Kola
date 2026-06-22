function SegmentList({ segments, selected, onToggle }) {
    const canonicalKey = (a, b) => [a, b].sort().join("|||");
  
    return (
      <div style={{ maxHeight: 380, overflowY: "auto", border: "1px solid #dee2e6", borderRadius: 6 }}>
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th style={{ fontSize: 13, width: 28 }}></th>
              <th colSpan={2} style={{ fontSize: 13 }}>
                Segments — click to select / deselect
              </th>
            </tr>
          </thead>
          <tbody>
            {segments.map(({ station1, station2 }) => {
                const key = canonicalKey(station1, station2);
                const isSelected = selected.has(key);

                return (
                <tr
                    key={key}
                    onClick={() => onToggle(station1, station2)}
                    style={{
                    cursor: "pointer",
                    background: isSelected ? "#d1e7dd" : undefined,
                    }}
                >
                    <td style={{ width: 28, textAlign: "center" }}>
                    {isSelected && "✓"}
                    </td>

                    <td
                    style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 400,
                    }}
                    >
                    {station1} ↔ {station2}
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
      </div>
    );
  }
  
  export default SegmentList;