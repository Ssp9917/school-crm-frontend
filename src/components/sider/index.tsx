import { Menu } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logo, whiteLogo } from "../../assets";
import { useTheme } from "../../context/ThemeContext";
import { useSiderMenuQuery } from "../../services/permissions";
import * as AntIcons from "@ant-design/icons";
import permissionsSchema from "../../../permissions-schema.json";
import "./sider.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface MenuItem {
  key: string;
  name?: string;
  label?: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  permissions?: { key: string }[];
}

interface SiderComponentProps {
  collapsed: boolean;
}

/* ─── Icon helper ────────────────────────────────────────────────────── */

const getIconComponent = (iconName?: string): React.ReactElement | null => {
  if (!iconName) return null;
  const IconComponent = (AntIcons as unknown as Record<string, React.ComponentType>)[iconName];
  return IconComponent ? <IconComponent /> : null;
};

/** Fallback icons by menu key — used when the menu data (API or schema) has no icon. */
const MENU_ICON_BY_KEY: Record<string, string> = {
  // parents
  '1': 'PieChartOutlined', '2': 'UserOutlined', '3': 'TeamOutlined', '4': 'CalendarOutlined',
  '5': 'SolutionOutlined', '8': 'TeamOutlined', '9': 'UserOutlined', '10': 'BarChartOutlined',
  '12': 'ShopOutlined', '13': 'SmileOutlined', '14': 'ShopOutlined', '16': 'GiftOutlined',
  '18': 'AppstoreOutlined', '21': 'MessageOutlined', '24': 'CreditCardOutlined', '26': 'MailOutlined',
  // children
  '9-1': 'UnorderedListOutlined', '9-10': 'IdcardOutlined', '9-3': 'UsergroupAddOutlined', '25': 'DashboardOutlined',
  '9-5': 'LoginOutlined', '9-6': 'AuditOutlined', '9-7': 'HistoryOutlined', '9-8': 'StopOutlined',
  '10-1': 'SolutionOutlined', '10-2': 'FileTextOutlined', '10-3': 'HistoryOutlined', '10-4': 'TeamOutlined',
  '10-5': 'LineChartOutlined', '10-6': 'ThunderboltOutlined',
  '8-1': 'TeamOutlined', '8-2': 'UsergroupAddOutlined', '8-3': 'SolutionOutlined',
  '4-1': 'CalendarOutlined', '4-2': 'CalendarOutlined', '4-3': 'CalendarOutlined', '4-4': 'CalendarOutlined', '4-5': 'CalendarOutlined',
  '5-1': 'UnorderedListOutlined',
  '12-1': 'UnorderedListOutlined', '12-2': 'AppstoreOutlined', '12-3': 'GiftOutlined',
  '13-1': 'ScheduleOutlined', '14-1': 'UnorderedListOutlined', '14-2': 'PlusCircleOutlined',
  '16-1': 'UnorderedListOutlined', '16-2': 'PlusCircleOutlined', '16-3': 'HistoryOutlined',
  '18-1': 'UnorderedListOutlined', '21-1': 'UnorderedListOutlined', '24-1': 'UnorderedListOutlined', '24-3': 'CreditCardOutlined',
  '26-1': 'UnorderedListOutlined',
};

/** Default icon when nothing else matches. */
const DEFAULT_MENU_ICON = 'AppstoreOutlined';

/** Keyword → icon, checked against the item's name when key-map has no match. Order matters (first hit wins). */
const NAME_ICON_RULES: [RegExp, string][] = [
  [/blacklist/i,           'StopOutlined'],
  [/session/i,             'ClockCircleOutlined'],
  [/request/i,             'MailOutlined'],
  [/dashboard/i,           'DashboardOutlined'],
  [/attendance/i,          'CalendarOutlined'],
  [/invoice/i,             'CreditCardOutlined'],
  [/coupon/i,              'GiftOutlined'],
  [/feedback/i,            'MessageOutlined'],
  [/inventory/i,           'AppstoreOutlined'],
  [/package|membership/i,  'ShopOutlined'],
  [/trainer/i,             'SolutionOutlined'],
  [/employee|staff|team/i, 'TeamOutlined'],
  [/lead|client/i,         'SolutionOutlined'],
  [/branch/i,              'ShopOutlined'],
  [/analytic/i,            'LineChartOutlined'],
  [/activity|log|history/i,'HistoryOutlined'],
  [/assessment/i,          'AuditOutlined'],
  [/biometric/i,           'SolutionOutlined'],
  [/director|role/i,       'UserOutlined'],
  [/user|member/i,         'UserOutlined'],
  [/^add\b|add /i,         'PlusCircleOutlined'],
  [/^all\b|all /i,         'UnorderedListOutlined'],
];

const iconByName = (name?: string): string | undefined => {
  if (!name) return undefined;
  for (const [re, icon] of NAME_ICON_RULES) if (re.test(name)) return icon;
  return undefined;
};

/** Resolve an icon: item's own icon → key-map → name keywords → generic default (never null). */
const resolveIcon = (item: MenuItem): React.ReactElement | null =>
  getIconComponent(item.icon)
  ?? getIconComponent(MENU_ICON_BY_KEY[item.key])
  ?? getIconComponent(iconByName(item.name || item.label))
  ?? getIconComponent(DEFAULT_MENU_ICON);

/* ─── Component ──────────────────────────────────────────────────────── */

const SiderComponent = ({ collapsed }: SiderComponentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [openKeys, setOpenKeys]   = useState<string[]>([]);

  const { data: siderData } = useSiderMenuQuery(undefined);

  const customLogo = (siderData as any)?.tenantBranding?.logo;
  const customName = (siderData as any)?.tenantBranding?.name;

  const menuData = useMemo((): MenuItem[] => {
    let menus: MenuItem[] = (siderData as any)?.menu || [];

    if (menus.length === 0 && ((siderData as any)?.permissions?.length ?? 0) > 0) {
      const permKeys = new Set<string>(
        ((siderData as any).permissions as { key: string }[]).map(p => p.key)
      );
      menus = (permissionsSchema as any).mainMenu
        .map((item: MenuItem) => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter(child =>
              (child.permissions || []).some(p => permKeys.has(p.key))
            );
            return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
          }
          const hasAccess = (item.permissions || []).some(p => permKeys.has(p.key));
          return hasAccess ? item : null;
        })
        .filter(Boolean) as MenuItem[];
    }

    const processed = menus.map(item => {
      if (item.key === "9") {
        const children = (item.children || []).filter(c => c.key !== "9-2");
        return { ...item, children };
      }
      return item;
    });

    const priorityKeys = ["3", "6"];
    const dashboard = processed.filter(i => i.key === "1");
    const priority  = processed.filter(i => priorityKeys.includes(i.key));
    const rest      = processed.filter(i => i.key !== "1" && !priorityKeys.includes(i.key));

    return [...dashboard, ...priority, ...rest];
  }, [siderData]);

  useEffect(() => {
    if (!menuData.length) return;
    const currentPath = location.pathname;
    let foundKey: string | null = null;
    let foundParentKey: string | null = null;

    for (const item of menuData) {
      if (item.route === currentPath) { foundKey = item.key; break; }
      if (item.children) {
        for (const child of item.children) {
          if (child.route === currentPath || (child.route && currentPath.startsWith(child.route))) {
            foundKey = child.key;
            foundParentKey = item.key;
            break;
          }
        }
        if (foundKey) break;
      }
    }

    if (foundKey) {
      setActiveKey(foundKey);
      if (foundParentKey) setOpenKeys([foundParentKey]);
    }
  }, [location.pathname, menuData]);

  const onOpenChange = (keys: string[]) => setOpenKeys(keys.slice(-1));

  const menuItems = useMemo(() => {
    if (!menuData.length) return [];

    return menuData.map(item => {
      const entry: Record<string, unknown> = {
        key:   item.key,
        icon:  resolveIcon(item),
        label: item.name || item.label,
        onClick: item.route ? () => navigate(item.route!) : undefined,
      };

      if (item.children && item.children.length > 0) {
        entry.children = item.children.map(child => ({
          key:   child.key,
          icon:  resolveIcon(child),
          label: child.name || child.label,
          onClick: child.route ? () => navigate(child.route!) : undefined,
        }));
      }

      return entry;
    });
  }, [menuData, navigate]);

  return (
    <div className="aside">
      <div className="logo-wrapper">
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px" }}>
            <img src={customLogo || (theme === "light" ? logo : whiteLogo)} alt="logo" className="logo-img" style={{ maxHeight: "40px", objectFit: "contain" }} />
            {customName && <span style={{ fontWeight: 600, fontSize: "16px", color: theme === "light" ? "#000" : "#fff" }}>{customName}</span>}
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        items={menuItems as any}
        selectedKeys={activeKey ? [activeKey] : []}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        theme={theme === "light" ? "light" : "dark"}
        inlineCollapsed={collapsed}
        className="app-sider-menu"
      />
    </div>
  );
};

export default SiderComponent;
