import { Card } from 'antd';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import {
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ThunderboltOutlined,
  LockOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import './styles.scss';

interface UserOutletContext {
  userData?: {
    hasMembership?: boolean;
  };
}

interface Service {
  id: number;
  name: string;
  value: string;
  icon: React.ReactNode;
  requiresMembership: boolean;
}

const services: Service[] = [
  { id: 1, name: 'Personal Training', value: 'personal-training', icon: <UserOutlined />,         requiresMembership: true  },
  { id: 2, name: 'Pilates',           value: 'pilates',           icon: <HeartOutlined />,         requiresMembership: false },
  { id: 3, name: 'Therapy',           value: 'therapy',           icon: <MedicineBoxOutlined />,   requiresMembership: false },
  { id: 4, name: 'EMS',               value: 'ems',               icon: <ThunderboltOutlined />,   requiresMembership: false },
  { id: 5, name: 'Paid Locker',       value: 'paid-locker',       icon: <LockOutlined />,          requiresMembership: true  },
  { id: 6, name: 'MMA',               value: 'mma',               icon: <TrophyOutlined />,        requiresMembership: false },
];

const SelectAddOnService = () => {
  const navigate          = useNavigate();
  const { id }            = useParams<{ id: string }>();
  const { userData }      = useOutletContext<UserOutletContext>();

  const filteredServices = services.filter(s => !s.requiresMembership || userData?.hasMembership);

  return (
    <div className="select-addon-service-container">
      <h3 className="section-title">Select Add-On Service</h3>
      <div className="service-grid">
        {filteredServices.map(service => (
          <Card
            key={service.id}
            className="service-card"
            hoverable
            onClick={() => navigate(`/user-detail/${id}/buy-addon-service?type=${service.value}`)}
          >
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-name">{service.name}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SelectAddOnService;
