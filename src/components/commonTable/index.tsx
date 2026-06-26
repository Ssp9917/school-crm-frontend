import { Table } from 'antd';
import './styles.scss';

const CommonTable = ({ columns, dataSource, ...rest }) => {
  return (
    <div className="common-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        // sticky={{ offsetHeader: 0 }}
        {...rest}
      />
    </div>
  );
};

export default CommonTable;
