import { useState, useMemo } from "react";
import usePermissions from "../../hooks/usePermissions";
import { message, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import CommonTable from "../../components/commonTable";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CustomPagination from "../../components/pagination";
import { AddCouponRoute } from "../../routes/routepath";
import "./styles.scss";
import { useGetAllCouponQuery } from "../../services/coupons";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface CouponRecord {
  _id?:          string;
  code?:         string;
  couponType?:   string;
  remark?:       string;
  status?:       string;
  value?:        number | string;
  discountType?: string;
  usedCount?:    number;
  usageLimit?:   number | string;
  validFrom?:    string;
  branchId?:    { name?: string };
  employeeId?:  { user?: { name?: string } };
}

interface CountData {
  key:   string;
  count: number;
}

interface PaginationInfo {
  total?: number;
  page?:  number;
}

interface StatusTab {
  key:    string;
  label:  string;
  count?: number;
}

/* ─── Module-level constants ─────────────────────────────────────────── */

const allColumns = [
  { title: "Code",          dataIndex: "code",          key: "code"          },
  { title: "Coupon Type",   dataIndex: "couponType",    key: "couponType"    },
  { title: "Remark",        dataIndex: "remark",        key: "remark"        },
  { title: "Status",        dataIndex: "status",        key: "status"        },
  { title: "Value",         dataIndex: "value",         key: "value"         },
  { title: "Discount Type", dataIndex: "discountType",  key: "discountType"  },
  { title: "Sales Person",  dataIndex: "salesPerson",   key: "salesPerson"   },
  { title: "Branch",        dataIndex: "branch",        key: "branch"        },
  { title: "Usage",         dataIndex: "usage",         key: "usage"         },
  { title: "Valid From",    dataIndex: "validFrom",     key: "validFrom"     },
  { title: "Actions",       dataIndex: "actions",       key: "actions"       },
];

const statusTabs: StatusTab[] = [
  { key: "all",        label: "All",        count: 0 },
  { key: "regular",    label: "Regular"               },
  { key: "single_use", label: "Single Use"            },
  { key: "used",       label: "Used"                  },
  { key: "unused",     label: "Unused"                },
];

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllCoupons = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab,  setActiveTab]  = useState("all");
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    allColumns.reduce<Record<string, boolean>>((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const { hasPermission } = usePermissions();

  const { data, isLoading } = useGetAllCouponQuery({
    search: searchText,
    type:   activeTab !== "all" ? activeTab : undefined,
    page,
    limit,
  } as any);

  const apiData                       = data as any;
  const coupons: CouponRecord[]       = apiData?.data       || [];
  const counts:  CountData[]          = apiData?.counts     || [];
  const paginationInfo: PaginationInfo = apiData?.pagination || {};

  const updatedStatusTabs = useMemo<StatusTab[]>(() => {
    return statusTabs.map(tab => {
      const countData = counts.find(c => c.key === tab.key);
      return { ...tab, count: countData ? countData.count : 0 };
    });
  }, [counts]);

  const filteredData = useMemo<CouponRecord[]>(() => {
    let d = coupons;
    if (activeTab !== "all") {
      if (activeTab === "used") {
        d = d.filter(u => (u.usedCount ?? 0) > 0);
      } else if (activeTab === "unused") {
        d = d.filter(u => (u.usedCount ?? 0) === 0);
      } else {
        d = d.filter(u => u.couponType === activeTab);
      }
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      d = d.filter(u => u.code?.toLowerCase().includes(q));
    }
    return d;
  }, [coupons, activeTab, searchText]);

  const handleDelete = (record: CouponRecord) => {
    Modal.confirm({
      title:      "Are you sure you want to delete this coupon?",
      content:    `This action will delete coupon: ${record.code}`,
      okText:     "Delete",
      okType:     "danger",
      cancelText: "Cancel",
      onOk: async () => {
        message.success("Coupon deleted successfully!");
      },
    });
  };

  const columns = useMemo(() => {
    return allColumns.filter(col => visibleColumns[col.key]).map(col => {
      if (col.key === "salesPerson") {
        return {
          ...col,
          render: (_: unknown, record: CouponRecord) => {
            if (record.couponType === "single_use" && record.employeeId?.user) {
              return record.employeeId.user.name;
            }
            return "Every one";
          },
        };
      }

      if (col.key === "branch") {
        return {
          ...col,
          render: (_: unknown, record: CouponRecord) => record.branchId?.name || "-",
        };
      }

      if (col.key === "usage") {
        return {
          ...col,
          render: (_: unknown, record: CouponRecord) => {
            const used       = record.usedCount  || 0;
            const cap        = record.usageLimit;
            const limitText  = cap == null ? "∞" : cap;
            return `${used} / ${limitText}`;
          },
        };
      }

      if (col.key === "validFrom") {
        return {
          ...col,
          render: (_: unknown, record: CouponRecord) => formatDate(record.validFrom),
        };
      }

      if (col.key === "couponType") {
        return {
          ...col,
          render: (text: string) => {
            if (text === "regular")    return "Regular";
            if (text === "single_use") return "Single Use";
            return text;
          },
        };
      }

      if (col.key === "discountType") {
        return {
          ...col,
          render: (text: string) => {
            if (text === "percentage") return "Percentage";
            if (text === "absolute")   return "Fixed Amount";
            return text;
          },
        };
      }

      if (col.key === "value") {
        return {
          ...col,
          render: (text: number | string, record: CouponRecord) => {
            if (record.discountType === "percentage") return `${text}%`;
            return `₹${text}`;
          },
        };
      }

      if (col.key === "actions") {
        return {
          ...col,
          render: (_: unknown, record: CouponRecord) => {
            const items = [
              ...(hasPermission("16-2-edit") ? [{
                key:     "edit",
                label:   "Edit",
                onClick: () => { message.info("Edit feature coming soon"); },
              }] : []),
              ...(hasPermission("16-1-delete") ? [{
                key:     "delete",
                label:   "Delete",
                danger:  true,
                onClick: () => handleDelete(record),
              }] : []),
            ];
            return (
              <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
                <MoreOutlined style={{ fontSize: 20, cursor: "pointer" }} />
              </Dropdown>
            );
          },
        };
      }

      return col;
    });
  }, [visibleColumns, hasPermission]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const paginatedData = useMemo<CouponRecord[]>(() => {
    if (apiData?.pagination && page === apiData.pagination.page) {
      return coupons;
    }
    const startIndex = (page - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, page, limit, apiData, coupons]);

  const totalCount = useMemo(() => {
    if (activeTab !== "all" || searchText) return filteredData.length;
    return paginationInfo.total || filteredData.length;
  }, [filteredData, activeTab, searchText, paginationInfo.total]);

  return (
    <div className="all-coupons-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search coupons by code..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={updatedStatusTabs}
          />
        </div>
        <div className="right-col">
          {hasPermission("COUPON_CREATE") && (
            <AddButton to={AddCouponRoute}>Add Coupon</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="coupons-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: CouponRecord) => record._id || ""}
          scroll={{ x: 1500 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={totalCount}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllCoupons;
