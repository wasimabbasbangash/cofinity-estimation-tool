import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import AvatarPicker from "./AvatarPicker";
import AvatarDoodle from "./AvatarDoodle";

// In production, use /api (Vercel rewrites handle this)
// In development, use /api (Vite proxy handles this)
const API_BASE = "/api";

function App() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false); // Flag to prevent polling when creating new

  // Create Poll Form State
  const [question, setQuestion] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [selectedOptions, setSelectedOptions] = useState(
    new Set([1, 2, 3, 5, 8])
  );
  const [currentCreator, setCurrentCreator] = useState(""); // Track current creator

  // Vote Form State
  const [voterName, setVoterName] = useState("");
  const [voteValue, setVoteValue] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerMaxDuration, setTimerMaxDuration] = useState(null); // Store initial duration

  useEffect(() => {
    // Load creator name from localStorage on mount
    const savedCreator = localStorage.getItem("pollCreator");
    if (savedCreator) {
      setCurrentCreator(savedCreator);
    }

    // Load voter name from localStorage on mount
    const savedVoterName = localStorage.getItem("voterName");
    if (savedVoterName) {
      setVoterName(savedVoterName);
      // Also auto-populate creator field if empty
      if (!createdBy) {
        setCreatedBy(savedVoterName);
      }
    }

    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem("voterAvatar");
    if (savedAvatar !== null && savedAvatar !== "") {
      const avatarIndex = parseInt(savedAvatar, 10);
      if (!isNaN(avatarIndex)) {
        setSelectedAvatar(avatarIndex);
      }
    }

    fetchPoll();
  }, []);

  useEffect(() => {
    // Poll for updates every second
    const interval = setInterval(() => {
      if (!isCreatingNew) {
        fetchPoll();
        if (poll && poll.status === "open") {
          fetchTimer();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCreatingNew, poll]);

  const fetchTimer = async () => {
    if (!poll || poll.status !== "open") return;

    try {
      const response = await fetch(`${API_BASE}/poll/timer`);
      if (response.ok) {
        const data = await response.json();

        // When timer expires, reset state
        if (data.timeRemaining === 0 && data.timerActive) {
          setTimerActive(false);
          setTimeRemaining(0);
          // Show message briefly then reset
          setTimeout(() => {
            setTimeRemaining(null);
          }, 2000);
        } else {
          setTimerActive(data.timerActive);
          setTimeRemaining(data.timeRemaining);
        }
      }
    } catch (err) {
      console.error("Failed to fetch timer:", err);
    }
  };

  const fetchPoll = async () => {
    // Don't fetch if we're creating a new poll
    if (isCreatingNew) return;

    try {
      const response = await fetch(`${API_BASE}/poll`);
      if (response.status === 404) {
        setPoll(null);
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch poll");
      const data = await response.json();
      setPoll(data);
      setLoading(false);
    } catch (err) {
      if (err.message !== "Failed to fetch poll") {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!question.trim() || !createdBy.trim() || selectedOptions.size === 0) {
      setError("Please fill in all fields and select at least one option");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/poll/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          options: Array.from(selectedOptions).sort((a, b) => a - b),
          createdBy: createdBy.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create poll");
      }

      const data = await response.json();
      setPoll(data.poll);
      const creatorName = createdBy.trim();
      setCurrentCreator(creatorName); // Store creator name
      localStorage.setItem("pollCreator", creatorName); // Persist to localStorage
      // Also save as voter name if not already set
      if (!localStorage.getItem("voterName")) {
        localStorage.setItem("voterName", creatorName);
        setVoterName(creatorName);
      }
      setQuestion("");
      setCreatedBy("");
      setSelectedOptions(new Set([1, 2, 3, 5, 8]));
      setIsCreatingNew(false); // Re-enable polling
      setSuccess("Poll created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Immediately fetch to ensure we have the latest state
      fetchPoll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!voterName.trim() || !voteValue) {
      setError("Please enter your name and select a value");
      return;
    }

    try {
      const trimmedName = voterName.trim();
      // Save voter name and avatar to localStorage
      localStorage.setItem("voterName", trimmedName);
      if (selectedAvatar !== null && selectedAvatar !== undefined) {
        localStorage.setItem("voterAvatar", selectedAvatar.toString());
      }

      const response = await fetch(`${API_BASE}/poll/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          value: Number(voteValue),
          avatar: selectedAvatar !== null ? selectedAvatar : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit vote");
      }

      setSuccess("Vote submitted successfully!");
      setVoteValue("");
      setTimeout(() => setSuccess(""), 3000);
      fetchPoll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClosePoll = async () => {
    if (!poll) return;

    setError("");
    try {
      // Get user name from localStorage or prompt if not available
      const savedVoterName = localStorage.getItem("voterName") || voterName;

      if (!savedVoterName || !savedVoterName.trim()) {
        setError(
          "Please enter your name in the voting form first, or refresh the page if you have voted before."
        );
        return;
      }

      const response = await fetch(`${API_BASE}/poll/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: savedVoterName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to close poll");
      }

      const data = await response.json();
      setPoll(data.poll);
      setTimerActive(false);
      setTimeRemaining(null);
      setSuccess("Poll closed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartTimer = async (duration) => {
    if (!poll || !poll.createdBy) return;

    setError("");
    try {
      const savedCreator =
        localStorage.getItem("pollCreator") || currentCreator;

      const response = await fetch(`${API_BASE}/poll/timer/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: duration,
          createdBy: savedCreator || poll.createdBy,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start timer");
      }

      const data = await response.json();
      setTimerActive(true);
      setTimeRemaining(duration);
      setTimerMaxDuration(duration); // Store the initial duration
      const label = duration === 30 ? "30 seconds" : "1 minute";
      setSuccess(`🔊 Timer started! ${label} to vote. (Sound enabled)`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleOption = (value) => {
    const newOptions = new Set(selectedOptions);
    if (newOptions.has(value)) {
      newOptions.delete(value);
    } else {
      newOptions.add(value);
    }
    setSelectedOptions(newOptions);
  };

  const calculateStats = () => {
    if (!poll || !poll.votes || poll.votes.length === 0) {
      return { min: null, max: null, average: null };
    }

    const values = poll.votes
      .map((v) => v.value)
      .filter((v) => v !== null && v !== undefined);
    if (values.length === 0) {
      return { min: null, max: null, average: null };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(
      1
    );

    return { min, max, average };
  };

  if (loading) {
    return (
      <div className="app-wrapper">
        <nav className="navbar">
          <h1 className="navbar-title">Dos Ticket Estimator</h1>
        </nav>
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // Check if current user is the creator (for display purposes)
  // Also check localStorage in case of page refresh
  const savedCreator = localStorage.getItem("pollCreator") || currentCreator;
  const isCreator =
    poll &&
    savedCreator &&
    poll.createdBy &&
    savedCreator.toLowerCase().trim() === poll.createdBy.toLowerCase().trim();

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <h1 className="navbar-title">Dos Ticket Estimator</h1>
      </nav>
      <div className="container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* Ticket 7: Create Poll UI */}
        {!poll && (
          <div className="card">
            <h2>Create New Poll</h2>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label htmlFor="question">Question / Story Description *</label>
                <input
                  type="text"
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Estimate the effort for implementing user authentication"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="createdBy">Your Name (Creator) *</label>
                <input
                  type="text"
                  id="createdBy"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
                {createdBy &&
                  localStorage.getItem("voterName") &&
                  createdBy.trim() === localStorage.getItem("voterName") && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      ✓ Using saved name
                    </small>
                  )}
              </div>

              <div className="form-group">
                <label>Estimation Options *</label>
                <div className="options-grid">
                  {[1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((value) => (
                    <div
                      key={value}
                      className="option-checkbox"
                      onClick={() => toggleOption(value)}
                    >
                      <input
                        type="checkbox"
                        id={`option-${value}`}
                        checked={selectedOptions.has(value)}
                        onChange={() => toggleOption(value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`option-${value}`}
                        onClick={(e) => e.preventDefault()}
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
                <small
                  style={{
                    color: "#6b7280",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Select the estimation values you want to include
                </small>
              </div>

              <button
                type="submit"
                style={{ width: "100%", marginTop: "10px" }}
              >
                Create Poll
              </button>
            </form>
          </div>
        )}

        {/* Poll Display */}
        {poll && (
          <>
            <div className="poll-info">
              <h3>
                {poll.question}
                <span className={`status-badge status-${poll.status}`}>
                  {poll.status === "open" ? "Open" : "Closed"}
                </span>
              </h3>
              <p>
                <strong>Created by:</strong> {poll.createdBy}
              </p>
              {poll.status === "closed" && poll.closedBy && (
                <p>
                  <strong>Closed by:</strong> {poll.closedBy}
                </p>
              )}
              <p>
                <strong>Options:</strong> {poll.options.join(", ")}
              </p>
              {poll.status === "open" && (
                <p>
                  <strong>Votes:</strong>{" "}
                  {poll.voterNames
                    ? poll.voterNames.length
                    : poll.votes
                    ? poll.votes.length
                    : 0}
                </p>
              )}
            </div>

            {/* Timer Controls (only for creator) */}
            {poll.status === "open" &&
              isCreator &&
              (!timerActive || timeRemaining === 0) && (
                <div
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button onClick={() => handleStartTimer(30)}>
                    {timeRemaining === 0
                      ? "Restart 30s Timer"
                      : "Start 30s Timer"}
                  </button>
                  <button onClick={() => handleStartTimer(60)}>
                    {timeRemaining === 0
                      ? "Restart 1min Timer"
                      : "Start 1min Timer"}
                  </button>
                </div>
              )}

            {/* Timer Display */}
            {poll.status === "open" && timerActive && timeRemaining > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Timer
                  timeRemaining={timeRemaining}
                  timerActive={timerActive}
                  maxDuration={timerMaxDuration}
                />
              </div>
            )}

            {/* Ticket 5: Close Poll Button (all users) */}
            {poll.status === "open" && (
              <div
                style={{
                  marginBottom: "20px",
                  textAlign: "right",
                  paddingTop: "10px",
                }}
              >
                <button onClick={handleClosePoll} className="danger">
                  Close Poll & Reveal Results
                </button>
              </div>
            )}

            {/* Ticket 8: Voting UI */}
            {poll.status === "open" && (
              <div className="voting-section">
                <h2>Cast Your Vote</h2>
                {(!timerActive || timeRemaining === 0) && (
                  <div
                    style={{
                      padding: "12px",
                      background: timeRemaining === 0 ? "#f8d7da" : "#fff3cd",
                      border:
                        timeRemaining === 0
                          ? "1px solid #dc3545"
                          : "1px solid #ffc107",
                      borderRadius: "6px",
                      marginBottom: "15px",
                      fontSize: "0.9rem",
                      color: timeRemaining === 0 ? "#721c24" : "#856404",
                    }}
                  >
                    {timeRemaining === 0
                      ? "⏰ Time's up! Voting has ended. Creator can restart the timer."
                      : "⏳ Waiting for the creator to start the timer..."}
                  </div>
                )}

                {/* Avatar Selection */}
                <AvatarPicker
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={setSelectedAvatar}
                  showPicker={showAvatarPicker}
                  onToggle={() => setShowAvatarPicker(!showAvatarPicker)}
                />

                <form onSubmit={handleVote} className="vote-form">
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Your name"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    {voterName &&
                      localStorage.getItem("voterName") &&
                      voterName.trim() ===
                        localStorage.getItem("voterName") && (
                        <small
                          style={{
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          (saved)
                        </small>
                      )}
                  </div>
                  <select
                    value={voteValue}
                    onChange={(e) => setVoteValue(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Select value</option>
                    {poll.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={
                      !timerActive || timeRemaining === 0 || !timeRemaining
                    }
                  >
                    {!timerActive ||
                    timeRemaining === 0 ||
                    timeRemaining === null
                      ? "Voting Disabled"
                      : "Vote"}
                  </button>
                </form>
                <small style={{ display: "block", marginTop: "10px" }}>
                  💡 You can vote again to update your vote. Your name is saved
                  and can be changed anytime.
                </small>
              </div>
            )}

            {/* Ticket 9: Results UI */}
            {poll.status === "closed" && (
              <div className="results-section">
                {poll.votes && poll.votes.length > 0 && (
                  <>
                    {/* Three column layout: Stats + Chart + Votes */}
                    <div className="results-grid-row">
                      {/* Summary Stats */}
                      <div className="stats-column">
                        <h2 style={{ marginBottom: "20px" }}>Summary</h2>
                        {(() => {
                          const stats = calculateStats();
                          return (
                            <div className="stats-vertical">
                              <div className="stat-item-vertical">
                                <div className="stat-label">Minimum</div>
                                <div className="stat-value">
                                  {stats.min !== null ? stats.min : "N/A"}
                                </div>
                              </div>
                              <div className="stat-item-vertical">
                                <div className="stat-label">Average</div>
                                <div className="stat-value">
                                  {stats.average !== null
                                    ? stats.average
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="stat-item-vertical">
                                <div className="stat-label">Maximum</div>
                                <div className="stat-value">
                                  {stats.max !== null ? stats.max : "N/A"}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Visual Chart */}
                      <div className="chart-container">
                        <div className="chart-title">Vote Distribution</div>
                        <div className="chart">
                          {poll.options.map((option, idx) => {
                            const votesForOption = poll.votes.filter(
                              (v) => v.value === option
                            );
                            const voteCount = votesForOption.length;
                            const maxVotes = Math.max(
                              ...poll.options.map(
                                (opt) =>
                                  poll.votes.filter((v) => v.value === opt)
                                    .length
                              ),
                              1 // Ensure at least 1 to avoid division by zero
                            );
                            const heightPercent =
                              maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;

                            return (
                              <div key={idx} className="chart-bar-wrapper">
                                <div
                                  className="chart-bar"
                                  style={{
                                    height: `${Math.max(
                                      heightPercent,
                                      voteCount > 0 ? 10 : 0
                                    )}%`,
                                    background:
                                      voteCount > 0
                                        ? `var(--voter-${(idx % 8) + 1})`
                                        : "#e0e0e0",
                                    minHeight: voteCount > 0 ? "20px" : "0px",
                                  }}
                                >
                                  {voteCount > 0 && (
                                    <div className="chart-value">
                                      {voteCount}
                                    </div>
                                  )}
                                </div>
                                <div className="chart-label">{option}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Individual Votes */}
                      <div className="votes-container">
                        <h2>Individual Votes ({poll.votes.length})</h2>
                        <div className="votes-grid">
                          {poll.votes.map((vote, index) => {
                            const colors = [
                              "var(--voter-1)",
                              "var(--voter-2)",
                              "var(--voter-3)",
                              "var(--voter-4)",
                              "var(--voter-5)",
                              "var(--voter-6)",
                              "var(--voter-7)",
                              "var(--voter-8)",
                            ];
                            const borderColor = colors[index % colors.length];
                            const bgColor = colors[index % colors.length];

                            return (
                              <div
                                key={index}
                                className="vote-card"
                                style={{ borderLeftColor: borderColor }}
                              >
                                <div className="vote-card-header">
                                  <div className="vote-card-info">
                                    {vote.avatar !== null &&
                                      vote.avatar !== undefined && (
                                        <div
                                          className="vote-card-avatar"
                                          style={{ borderColor: borderColor }}
                                        >
                                          {typeof vote.avatar === "number" ? (
                                            <AvatarDoodle index={vote.avatar} />
                                          ) : (
                                            <span
                                              style={{ fontSize: "1.5rem" }}
                                            >
                                              {vote.avatar}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    <span className="vote-name">
                                      {vote.name}
                                    </span>
                                  </div>
                                  <span
                                    className="vote-value-badge"
                                    style={{ background: bgColor }}
                                  >
                                    {vote.value}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(!poll.votes || poll.votes.length === 0) && (
                  <p className="empty-state">No votes recorded</p>
                )}

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      // Set flag first to stop polling immediately
                      setIsCreatingNew(true);
                      // Use setTimeout to ensure state updates before clearing poll
                      setTimeout(() => {
                        setPoll(null);
                        setVoterName("");
                        setVoteValue("");
                        setCurrentCreator("");
                        localStorage.removeItem("pollCreator");
                        setError("");
                        setSuccess("");
                        // Auto-populate creator name with saved voter name
                        const savedVoterName =
                          localStorage.getItem("voterName");
                        if (savedVoterName) {
                          setCreatedBy(savedVoterName);
                        }
                      }, 0);
                    }}
                  >
                    Create New Poll
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
