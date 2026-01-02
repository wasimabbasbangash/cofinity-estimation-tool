import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import {
  adventurer,
  avataaars,
  bottts,
  funEmoji,
  lorelei,
  personas,
  openPeeps,
} from "@dicebear/collection";

// Generate avatar options using different DiceBear styles
const generateAvatarOptions = () => {
  const styles = [
    { name: "adventurer", style: adventurer },
    { name: "avataaars", style: avataaars },
    { name: "bottts", style: bottts },
    { name: "funEmoji", style: funEmoji },
    { name: "lorelei", style: lorelei },
    { name: "personas", style: personas },
    { name: "openPeeps", style: openPeeps },
  ];

  const avatars = [];
  // Generate 24 avatars (mix of different styles)
  const seeds = [
    "alice",
    "bob",
    "charlie",
    "diana",
    "eve",
    "frank",
    "grace",
    "henry",
    "ivy",
    "jack",
    "kate",
    "liam",
    "mia",
    "noah",
    "olivia",
    "paul",
    "quinn",
    "ruby",
    "sam",
    "tina",
    "uma",
    "vince",
    "willa",
    "xander",
  ];

  for (let i = 0; i < 24; i++) {
    const styleIndex = i % styles.length;
    const style = styles[styleIndex];
    const seed = seeds[i] || `avatar-${i}`;

    const avatar = createAvatar(style.style, {
      seed: seed,
      size: 128,
    });

    avatars.push({
      index: i,
      svg: avatar.toDataUri(),
      styleName: style.name,
      seed: seed,
    });
  }

  return avatars;
};

const AvatarPicker = ({
  selectedAvatar,
  onSelectAvatar,
  showPicker,
  onToggle,
}) => {
  const avatarOptions = useMemo(() => generateAvatarOptions(), []);

  const getSelectedAvatarImage = () => {
    if (selectedAvatar !== null && selectedAvatar !== undefined) {
      const avatar = avatarOptions[selectedAvatar];
      if (avatar) {
        return avatar.svg;
      }
    }
    return null;
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <label style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>
          Your Avatar:
        </label>
        <div
          className="avatar-display"
          onClick={onToggle}
          style={{ cursor: "pointer" }}
        >
          {getSelectedAvatarImage() ? (
            <img
              src={getSelectedAvatarImage()}
              alt="Selected avatar"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            >
              👤
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          className="secondary"
        >
          {showPicker ? "Close" : "Change Avatar"}
        </button>
      </div>

      {showPicker && (
        <div className="avatar-picker">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.index}
              className={`avatar-option ${
                selectedAvatar === avatar.index ? "selected" : ""
              }`}
              onClick={() => {
                onSelectAvatar(avatar.index);
                onToggle();
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src={avatar.svg}
                alt={`Avatar ${avatar.index}`}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
