import React from "react";
import { useState } from "react";
import EvaluationOverlay from "./EvaluationOverlay";

const EvaluationsTable = ({
  evaluations,
  evaluationExams,
  selectedExam,
  setSelectedExam,
  isOverlayOpen,
  selectedEvaluation,
  handleEvaluateClick,
  closeEvalOverlay,
  handleEvaluationSubmit,
  eligiblePeers = [],
  handlePeerSelect,
}) => {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#2d3559",
        width: "100%",
      }}
    >
      {/* Filter Dropdown */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <select
          value={selectedExam || ""}
          onChange={(e) => setSelectedExam(e.target.value)}
          style={{
            width: "auto",
            maxWidth: "100%",
            minWidth: 180,
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "1.5px solid #4b3c70",
            fontSize: "1rem",
            background: "#fff",
            color: "#000",
            fontWeight: 500,
            transition: "background 0.2s",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All Exams</option>
          {evaluationExams.map((exam, idx) => (
            <option key={idx} value={exam.examId}>
              {exam.courseName} ({exam.batchName}) - {exam.name}
            </option>
          ))}
        </select>

        {selectedExam && eligiblePeers.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                handlePeerSelect(selectedExam, e.target.value);
                e.target.value = ""; // Reset dropdown
              }
            }}
            style={{
              width: "auto",
              maxWidth: "100%",
              minWidth: 180,
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              border: "1.5px solid #28a745",
              fontSize: "1rem",
              background: "#fff",
              color: "#000",
              fontWeight: 500,
              transition: "background 0.2s",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Select Peer to Evaluate</option>
            {eligiblePeers.map((peer) => (
              <option key={peer._id} value={peer._id}>
                {peer.name} ({peer.email})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Evaluations Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 4px 12px #4b3c70",
        }}
      >
        <thead
          style={{
            backgroundColor: "#4b3c70",
            color: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <tr>
            <th style={{ padding: "12px", textAlign: "center" }}>Course Name</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Batch Id</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Exam Name</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Exam Date</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Exam Time</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Evaluated Peer</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Peer Average</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Validation</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: 500,
                  color: "gray",
                }}
              >
                No evaluations found.
              </td>
            </tr>
          ) : (
            evaluations
              .filter(
                (evaluation) =>
                  !selectedExam || evaluation.examId === selectedExam
              )
              .map((evaluation, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.courseName}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.batchId}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.examName}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {new Date(evaluation.examDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.examTime}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.peerName || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.peerAverage ? evaluation.peerAverage.toFixed(1) : "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.status === "pending" ? (
                      <button
                        onClick={() => handleEvaluateClick(evaluation)}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          border: "none",
                          background: "#4b3c70",
                          color: "#fff",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        Evaluate
                      </button>
                    ) : (
                      <span style={{ color: "#28a745", fontWeight: "bold" }}>Evaluated</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {evaluation.status === "completed" ? (
                      <span 
                        title={`Avg Peer Score: ${evaluation.peerAverage?.toFixed(1) || 0} | Deviation: ${evaluation.deviation?.toFixed(1) || 0}`}
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: evaluation.validationStatus === "Needs Review" ? "rgba(211, 47, 47, 0.1)" : "rgba(46, 125, 50, 0.1)",
                          color: evaluation.validationStatus === "Needs Review" ? "#d32f2f" : "#2e7d32",
                          display: "inline-block",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {evaluation.validationStatus === "Needs Review" ? "⚠️ Needs Review" : "✅ Normal"}
                      </span>
                    ) : (
                      <span style={{ color: "gray", fontSize: "0.85rem" }}>-</span>
                    )}
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      {isOverlayOpen && (
        <EvaluationOverlay
          isOverlayOpen={isOverlayOpen}
          selectedEvaluation={selectedEvaluation}
          closeEvalOverlay={closeEvalOverlay}
          handleEvaluationSubmit={handleEvaluationSubmit}
        />
      )}
    </div>
  );
};

export default EvaluationsTable;
