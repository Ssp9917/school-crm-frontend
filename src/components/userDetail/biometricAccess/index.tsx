import { useParams } from 'react-router-dom';
import BiometricAccessSection from '../../biometricAccessSection';

const UserBiometricAccess = () => {
  const { id } = useParams<{ id: string }>();

  return <BiometricAccessSection userId={id} />;
};

export default UserBiometricAccess;
