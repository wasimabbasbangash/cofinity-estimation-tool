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
  const [roomCode, setRoomCode] = useState(null); // Room code from URL
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false); // Track if user has joined/created a room
  const [showJoinForm, setShowJoinForm] = useState(false); // Show join room form
  const [joinRoomCode, setJoinRoomCode] = useState(""); // Room code input for joining

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

  // Helper function to generate room code (matches backend)
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Extract room code from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/room\/([A-Z0-9]{6})/);
    if (match) {
      const code = match[1];
      setRoomCode(code);
      setHasJoinedRoom(true); // User is in a room via URL
    } else {
      // No room code in URL - show landing page
      setHasJoinedRoom(false);
      setRoomCode(null);
    }
  }, []);

  // Get current room URL
  const getRoomUrl = () => {
    return `${window.location.origin}/room/${roomCode}`;
  };

  // Copy room link to clipboard
  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(getRoomUrl());
      setSuccess("Room link copied to clipboard!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        "Failed to copy link. Please copy manually from the address bar."
      );
    }
  };

  // Create a new room
  const handleCreateRoom = () => {
    const newRoomCode = generateRoomCode();
    const newPath = `/room/${newRoomCode}`;
    window.history.pushState({}, "", newPath);
    setRoomCode(newRoomCode);
    setHasJoinedRoom(true);
    setShowJoinForm(false);
    setJoinRoomCode("");
  };

  // Join an existing room
  const handleJoinRoom = async () => {
    setError("");
    setSuccess("");

    const code = joinRoomCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError("Room code must be 6 characters");
      return;
    }

    // Validate room code format (alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError("Room code must contain only letters and numbers");
      return;
    }

    // Room code format is valid, allow joining
    // (Room may or may not have a poll yet - that's fine)
    const newPath = `/room/${code}`;
    window.history.pushState({}, "", newPath);
    setRoomCode(code);
    setHasJoinedRoom(true);
    setShowJoinForm(false);
    setJoinRoomCode("");
    setSuccess("Joined room successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Leave current room and return to landing page
  const handleLeaveRoom = () => {
    window.history.pushState({}, "", "/");
    setRoomCode(null);
    setHasJoinedRoom(false);
    setPoll(null);
    setError("");
    setSuccess("");
  };

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

    // Load avatar from localStorage, or assign a random default if none exists
    const savedAvatar = localStorage.getItem("voterAvatar");
    if (savedAvatar !== null && savedAvatar !== "") {
      const avatarIndex = parseInt(savedAvatar, 10);
      if (!isNaN(avatarIndex) && avatarIndex >= 0 && avatarIndex < 24) {
        setSelectedAvatar(avatarIndex);
      } else {
        // Invalid avatar index, assign a random default
        const randomAvatar = Math.floor(Math.random() * 24);
        setSelectedAvatar(randomAvatar);
        localStorage.setItem("voterAvatar", randomAvatar.toString());
      }
    } else {
      // No saved avatar, assign a random default
      const randomAvatar = Math.floor(Math.random() * 24);
      setSelectedAvatar(randomAvatar);
      localStorage.setItem("voterAvatar", randomAvatar.toString());
    }
  }, []);

  // Fetch poll when room code is available
  useEffect(() => {
    if (roomCode) {
      fetchPoll();
    }
  }, [roomCode]);

  useEffect(() => {
    // Poll for updates every second, but only if a poll exists
    // If no poll exists, poll less frequently (every 5 seconds)
    if (!roomCode) return;

    const pollInterval = poll ? 1000 : 5000; // Poll every 1s if poll exists, 5s if not

    const interval = setInterval(() => {
      if (!isCreatingNew) {
        fetchPoll();
        if (poll && poll.status === "open") {
          fetchTimer();
        }
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [isCreatingNew, poll, roomCode]);

  const fetchTimer = async () => {
    if (!poll || poll.status !== "open" || !roomCode) return;

    try {
      const response = await fetch(
        `${API_BASE}/poll/timer?roomCode=${roomCode}`
      );
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
    // Don't fetch if we're creating a new poll or no room code
    if (isCreatingNew || !roomCode) return;

    try {
      const response = await fetch(`${API_BASE}/poll?roomCode=${roomCode}`);
      if (response.status === 404) {
        // 404 is expected when no poll exists - this is normal, not an error
        setPoll(null);
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch poll");
      const data = await response.json();
      setPoll(data);
      setLoading(false);
    } catch (err) {
      // Only show error if it's not a network error and not a 404
      if (
        err.message !== "Failed to fetch poll" &&
        !err.message.includes("404")
      ) {
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
          roomCode: roomCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create poll");
      }

      const data = await response.json();
      setPoll(data.poll);
      // Update room code if server generated a new one
      if (data.roomCode && data.roomCode !== roomCode) {
        setRoomCode(data.roomCode);
        window.history.replaceState({}, "", `/room/${data.roomCode}`);
      }
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
      setSuccess("Poll created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      // Re-enable polling after a short delay to ensure new poll is saved
      setTimeout(() => {
        setIsCreatingNew(false);
        fetchPoll();
      }, 100);
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
          roomCode: roomCode,
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
          roomCode: roomCode,
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
          roomCode: roomCode,
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

  // Show landing page if user hasn't joined a room
  if (!hasJoinedRoom) {
    return (
      <div className="app-wrapper">
        <nav className="navbar">
          <h1 className="navbar-title">Dos Ticket Estimator</h1>
        </nav>
        <div className="container">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
              Welcome to Ticket Estimator
            </h2>

            {!showJoinForm ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <button
                  onClick={handleCreateRoom}
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  🆕 Create New Room
                </button>
                <button
                  onClick={() => setShowJoinForm(true)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#000",
                  }}
                >
                  🔗 Join Existing Room
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label htmlFor="joinRoomCode">Enter Room Code</label>
                  <input
                    type="text"
                    id="joinRoomCode"
                    value={joinRoomCode}
                    onChange={(e) =>
                      setJoinRoomCode(e.target.value.toUpperCase())
                    }
                    placeholder="ABC123"
                    maxLength={6}
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: "1.2rem",
                      textAlign: "center",
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleJoinRoom();
                      }
                    }}
                  />
                  <small style={{ display: "block", marginTop: "5px" }}>
                    Enter the 6-character room code shared with you
                  </small>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={handleJoinRoom}
                    style={{ flex: 1, color: "#000" }}
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinRoomCode("");
                      setError("");
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#000",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!roomCode || loading) {
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
        {roomCode && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)" }}
            >
              Room: <strong>{roomCode}</strong>
            </span>
            <button
              onClick={copyRoomLink}
              style={{
                padding: "6px 12px",
                fontSize: "0.85rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              📋 Copy Link
            </button>
            <button
              onClick={handleLeaveRoom}
              style={{
                padding: "6px 12px",
                fontSize: "0.85rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              🚪 Leave Room
            </button>
          </div>
        )}
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

            {/* Timer Display (only for creator) */}
            {poll.status === "open" &&
              isCreator &&
              timerActive &&
              timeRemaining > 0 && (
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

            {/* Close Poll Button (only for creator) */}
            {poll.status === "open" && isCreator && (
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
                      ? isCreator
                        ? "⏰ Time's up! Voting has ended. Use the buttons above to restart the timer."
                        : "⏰ Time's up! Voting has ended. Creator can restart the timer."
                      : isCreator
                      ? "⏱️ Start the timer using the buttons above to enable voting for participants."
                      : "⏳ Waiting for the creator to start the timer..."}
                  </div>
                )}

                {/* Avatar Selection */}
                <AvatarPicker
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={(avatarIndex) => {
                    setSelectedAvatar(avatarIndex);
                    // Save to localStorage when avatar is changed
                    localStorage.setItem("voterAvatar", avatarIndex.toString());
                  }}
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
                      // Clear poll state and reset form
                      setPoll(null);
                      setVoterName("");
                      setVoteValue("");
                      setCurrentCreator("");
                      localStorage.removeItem("pollCreator");
                      setError("");
                      setSuccess("");
                      setTimerActive(false);
                      setTimeRemaining(null);
                      // Auto-populate creator name with saved voter name
                      const savedVoterName = localStorage.getItem("voterName");
                      if (savedVoterName) {
                        setCreatedBy(savedVoterName);
                      }
                      // Keep isCreatingNew true - it will be set to false when new poll is created
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
