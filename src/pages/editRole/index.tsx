import { useState, useMemo, useEffect, startTransition } from "react";
import { Form, Input, Button, Checkbox, Select, notification } from "antd";
import { DeleteOutlined, HomeOutlined, SearchOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useSiderMenuQuery } from "../../services/permissions";
import { useGetRoleByIdQuery, useUpdateRoleMutation } from "../../services/role";
import { AllRolesRoute, Home } from "../../routes/routepath";
import PageBreadcrumb from "../../components/breadcrumb";
import { useParams, useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Permission {
  key:         string;
  displayName: string;
  permission:  string;
}

interface SubGroup {
  name:        string;
  key:         string;
  permissions: Permission[];
}

interface FlatCategory {
  type:        'flat';
  permissions: Permission[];
}

interface NestedCategory {
  type:      'nested';
  subGroups: SubGroup[];
}

type Category          = FlatCategory | NestedCategory;
type GroupedPermissions = Record<string, Category>;

/* ─── Constants ──────────────────────────────────────────────────────── */

const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ label: `Level ${n}`, value: n }));

const DETAIL_MENU_MERGE_MAP: { apiKey: string; mergeInto: string; namePrefix: string | null }[] = [
  { apiKey: 'userDetailMenu',         mergeInto: 'User Management',    namePrefix: null          },
  { apiKey: 'employeeDetailMenu',     mergeInto: 'Employee Management', namePrefix: 'Employee'    },
  { apiKey: 'trainerDetailMenu',      mergeInto: 'Employee Management', namePrefix: 'Trainer'     },
  { apiKey: 'generalStaffDetailMenu', mergeInto: 'Employee Management', namePrefix: 'General Staff' },
  { apiKey: 'directorDetailMenu',     mergeInto: 'Directors',           namePrefix: null          },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

const formatAction = (action: string): string =>
  action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/* ─── Component ──────────────────────────────────────────────────────── */

const EditRole = () => {
  const [form]   = Form.useForm();
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: menuData }                          = useSiderMenuQuery(undefined);
  const { data: roleData, isLoading: loadingRole }  = useGetRoleByIdQuery(id as any);
  const [updateRole, { isLoading: updating }]       = useUpdateRoleMutation();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearch,           setPermSearch]          = useState('');

  useEffect(() => {
    if (menuData && !hasPermission('3-edit')) {
      navigate(AllRolesRoute, { replace: true });
    }
  }, [menuData, hasPermission, navigate]);

  /* ── Build grouped permissions from API menu ── */

  const groupedPermissions = useMemo<GroupedPermissions>(() => {
    const menu: any = (menuData as any)?.menu;
    if (!Array.isArray(menu)) return {};

    const grouped: GroupedPermissions = {};

    menu.forEach((menuItem: any) => {
      const category: string = menuItem.name;

      if (menuItem.children?.length > 0) {
        const subGroups: SubGroup[] = menuItem.children
          .filter((child: any) => child.permissions?.length > 0)
          .map((child: any) => ({
            name:        child.name,
            key:         child.key,
            permissions: child.permissions.map((perm: any) => ({
              key:         perm.key,
              displayName: formatAction(perm.action),
              permission:  perm.permission,
            })),
          }));

        if (subGroups.length > 0) {
          grouped[category] = { type: 'nested', subGroups };
        }
      } else {
        const permissions: Permission[] = (menuItem.permissions || []).map((perm: any) => ({
          key:         perm.key,
          displayName: formatAction(perm.action),
          permission:  perm.permission,
        }));
        if (permissions.length > 0) {
          grouped[category] = { type: 'flat', permissions };
        }
      }
    });

    DETAIL_MENU_MERGE_MAP.forEach(({ apiKey, mergeInto, namePrefix }) => {
      const items: any[] = (menuData as any)?.[apiKey];
      if (!Array.isArray(items) || !items.length) return;

      const newSubGroups: SubGroup[] = items
        .filter((item: any) => item.permissions?.length > 0)
        .map((item: any) => {
          const mainPerms: Permission[] = (item.permissions || []).map((perm: any) => ({
            key:         perm.key,
            displayName: formatAction(perm.action),
            permission:  perm.permission,
          }));

          const subActionPerms: Permission[] = (item.subActions || []).flatMap((sa: any) =>
            (sa.permissions || []).map((perm: any) => ({
              key:         perm.key,
              displayName: sa.permissions.length > 1 ? `${sa.name}: ${formatAction(perm.action)}` : sa.name,
              permission:  perm.permission,
            }))
          );

          return {
            name:        namePrefix ? `${namePrefix}: ${item.name}` : item.name,
            key:         item.key,
            permissions: [...mainPerms, ...subActionPerms],
          };
        });

      if (!newSubGroups.length) return;

      const existing = grouped[mergeInto];
      if (existing) {
        if (existing.type === 'nested') {
          grouped[mergeInto] = { ...existing, subGroups: [...existing.subGroups, ...newSubGroups] };
        } else {
          grouped[mergeInto] = {
            type:      'nested',
            subGroups: [
              { name: mergeInto, key: `${mergeInto}-main`, permissions: existing.permissions },
              ...newSubGroups,
            ],
          };
        }
      } else {
        grouped[mergeInto] = { type: 'nested', subGroups: newSubGroups };
      }
    });

    return grouped;
  }, [menuData]);

  /* ── Populate form from loaded role ── */

  useEffect(() => {
    const rd: any = roleData;
    if (rd?.success && rd?.data) {
      const { role, permissions } = rd.data;
      form.setFieldsValue({ name: role?.name || '', level: role?.level || null });
      startTransition(() => {
        setSelectedPermissions(Array.isArray(permissions) ? permissions.map((p: any) => p.key) : []);
      });
    }
  }, [roleData, form]);

  /* ── Filtered permissions for search ── */

  const filteredPermissions = useMemo<GroupedPermissions>(() => {
    const q = permSearch.trim().toLowerCase();
    if (!q) return groupedPermissions;

    const result: GroupedPermissions = {};
    Object.entries(groupedPermissions).forEach(([category, catData]) => {
      if (category.toLowerCase().includes(q)) {
        result[category] = catData;
        return;
      }
      if (catData.type === 'flat') {
        const perms = catData.permissions.filter(p => p.displayName.toLowerCase().includes(q));
        if (perms.length) result[category] = { type: 'flat', permissions: perms };
      } else {
        const subGroups = catData.subGroups
          .map(sg => {
            if (sg.name.toLowerCase().includes(q)) return sg;
            const perms = sg.permissions.filter(p => p.displayName.toLowerCase().includes(q));
            return perms.length ? { ...sg, permissions: perms } : null;
          })
          .filter((sg): sg is SubGroup => sg !== null);
        if (subGroups.length) result[category] = { type: 'nested', subGroups };
      }
    });
    return result;
  }, [groupedPermissions, permSearch]);

  /* ── Category / subgroup selection helpers ── */

  const getAllCategoryKeys = (category: string): string[] => {
    const cat = groupedPermissions[category];
    if (!cat) return [];
    if (cat.type === 'flat') return cat.permissions.map(p => p.key);
    return cat.subGroups.flatMap(sg => sg.permissions.map(p => p.key));
  };

  const isCategorySelected      = (category: string) => { const keys = getAllCategoryKeys(category); return keys.length > 0 && keys.every(k => selectedPermissions.includes(k)); };
  const isCategoryIndeterminate = (category: string) => { const keys = getAllCategoryKeys(category); const n = keys.filter(k => selectedPermissions.includes(k)).length; return n > 0 && n < keys.length; };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const keys = getAllCategoryKeys(category);
    if (checked) setSelectedPermissions(prev => [...new Set([...prev, ...keys])]);
    else         setSelectedPermissions(prev => prev.filter(k => !keys.includes(k)));
  };

  const isSubGroupSelected      = (sg: SubGroup) => { const keys = sg.permissions.map(p => p.key); return keys.length > 0 && keys.every(k => selectedPermissions.includes(k)); };
  const isSubGroupIndeterminate = (sg: SubGroup) => { const keys = sg.permissions.map(p => p.key); const n = keys.filter(k => selectedPermissions.includes(k)).length; return n > 0 && n < keys.length; };

  const handleSubGroupChange = (sg: SubGroup, checked: boolean) => {
    const keys = sg.permissions.map(p => p.key);
    if (checked) setSelectedPermissions(prev => [...new Set([...prev, ...keys])]);
    else         setSelectedPermissions(prev => prev.filter(k => !keys.includes(k)));
  };

  const handlePermissionChange = (permKey: string, checked: boolean) => {
    if (checked) setSelectedPermissions(prev => [...new Set([...prev, permKey])]);
    else         setSelectedPermissions(prev => prev.filter(k => k !== permKey));
  };

  /* ── Form handlers ── */

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message:     'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement:   'topRight',
      duration:    4,
    });
  };

  const onFinish = async (values: Record<string, any>) => {
    try {
      const permissionObjects = selectedPermissions.map(permKey => {
        for (const category in groupedPermissions) {
          const cat = groupedPermissions[category];
          if (cat.type === 'flat') {
            const found = cat.permissions.find(p => p.key === permKey);
            if (found) return { key: found.key, label: found.displayName, permission: found.permission };
          } else {
            for (const sg of cat.subGroups) {
              const found = sg.permissions.find(p => p.key === permKey);
              if (found) return { key: found.key, label: `${sg.name} — ${found.displayName}`, permission: found.permission };
            }
          }
        }
        return null;
      }).filter(Boolean);

      await (updateRole as any)({ id, name: values.name, permissions: permissionObjects }).unwrap();
      navigate(AllRolesRoute);
    } catch {
      // RTK Query handles the error
    }
  };

  const handleReset = () => {
    const rd: any = roleData;
    if (rd?.success && rd?.data) {
      const { role, permissions } = rd.data;
      form.setFieldsValue({ name: role?.name || '', level: role?.level || null });
      setSelectedPermissions(Array.isArray(permissions) ? permissions.map((p: any) => p.key) : []);
    } else {
      form.resetFields();
      setSelectedPermissions([]);
    }
  };

  if (loadingRole) {
    return <div className="add-role-page">Loading role data...</div>;
  }

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: 'All Roles',     to: AllRolesRoute },
    { label: 'Edit Role' },
  ];

  return (
    <div className="add-role-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Edit Role</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <Form form={form} layout="vertical" className="role-form" onFinish={onFinish} onFinishFailed={onFinishFailed as any}>
        <div className="row">
          <Form.Item label="Role Name" name="name" rules={[{ required: true, message: 'Please enter role name' }]}>
            <Input placeholder="Role Name" />
          </Form.Item>
          <Form.Item label="Level" name="level">
            <Select placeholder="Select Level" options={LEVEL_OPTIONS} />
          </Form.Item>
        </div>

        <div className="permissions-section">
          <div className="permissions-section-header">
            <h3 className="permissions-title">Permissions</h3>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search permissions..."
              value={permSearch}
              onChange={e => setPermSearch(e.target.value)}
              allowClear
              className="permissions-search"
            />
          </div>

          {Object.entries(filteredPermissions).map(([category, catData]) => (
            <div key={category} className="permission-category">
              <div className="category-header">
                <Checkbox
                  checked={isCategorySelected(category)}
                  indeterminate={isCategoryIndeterminate(category)}
                  onChange={e => handleCategoryChange(category, e.target.checked)}
                >
                  <span className="category-name">{category}</span>
                </Checkbox>
              </div>

              {catData.type === 'flat' ? (
                <div className="permission-items">
                  {catData.permissions.map(perm => (
                    <Checkbox
                      key={perm.key}
                      checked={selectedPermissions.includes(perm.key)}
                      onChange={e => handlePermissionChange(perm.key, e.target.checked)}
                    >
                      <span className="permission-name">{perm.displayName}</span>
                    </Checkbox>
                  ))}
                </div>
              ) : (
                <div className="permission-sub-groups">
                  {catData.subGroups.map(subGroup => (
                    <div key={subGroup.key} className="permission-sub-group">
                      <div className="sub-group-header">
                        <Checkbox
                          checked={isSubGroupSelected(subGroup)}
                          indeterminate={isSubGroupIndeterminate(subGroup)}
                          onChange={e => handleSubGroupChange(subGroup, e.target.checked)}
                        >
                          <span className="sub-group-name">{subGroup.name}</span>
                        </Checkbox>
                      </div>
                      <div className="permission-items">
                        {subGroup.permissions.map(perm => (
                          <Checkbox
                            key={perm.key}
                            checked={selectedPermissions.includes(perm.key)}
                            onChange={e => handlePermissionChange(perm.key, e.target.checked)}
                          >
                            <span className="permission-name">{perm.displayName}</span>
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="footer-buttons">
          <Button className="delete-btn" onClick={handleReset}>
            <DeleteOutlined /> RESET
          </Button>
          {hasPermission('3-edit') && (
            <Button className="save-btn" type="primary" htmlType="submit" loading={updating}>
              UPDATE
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default EditRole;
