import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './styles.scss';

interface AddButtonProps {
  to?:       string;
  onClick?:  () => void;
  children?: React.ReactNode;
  [key: string]: any;
}

const AddButton = ({ to, children, onClick, ...props }: AddButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick)   onClick();
    else if (to)   navigate(to);
  };

  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      className="common-add-btn"
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AddButton;
