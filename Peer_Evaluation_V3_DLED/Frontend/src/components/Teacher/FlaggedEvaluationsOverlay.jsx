import { FaTimes, FaEdit, FaCheck, FaTrash, FaUserShield } from "react-icons/fa";

export default function PeerEvaluationsOverlay({ flaggedEvaluationsOverlayOpen, flaggedEvaluationsOverlayClose, flaggedEvaluations, handleEditEvaluationOverlayOpen, handleEvaluationFlagRemove, handleModerateAction, handleReEvaluateClick }) {
  if (!flaggedEvaluationsOverlayOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1100,
      }}
      onClick={flaggedEvaluationsOverlayClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          width: "1200px",
          height: "700px",
          minWidth: "300px",
          maxWidth: "90%",
          maxHeight: "85%",
          overflowX: "auto",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(60,60,120,0.18)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={flaggedEvaluationsOverlayClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "#fc1717",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Close
        </button>
        <h2 style={{ marginBottom: "1.5rem", color: "#4b3c70", textAlign: "center" }}>All Peer Evaluations</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            minWidth: "600px",
            maxWidth: "1200px",
            borderCollapse: "collapse",
            background: "#fff",
            fontSize: "0.95rem",
            borderRadius: "8px",
            overflowX: "auto",
          }}>
            <thead style={{ backgroundColor: "#4b3c70", color: "#fff" }}>
              <tr>
                <th style={{ ...thCellStyle }}>Student</th>
                <th style={{ ...thCellStyle }}>Evaluator</th>
                <th style={{ ...thCellStyle }}>Total Score</th>
                <th style={{ ...thCellStyle }}>Document</th>
                <th style={{ ...thCellStyle }}>Status</th>
                <th style={{ ...thCellStyle }}>Validation</th>
                <th style={{ ...thCellStyle }}>Anomaly Details</th>
                <th style={{ ...thCellStyle }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "gray" }}>
                    No evaluations found.
                  </td>
                </tr>
              ) : (
                flaggedEvaluations.map((evaluation, idx) => (
                  <tr 
                    key={evaluation._id || idx} 
                    style={{ 
                      borderBottom: "1px solid #eee",
                      backgroundColor: evaluation.status === "Needs Review" ? "#fff5f5" : "#fafffa",
                      transition: "background 0.2s"
                    }}
                  >
                    <td style={{ ...tdCellStyle }}>{evaluation.student?.name || "Unknown"}</td>
                    <td style={{ ...tdCellStyle }}>{evaluation.evaluator?.name || "Unknown"}</td>
                    <td style={{ ...tdCellStyle }}>
                      {Array.isArray(evaluation.score)
                        ? evaluation.score.reduce((sum, val) => sum + val, 0)
                        : evaluation.score || 0}
                    </td>
                    <td style={{ ...tdCellStyle }}>
                      {evaluation.document?.documentPath ? (
                        <a
                          href={`http://localhost:5000/${evaluation.document.documentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#4b3c70", textDecoration: "underline" }}
                        >
                          View File
                        </a>
                      ) : "No file"}
                    </td>
                    <td style={{ ...tdCellStyle, fontWeight: "bold", color: evaluation.eval_status === "pending" ? "#d32f2f" : "#43a047" }}>
                      {evaluation.eval_status.charAt(0).toUpperCase() + evaluation.eval_status.slice(1)}
                    </td>
                    <td style={{ ...tdCellStyle }}>
                      <span 
                        title={`Deviation from average: ${evaluation.deviation?.toFixed(1) || 0}`}
                        style={{
                          fontSize: "1rem",
                          color: evaluation.status === "Needs Review" ? "#d32f2f" : "#2e7d32"
                        }}
                      >
                        {evaluation.status === "Needs Review" ? "⚠️ Needs Review" : (evaluation.status === "Approved" || evaluation.status === "Finalized by Teacher") ? `✅ ${evaluation.status}` : "✅ Normal"}
                      </span>
                    </td>
                    <td style={{ ...tdCellStyle }}>
                      {evaluation.status === "Needs Review" ? (
                        <div style={{ fontSize: "0.85rem", color: "#666", textAlign: "left", paddingLeft: "10px" }}>
                          <div style={{ marginBottom: '2px' }}>
                            <strong>Evaluator Marks:</strong> {
                              Array.isArray(evaluation.score) 
                                ? evaluation.score.reduce((a, b) => a + b, 0) 
                                : evaluation.score || 0
                            }
                          </div>
                          <div style={{ marginBottom: '2px' }}>
                            <strong>Peer Average:</strong> {evaluation.peerAverage?.toFixed(2) || "N/A"}
                          </div>
                          <div style={{ color: "#d32f2f", fontWeight: "bold" }}>
                            <strong>Deviation:</strong> {evaluation.deviation?.toFixed(2) || 0}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#2e7d32", fontSize: "0.9rem" }}>Within normal range</span>
                      )}
                    </td>
                    <td style={{ ...tdCellStyle }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        {evaluation.status === "Needs Review" && !evaluation.isRejected ? (
                          <>
                            <button 
                              style={{ ...btnBase, backgroundColor: "#28a745" }} 
                              onClick={() => handleModerateAction(evaluation._id, evaluation.exam?._id, 'approve')}
                              title="Approve (Mark as Normal)"
                            >
                              <FaCheck style={{ marginRight: '4px' }} /> Approve
                            </button>
                            <button 
                              style={{ ...btnBase, backgroundColor: "#4b3c70" }}
                              onClick={() => handleReEvaluateClick(evaluation)}
                              title="Re-Evaluate (Overwrite with Teacher Marks)"
                            >
                              <FaUserShield style={{ marginRight: '4px' }} /> Re-Evaluate
                            </button>
                            <button 
                              style={{ ...btnBase, backgroundColor: "#dc3545" }} 
                              onClick={() => handleModerateAction(evaluation._id, evaluation.exam?._id, 'reject')}
                              title="Reject (Discard Score)"
                            >
                              <FaTrash style={{ marginRight: '4px' }} /> Reject
                            </button>
                          </>
                        ) : evaluation.isRejected ? (
                          <span style={{ color: "#dc3545", fontWeight: "bold" }}>Rejected</span>
                        ) : evaluation.status === "Finalized by Teacher" ? (
                          <span style={{ color: "#4b3c70", fontWeight: "bold" }}>Finalized</span>
                        ) : (
                          <button style={btnAccept} onClick={() => handleEditEvaluationOverlayOpen(evaluation)}>
                            <FaEdit /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thCellStyle = {
    padding: "12px 8px", 
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1rem"
};

const tdCellStyle = {
    padding: "12px 8px", 
    textAlign: "center", 
    fontWeight: 500,
    color: "#4b3c70"
};

const btnBase = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  fontSize: "0.85rem",
  fontWeight: "bold",
  transition: "opacity 0.2s",
};

const btnAccept = {
  ...btnBase,
  backgroundColor: "#4b3c70",
};

const btnDecline = {
  ...btnBase,
  backgroundColor: "#fc1717",
};
