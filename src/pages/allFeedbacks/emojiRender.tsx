import React from "react";
import GoodSmileIcon from "../../assets/svg/goodSmile";
import BadSmileIcon from "../../assets/svg/badSmile";
import NeutralSmileIcon from "../../assets/svg/neutralIcon";

type EmojiType = 'staffBehavior' | 'gymHygiene';

const SVG_MAP: Record<number, React.ReactNode> = {
  1: <GoodSmileIcon />,
  2: <NeutralSmileIcon />,
  3: <BadSmileIcon />,
};

export function renderEmojiCell(
  value: string | number | Record<string, unknown> | undefined | null,
  type:  EmojiType,
) {
  if (!value) return null;
  const raw = typeof value === 'object'
    ? (type === 'gymHygiene' ? (value as any).gymHygiene : (value as any).staffBehavior)
    : value;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '-1rem' }}>
      {SVG_MAP[Number(raw)] ?? '-'}
    </div>
  );
}
