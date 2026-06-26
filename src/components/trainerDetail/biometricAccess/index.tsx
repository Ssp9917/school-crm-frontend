import { useOutletContext, useParams } from 'react-router-dom';
import BiometricAccessSection from '../../biometricAccessSection';

const TrainerBiometricAccess = () => {
  const { id } = useParams<{ id: string }>();
  const { trainer } = useOutletContext<{ trainer: any }>() || {};
  const userId = trainer?.user?._id || id;

  return <BiometricAccessSection userId={userId} />;
};

export default TrainerBiometricAccess;
