import React, { useState } from 'react';
import { Input, Checkbox, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './styles.scss';

const TeamMemberSelect = ({ open, onClose, onSelect, selectedMembers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(selectedMembers);

  const teamMembers = [
    { id: 1, name: 'Fitclub (Myself)', email: 'saurabh@bellatorgroup.in', avatar: '/avatar1.png' },
    { id: 2, name: 'Unassigned', email: '', avatar: null },
    { id: 3, name: 'Aditi Soni', email: 'aditisoni6214@gmail.com', avatar: '/avatar3.png' },
    { id: 4, name: 'Amit Singh Dahiya', email: 'amit.d@fitclub.in', avatar: '/avatar4.png' },
    { id: 5, name: 'Ayushi', email: 'ayushi.02603@gmail.com', avatar: null },
    { id: 6, name: 'Dhun', email: 'dhunmehra17@gmail.com', avatar: null },
    { id: 7, name: 'Himanshu Sharma', email: 'hs933964@gmail.com', avatar: null },
    { id: 8, name: 'Lakshay Makkar', email: 'lakshay44m@gmail.com', avatar: null },
    { id: 9, name: 'Lalit Kumar', email: 'lalit@fitclub.in', avatar: null },
    { id: 10, name: 'Mohit Kumar', email: 'mohit@fitclub.in', avatar: null },
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (memberId) => {
    setSelected(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleDone = () => {
    if (onSelect) {
      onSelect(selected);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="team-member-select-overlay" onClick={onClose}>
      <div className="team-member-select" onClick={(e) => e.stopPropagation()}>
        <div className="search-section">
          <Input
            placeholder="Search team members"
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="members-list">
          {filteredMembers.map(member => (
            <div 
              key={member.id} 
              className="member-item"
              onClick={() => handleToggle(member.id)}
            >
              <div className="member-info">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="member-details">
                  <div className="member-name">{member.name}</div>
                  {member.email && <div className="member-email">{member.email}</div>}
                </div>
              </div>
              <Checkbox 
                checked={selected.includes(member.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleToggle(member.id)}
              />
            </div>
          ))}
        </div>

        <div className="done-section">
          <Button type="primary" block size="large" onClick={handleDone}>
            DONE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberSelect;
