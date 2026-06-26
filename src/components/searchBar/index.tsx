import React, { useState } from "react";
import { Button, Input } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import "./styles.scss";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleClose = () => {
    onChange("");
    setSearchExpanded(false);
  };

  return (
    <div className={`search-bar-container ${searchExpanded ? 'expanded' : ''}`}>
      {!searchExpanded ? (
        <Button
          icon={<SearchOutlined />}
          className="search-icon-btn"
          onClick={() => setSearchExpanded(true)}
        />
      ) : (
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          suffix={
            <CloseOutlined 
              onClick={handleClose}
              style={{ cursor: 'pointer', color: 'var(--muted)' }}
            />
          }
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

export default SearchBar;
