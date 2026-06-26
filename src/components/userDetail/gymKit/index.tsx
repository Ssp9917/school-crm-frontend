import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommonTable from '../../commonTable';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import gymKitColumns from './columns';
import './styles.scss';

interface GymKitItem {
  _id?: string;
  inventoryId?: { productName?: string };
  quantity?: number;
  deliveredQuantity?: number;
}

interface UserOutletContext {
  userData?: {
    member?: {
      gymKit?: GymKitItem[];
    };
  };
}

type VisibleColumns = Record<string, boolean>;

const GymKit = () => {
  const { userData } = useOutletContext<UserOutletContext>();
  const gymKitData: GymKitItem[] = userData?.member?.gymKit || [];

  const [searchText, setSearchText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    srNo:              true,
    productName:       true,
    quantity:          true,
    deliveredQuantity: true,
    remaining:         true,
    status:            true,
  });

  const columns = useMemo(
    () => gymKitColumns.filter(col => visibleColumns[col.key]),
    [visibleColumns],
  );

  const filteredData = useMemo(() => {
    if (!searchText) return gymKitData;
    return gymKitData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  }, [searchText, gymKitData]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  return (
    <div className="gym-kit-container">
      <div className="table-controls">
        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search gym kit" />
        <ColumnVisibility
          columns={gymKitColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <CommonTable
        columns={columns}
        dataSource={filteredData}
        rowKey={(record: GymKitItem, index?: number) => record?._id || String(index)}
        scroll={{ x: 'max-content' }}
        pagination={false}
      />
    </div>
  );
};

export default GymKit;
