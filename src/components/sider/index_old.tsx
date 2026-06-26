
import React from "react";
import { Menu } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logo, whiteLogo } from "../../assets";
import { useTheme } from "../../context/ThemeContext";
import { useSiderMenuQuery } from "../../services/permissions";
import "./sider.scss";
import {
  Home, AllRolesRoute, AllDirectorsRoute, DirectorAttendanceRoute,
  AllEmployeesRoute, AllGeneralStaffRoute, AllTrainersRoute,
  AllUsersRoute, AddUserRoute, AllInvoiceRoute, AddInvoiceRoute,
  PartialInvoiceRoute,
} from "../../routes/routepath";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface BackendMenuItem {
  key:       string;
  children?: BackendMenuItem[];
}

interface MenuItemDef {
  key:       string;
  label?:    string;
  icon?:     React.ReactElement;
  children?: MenuItemDef[];
}

interface SiderMenuData {
  menu?: BackendMenuItem[];
}

interface SiderComponentProps {
  collapsed: boolean;
}

/* ================= ROUTE MAP (UNCHANGED) ================= */

const routeMap: Record<string, string> = {
  "1":    Home,
  "2":    AllRolesRoute,
  "3":    AllDirectorsRoute,
  "4-1":  DirectorAttendanceRoute,
  "8-1":  AllEmployeesRoute,
  "8-2":  AllGeneralStaffRoute,
  "8-3":  AllTrainersRoute,
  "9-1":  AllUsersRoute,
  "9-2":  AddUserRoute,
  "15-1": AllInvoiceRoute,
  "15-2": AllInvoiceRoute,
  "15-3": AddInvoiceRoute,
  "15-4": PartialInvoiceRoute,
};

// Replaced by permissionsSchema.json in the current sider
const MASTER_MENU: MenuItemDef[] = [];

const MENU_CACHE_KEY = "siderMenuData";
const MENU_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

/* ================= MENU MATCHER ================= */
const matchMenus = (backendMenu: BackendMenuItem[], masterMenu: MenuItemDef[]): MenuItemDef[] => {
  return backendMenu
    .map((backendItem) => {
      const matchedItem = masterMenu.find((m) => m.key === backendItem.key);
      if (!matchedItem) return null;
      return {
        ...matchedItem,
        children: backendItem.children
          ? matchMenus(backendItem.children, matchedItem.children || [])
          : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) as MenuItemDef[];
};

const SiderComponent = ({ collapsed }: SiderComponentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [openKeys, setOpenKeys]   = useState<string[]>([]);
  const [cachedMenu, setCachedMenu] = useState<BackendMenuItem[] | null>(null);

  const { data: siderDataRaw } = useSiderMenuQuery(undefined);
  const siderData = siderDataRaw as SiderMenuData | undefined;

  /* ================= LOAD MENU FROM CACHE ================= */
  useEffect(() => {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.time < MENU_CACHE_EXPIRY) {
          setCachedMenu(parsed.menu);
        } else {
          localStorage.removeItem(MENU_CACHE_KEY);
        }
      } catch {
        localStorage.removeItem(MENU_CACHE_KEY);
      }
    }
  }, []);

  /* ================= CACHE API MENU ================= */
  useEffect(() => {
    if (siderData?.menu) {
      localStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({ menu: siderData.menu, time: Date.now() })
      );
    }
  }, [siderData]);

  const rawMenu = cachedMenu || siderData?.menu || [];

  /* ================= ENSURE INVOICE MANAGEMENT IS ALWAYS INCLUDED ================= */
  const enhancedRawMenu = useMemo(() => {
    if (rawMenu.length === 0) {
      // If no backend menu, return static menu structure with Invoice Management
      return [
        { key: "1" },
        { key: "2" },
        { key: "3" },
        { key: "4", children: [{ key: "4-1" }] },
        { key: "8", children: [{ key: "8-1" }, { key: "8-2" }, { key: "8-3" }] },
        { key: "9", children: [{ key: "9-1" }, { key: "9-2" }] },
        { 
          key: "15", 
          children: [
            { key: "15-1" },
            { key: "15-2" },
            { key: "15-3" },
            { key: "15-4" }
          ]
        }
      ];
    }
    
    // Check if Invoice Management exists in backend menu
    const hasInvoiceManagement = rawMenu.find(item => item.key === "15");
    
    if (!hasInvoiceManagement) {
      // Add Invoice Management if not present
      return [
        ...rawMenu,
        { 
          key: "15", 
          children: [
            { key: "15-1" },
            { key: "15-2" },
            { key: "15-3" },
            { key: "15-4" }
          ]
        }
      ];
    }
    
    return rawMenu;
  }, [rawMenu]);

  /* ================= MATCH BACKEND + STATIC MENU ================= */
  const menuData = useMemo(() => {
    return matchMenus(enhancedRawMenu, MASTER_MENU);
  }, [enhancedRawMenu]);

  /* ================= SYNC ACTIVE MENU ================= */
  useEffect(() => {
    const matched = Object.entries(routeMap).find(([_, path]) =>
      location.pathname.startsWith(path)
    );
    if (matched) setActiveKey(matched[0]);
  }, [location.pathname]);

  /* ================= SUBMENU OPEN LOGIC ================= */
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys.slice(-1));
  };

  /* ================= BUILD ANT MENU ================= */
  const menuItems = useMemo(() => {
    return menuData.map((item) => ({
      key: item.key,
      icon: item.icon, // 👈 ICON FROM STATIC MENU
      label: item.label,
      onClick: routeMap[item.key]
        ? () => navigate(routeMap[item.key])
        : undefined,
      children: item.children?.map((child) => ({
        key: child.key,
        label: child.label,
        onClick: routeMap[child.key]
          ? () => navigate(routeMap[child.key])
          : undefined,
      })),
    }));
  }, [menuData, navigate]);

  return (
    <div className="aside">
      <div className="logo-wrapper">
        {!collapsed && (
          <img
            src={theme === "light" ? logo : whiteLogo}
            alt="logo"
            className="logo-img"
          />
        )}
      </div>

      <Menu
        mode="inline"
        items={menuItems}
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
