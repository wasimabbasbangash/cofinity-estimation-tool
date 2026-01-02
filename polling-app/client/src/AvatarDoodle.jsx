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

// Generate the same avatar options as in AvatarPicker
const generateAvatarForIndex = (index) => {
  const styles = [
    { name: "adventurer", style: adventurer },
    { name: "avataaars", style: avataaars },
    { name: "bottts", style: bottts },
    { name: "funEmoji", style: funEmoji },
    { name: "lorelei", style: lorelei },
    { name: "personas", style: personas },
    { name: "openPeeps", style: openPeeps },
  ];

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

  if (index === null || index === undefined || index < 0 || index >= 24) {
    return null;
  }

  const styleIndex = index % styles.length;
  const style = styles[styleIndex];
  const seed = seeds[index] || `avatar-${index}`;

  const avatar = createAvatar(style.style, {
    seed: seed,
    size: 128,
  });

  return avatar.toDataUri();
};

const AvatarDoodle = ({ index }) => {
  const avatarImage = useMemo(() => generateAvatarForIndex(index), [index]);

  if (!avatarImage) {
    return <span style={{ fontSize: "1.5rem" }}>👤</span>;
  }

  return (
    <img
      src={avatarImage}
      alt={`Avatar ${index}`}
      style={{
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  );
};

export default AvatarDoodle;
