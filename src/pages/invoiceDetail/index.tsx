import InvoiceView from '../../components/invoiceView';
import PageBreadcrumb from '../../components/breadcrumb';
import { HomeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Home, AllInvoiceRoute } from '../../routes/routepath';
import { useParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { useGetInvoiceByIdQuery } from '../../services/invoice';

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: invoiceResponse, isLoading, error } = useGetInvoiceByIdQuery(id as any, {
    refetchOnMountOrArgChange: true,
  });
  const invoiceData: any = (invoiceResponse as any)?.data;

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;

    const containerEl = document.querySelector('.invoice-view-container');
    const invoiceContent = containerEl ? containerEl.innerHTML : '';

    printWindow.document.write('<html><head><title>Invoice ' + (invoiceData?.invoiceNumber || 'Download') + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page { margin: 0.5cm; }
      *, *::before, *::after {
        margin: 0; padding: 0; box-sizing: border-box;
        color: #000000 !important;
        background-color: transparent !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #ffffff !important;
        color: #000000 !important;
      }
      .invoice-view-container {
        background: #ffffff !important;
        padding: 10px 20px 20px 20px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #000;
      }
      .company-logo img { height: 40px; filter: brightness(0) !important; }
      .invoice-header-left, .invoice-header-right { display: block; }
      .invoice-number { font-size: 16px; font-weight: 700; margin: 0; }
      .invoice-info-section {
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 15px;
      }
      .invoice-from, .invoice-to { display: block; }
      .invoice-from h3, .invoice-to h3 { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
      .invoice-from p, .invoice-to p { margin: 2px 0; font-size: 11px; line-height: 1.4; }
      .invoice-from strong, .invoice-to strong { font-weight: 700; }
      .company-name { font-weight: 600 !important; font-size: 12px !important; }
      .customer-name { font-weight: 600 !important; font-size: 12px !important; }
      .invoice-payment-info { margin-bottom: 15px; }
      .payment-info-table { width: 100%; border-collapse: collapse; }
      .payment-info-table thead { background: #d9d9d9 !important; }
      .payment-info-table thead th {
        padding: 8px 10px; font-size: 12px; font-weight: 600;
        border: 1px solid #000; background: #d9d9d9 !important; text-align: left;
      }
      .payment-info-table tbody td {
        padding: 8px 10px; font-size: 12px;
        border: 1px solid #000; background: #ffffff !important;
      }
      .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      .invoice-table thead tr { background: #d9d9d9 !important; }
      .invoice-table thead th {
        padding: 8px 10px; font-size: 12px; font-weight: 600;
        background: #d9d9d9 !important; text-align: left; border: 1px solid #ccc;
      }
      .invoice-table thead th:last-child { text-align: right; }
      .invoice-table tbody tr { background: #ffffff !important; }
      .invoice-table tbody td {
        padding: 8px 10px; font-size: 12px;
        background: #ffffff !important; border-bottom: 1px solid #eee;
      }
      .invoice-table tbody td:last-child { text-align: right; }
      .invoice-table .date-row td { padding: 4px 10px; border: none; }
      .date-info { display: flex; gap: 40px; }
      .date-info span { font-size: 11px; }
      .invoice-totals-section {
        display: grid !important;
        grid-template-columns: 1fr 380px;
        gap: 20px;
        margin-bottom: 0;
      }
      .totals-left { display: block; }
      .totals-right { display: block; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
      .total-label { flex: 1; }
      .total-value { text-align: right; min-width: 100px; }
      .total-value.discount { color: #cc0000 !important; }
      .previous-amount { color: #cc0000 !important; }
      .final-total { border-top: 2px solid #000; padding-top: 10px; margin-top: 8px; font-weight: 700; font-size: 15px; }
      .due-amount { border-top: 1px solid #ccc; padding-top: 8px; margin-top: 4px; font-weight: 600; }
      .due-amount .total-label, .due-amount .total-value { color: #cc0000 !important; }
      .invoice-footer { margin-top: auto; padding-top: 15px; border-top: 2px solid #000; text-align: center; }
      .invoice-footer p { font-size: 10px; margin: 4px 0; line-height: 1.4; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="invoice-view-container">');
    printWindow.document.write(invoiceContent);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    }, 500);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px 24px', color: 'var(--red)' }}>
        Error loading invoice: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  return (
    <>
      <div className="no-print" style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--sider-text)' }}>
            {invoiceData?.invoiceNumber || 'Invoice'}
          </h1>
          <div className="invoice-actions" style={{ display: 'flex', gap: '12px' }}>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              type="default"
              style={{ borderColor: 'var(--muted)', color: 'var(--sider-text)', backgroundColor: 'var(--card-bg)' }}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              type="default"
              style={{ borderColor: 'var(--muted)', color: 'var(--sider-text)', backgroundColor: 'var(--card-bg)' }}
            />
          </div>
        </div>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'Invoice',       to: AllInvoiceRoute },
            { label: invoiceData?.invoiceNumber || 'Invoice Detail' },
          ]}
        />
      </div>
      <InvoiceView invoiceData={invoiceData} showActions={false} />
    </>
  );
};

export default InvoiceDetailPage;
