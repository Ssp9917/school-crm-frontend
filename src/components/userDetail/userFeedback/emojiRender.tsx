import React from "react";
import GoodSmileIcon from "../../../assets/svg/goodSmile"
import BadSmileIcon from "../../../assets/svg/badSmile"
import NeutralSmileIcon from "../../../assets/svg/neutralIcon"
export function renderEmojiCell(value, type) {
  if (!value) return null;
  // Accept both direct value or object
  const val = typeof value === 'object' ? (type === 'gymHygiene' ? value.gymHygiene : value.staffBehavior) : value;
  const svgObj = {
    1: <GoodSmileIcon/>,
    2: <NeutralSmileIcon/>,
    3: <BadSmileIcon/>,
  };
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '-1rem' }}>{svgObj[val] || '-'}</div>;
}
