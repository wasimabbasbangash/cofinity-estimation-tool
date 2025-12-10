import React, { useEffect, useRef } from "react";
import "./Timer.css";

const Timer = ({ timeRemaining, timerActive }) => {
  const audioContextRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const timeRemainingRef = useRef(timeRemaining);

  useEffect(() => {
    // Initialize and resume audio context when timer becomes active
    if (timerActive && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    // Resume audio context if suspended (browser autoplay policy)
    if (
      timerActive &&
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      audioContextRef.current.resume();
    }

    return () => {
      // Cleanup when component unmounts
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [timerActive]);

  // Update ref whenever timeRemaining changes
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    // Clear any existing interval
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

    // Play tick every second when timer is active
    if (timerActive && timeRemaining !== null && timeRemaining > 0) {
      // Play first tick immediately
      playTick(timeRemaining);

      // Then play every second using ref to get latest value
      tickIntervalRef.current = setInterval(() => {
        const currentTime = timeRemainingRef.current;
        if (currentTime > 0) {
          playTick(currentTime);
        } else {
          // Stop interval when time reaches 0
          if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
          }
        }
      }, 1000);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [timerActive, timeRemaining]);

  const playTick = (timeLeft) => {
    if (!audioContextRef.current || timeLeft <= 0) return;

    const ctx = audioContextRef.current;

    // Resume if suspended
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        playTickSound(ctx, timeLeft);
      });
    } else {
      playTickSound(ctx, timeLeft);
    }
  };

  const playTickSound = (ctx, timeLeft) => {
    try {
      // Create tick sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Simple tick sound - consistent frequency
      oscillator.frequency.value = 1000;
      oscillator.type = "sine";

      // Louder ticks in last 10 seconds
      const volume = timeLeft <= 10 ? 0.3 : 0.2;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (err) {
      console.error("Error playing tick sound:", err);
    }
  };

  if (!timerActive && timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Determine color based on time remaining
  const getColor = () => {
    if (timeRemaining <= 5) return "#dc3545"; // Red
    if (timeRemaining <= 10) return "#ffc107"; // Yellow/Warning
    return "#007bff"; // Blue
  };

  return (
    <div className="timer-container">
      <div
        className="timer-display"
        style={{
          color: getColor(),
          borderColor: getColor(),
        }}
      >
        <div className="timer-icon">⏱️</div>
        <div className="timer-digits">
          {minutes > 0 && (
            <>
              <span className="digit">{minutes}</span>
              <span className="colon">:</span>
            </>
          )}
          <span className="digit">{seconds.toString().padStart(2, "0")}</span>
        </div>
        <div className="timer-label">seconds remaining</div>
      </div>
      {timeRemaining === 0 && (
        <div className="timer-expired">⏰ Time's up!</div>
      )}
    </div>
  );
};

export default Timer;
