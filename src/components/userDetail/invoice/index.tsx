import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetInvoicesQuery } from '../../../services/invoice';
import CommonTable from '../../commonTable';
import CustomPagination from '../../pagination';
import { getInvoicesColumns } from '../../../pages/allInvoice/columns';
import './styles.scss';

const UserInvoice = () => {
  const { id }        = useParams<{ id: string }>();
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: invoicesData, isLoading } = useGetInvoicesQuery({ page, limit, userId: id });

  const invoices = (invoicesData as any)?.data || [];
  const columns  = getInvoicesColumns(undefined, undefined, undefined, undefined);

  return (
    <div className="user-invoice-container">
      <h3 className="section-title">User Invoices</h3>

      <div className="invoices-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={invoices}
          loading={isLoading}
          rowKey={(record: any) => record._id || record.invoiceNumber}
          scroll={{ x: 3500 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(invoicesData as any)?.pagination?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default UserInvoice;
