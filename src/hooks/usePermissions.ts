import { useMemo } from 'react';
import { useSiderMenuQuery } from '../services/permissions';

interface Permission {
  key?: string;
  permission?: string;
}

interface SiderData {
  userType?: string;
  permissions?: Permission[];
}

const usePermissions = () => {
  const { data: siderData } = useSiderMenuQuery(undefined) as { data?: SiderData };
  const isSuperAdmin = siderData?.userType === 'SUPERADMIN';

  const { permKeys, permStrings } = useMemo(() => {
    if (!siderData?.permissions) return { permKeys: null, permStrings: null };
    const perms = siderData.permissions;
    return {
      permKeys:    new Set(perms.map(p => p.key)),
      permStrings: new Set(perms.map(p => p.permission)),
    };
  }, [siderData]);

  const hasPermission = (keyOrPermission: string): boolean => {
    if (!keyOrPermission) return true;
    if (!permKeys)        return true;
    if (isSuperAdmin)     return true;
    return permKeys.has(keyOrPermission) || (permStrings?.has(keyOrPermission) ?? false);
  };

  return { hasPermission, permissionsLoaded: !!siderData };
};

export default usePermissions;
