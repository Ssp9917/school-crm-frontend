import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetUserAddOnsQuery } from '../../../services/membership';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../form/ImagePicker';
import '../buyAddOnService/styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PaymentMode {
  id: number;
  mode: string;
  amount: string | number;
}

interface UserOutletContext {
  userData?: unknown;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AddonClearBalance = () => {
  const { userData } = (useOutletContext<UserOutletContext>()) || {};
  const { id: userId, membershipId } = useParams<{ id: string; membershipId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading]               = useState(false);
  const [gstClaim, setGstClaim]             = useState(false);
  const [paymentModes, setPaymentModes]     = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const { data: addonsData }              = useGetUserAddOnsQuery(userId);
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();

  const membership    = (addonsData as any)?.data?.find((m: any) => m._id === membershipId);
  const dueAmount     = membership?.remainingDue || 0;
  const appliedCoupon = membership?.invoices?.[0]?.coupon || null;

  useEffect(() => {
    if (membership) {
      form.setFieldsValue({
        invoiceDate:    dayjs(),
        paymentDate:    '',
        planName:       membership.planId?.name    || 'N/A',
        planPrice:      membership.planId?.pricing || 0,
        totalInvoiced:  membership.totalInvoicedAmount || membership.totalInvoiced || 0,
        totalPaid:      membership.totalPaid || 0,
        dueAmount,
      });
    }
  }, [membership, form, dueAmount]);

  useEffect(() => { calculatePaymentAmounts(); }, [paymentModes.length]);

  const calculatePaymentAmounts = () => {
    const fv = form.getFieldsValue();
    let total = 0;
    paymentModes.forEach(p => { total += Number(fv[`paymentAmount_${p.id}`] || 0); });
    setTotalPaidAmount(total);
    setRemainingAmount(Math.max(0, dueAmount - total));
  };

  const handlePaymentModeChange = (mode: string, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, mode } : p));
    if (mode === 'cash') {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) form.setFieldsValue({ [`cashEmployee_${paymentId}`]: user.name });
      } catch { /* silent */ }
    }
  };

  const handlePaymentAmountChange = (amount: number | string | null, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, amount: amount ?? '' } : p));
    setTimeout(() => calculatePaymentAmounts(), 100);
  };

  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id)) + 1;
    setPaymentModes(prev => [...prev, { id: newId, mode: '', amount: '' }]);
  };

  const removePaymentMode = (paymentId: number) => {
    if (paymentModes.length > 1) {
      setPaymentModes(prev => prev.filter(p => p.id !== paymentId));
      setTimeout(() => calculatePaymentAmounts(), 100);
    }
  };

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message: 'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const onFinish = async (values: Record<string, any>) => {
    setLoading(true);
    try {
      const paymentTerms: any[] = [];
      paymentModes.forEach(payment => {
        const mode   = values[`paymentMode_${payment.id}`];
        const amount = values[`paymentAmount_${payment.id}`];
        if (!mode || !amount) return;
        if (mode === 'cash')         paymentTerms.push({ modeOfPayment: 'cash',         amount, receivedBy: values[`cashEmployee_${payment.id}`] || '', receipt: [] });
        else if (mode === 'upi')     paymentTerms.push({ modeOfPayment: 'upi',          amount, receipt: values[`upiScreenshot_${payment.id}`]   ? [values[`upiScreenshot_${payment.id}`]]   : [], referenceId: values[`upiReferenceId_${payment.id}`] || null });
        else if (mode === 'card')    paymentTerms.push({ modeOfPayment: 'card',         amount, receipt: values[`cardScreenshot_${payment.id}`]  ? [values[`cardScreenshot_${payment.id}`]]  : [] });
        else if (mode === 'cheque')  paymentTerms.push({ modeOfPayment: 'cheque',       amount, chequeNumber: values[`chequeNumber_${payment.id}`] || '', receipt: values[`chequeScreenshot_${payment.id}`] ? [values[`chequeScreenshot_${payment.id}`]] : [] });
        else if (mode === 'banktransfer') paymentTerms.push({ modeOfPayment: 'banktransfer', amount, receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : [] });
        else if (mode === 'creditnote')   paymentTerms.push({ modeOfPayment: 'creditnote',   amount, receipt: values[`creditNoteUpload_${payment.id}`]   ? [values[`creditNoteUpload_${payment.id}`]]   : [] });
      });

      const gstAmount          = gstClaim ? (dueAmount * 5) / 100 : 0;
      const totalInvoiceAmount = dueAmount + gstAmount;

      const payload = {
        userId,
        membershipId,
        planId:                  membership?.planId?._id,
        type:                    'addon',
        addonType:               membership?.addonType,
        pricing:                 membership?.planId?.pricing || 0,
        couponId:                null,
        discountAmount:          0,
        afterDiscount:           dueAmount,
        gstClaim,
        gstPercentage:           gstClaim ? 5 : 0,
        gstAmount,
        gstNumber:               values.gstNumber || null,
        registeredCompanyName:   values.registeredCompanyName || null,
        totalInvoiceAmount,
        dueAmount:               0,
        paymentType:             'fullPayment',
        billingAddress:          membership?.userId?.member?.address || null,
        paymentDate:             values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        startDate:               membership?.startDate  ? dayjs(membership.startDate).format('YYYY-MM-DD')  : null,
        endDate:                 membership?.expiryDate ? dayjs(membership.expiryDate).format('YYYY-MM-DD') : null,
        paymentTerm:             paymentTerms,
        coachId:                 membership?.coachId?._id || null,
        invoiceType:             'balance_clear',
      };

      await (addInvoice as any)(payload).unwrap();
      navigate(`/user-detail/${userId}/addon-service`);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const paymentModeOptions = [
    { value: 'cash',         label: 'Cash'         },
    { value: 'card',         label: 'Card'         },
    { value: 'upi',          label: 'UPI'          },
    { value: 'banktransfer', label: 'Bank Transfer' },
    { value: 'cheque',       label: 'Cheque'       },
    { value: 'creditnote',   label: 'Credit Note'  },
  ];

  const numFmt = (v: number | string | undefined) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const numParse = (v: string | undefined) => v ? v.replace(/₹\s?|(,*)/g, '') : '';

  return (
    <div className="buy-addon-service-container">
      <div className="form-header">
        <h2>Clear Add-On Balance</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="invoiceDate" label="Invoice Date">
            <DatePicker style={{ width: '100%', height: '46px' }} disabled format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker style={{ width: '100%', height: '46px' }} format="DD-MM-YYYY" disabledDate={current => current && current > dayjs().endOf('day')} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="planName" label="Plan Name">
            <Input disabled />
          </Form.Item>
          <Form.Item name="planPrice" label="Plan Price">
            <InputNumber disabled style={{ width: '100%' }} formatter={numFmt} parser={numParse} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="totalPaid" label="Previous Paid Amount">
            <InputNumber disabled style={{ width: '100%' }} formatter={numFmt} parser={numParse} />
          </Form.Item>
          <Form.Item label="Applied Coupon">
            <Input
              disabled
              value={appliedCoupon
                ? `${appliedCoupon.code} — ${appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountAmount}% off` : `₹${appliedCoupon.discountAmount?.toLocaleString()} off`}`
                : 'No coupon applied'}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="dueAmount" label="Due Amount">
            <InputNumber disabled style={{ width: '100%' }} formatter={numFmt} parser={numParse} />
          </Form.Item>
          <Form.Item name="gstClaim" label="GST Claim" rules={[{ required: true, message: 'Please select GST claim' }]}>
            <Select
              placeholder="Select GST claim"
              onChange={(v: string) => setGstClaim(v === 'yes')}
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            />
          </Form.Item>
        </div>

        {gstClaim && (
          <div className="row">
            <Form.Item name="gstNumber" label="GST Number" rules={[{ required: true, message: 'Please enter GST number' }, { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter valid GST number' }]}>
              <Input placeholder="Enter GST number" style={{ height: '46px' }} />
            </Form.Item>
            <Form.Item name="registeredCompanyName" label="Registered Company Name" rules={[{ required: true, message: 'Please enter registered company name' }, { min: 2, message: 'Company name must be at least 2 characters' }]}>
              <Input placeholder="Enter registered company name" style={{ height: '46px' }} />
            </Form.Item>
          </div>
        )}

        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
          {paymentModes.map((payment, index) => (
            <div key={payment.id} className="payment-group">
              <div className="row payment-row">
                <Form.Item name={`paymentMode_${payment.id}`} label={index === 0 ? 'Mode of Payment' : 'Additional Payment Mode'} rules={[{ required: true, message: 'Please select payment mode' }]}>
                  <Select placeholder="Select payment mode" options={paymentModeOptions} onChange={(v: string) => handlePaymentModeChange(v, payment.id)} />
                </Form.Item>
                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label="Amount"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    {
                      validator: (_, value) => {
                        if (value) {
                          const fv = form.getFieldsValue();
                          let total = 0;
                          paymentModes.forEach(pm => { total += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          if (total > dueAmount) return Promise.reject(new Error(`Exceeds due amount ₹${dueAmount}`));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber style={{ width: '100%' }} formatter={numFmt} parser={numParse} placeholder="Enter amount" min={0} onChange={v => handlePaymentAmountChange(v, payment.id)} />
                </Form.Item>
                <div className="payment-actions">
                  {index === paymentModes.length - 1 && <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>Add</Button>}
                  {paymentModes.length > 1 && <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>}
                </div>
              </div>

              <Form.Item noStyle shouldUpdate={(p, c) => p[`paymentMode_${payment.id}`] !== c[`paymentMode_${payment.id}`]}>
                {() => {
                  const mode = form.getFieldValue(`paymentMode_${payment.id}`);
                  if (mode === 'cash')         return <div className="row payment-details"><Form.Item name={`cashEmployee_${payment.id}`} label="Employee (Cash Handler)" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Employee handling cash" /></Form.Item></div>;
                  if (mode === 'upi')          return <div className="row payment-details"><Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`upiScreenshot_${payment.id}`} /></Form.Item><Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID"><Input placeholder="Optional" /></Form.Item></div>;
                  if (mode === 'card')         return <div className="row payment-details"><Form.Item name={`cardScreenshot_${payment.id}`} label="Card Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`cardScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'cheque')       return <div className="row payment-details"><Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Cheque number" /></Form.Item><Form.Item name={`chequeScreenshot_${payment.id}`} label="Cheque Image" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'banktransfer') return <div className="row payment-details"><Form.Item name={`transferScreenshot_${payment.id}`} label="Transfer Screenshot" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`transferScreenshot_${payment.id}`} /></Form.Item></div>;
                  if (mode === 'creditnote')   return <div className="row payment-details"><Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Required' }]}><ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} /></Form.Item></div>;
                  return null;
                }}
              </Form.Item>
            </div>
          ))}
        </div>

        <Card className="package-summary" size="small" title="Payment Summary">
          <div className="summary-row"><span><strong>Total Due Amount:</strong></span><span>₹{dueAmount.toLocaleString()}</span></div>
          {totalPaidAmount > 0 && (
            <>
              <div className="summary-row"><span><strong>Base Amount (without GST):</strong></span><span>₹{(totalPaidAmount / 1.05).toFixed(2)}</span></div>
              <div className="summary-row"><span><strong>SGST (2.5%):</strong></span><span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span></div>
              <div className="summary-row"><span><strong>CGST (2.5%):</strong></span><span>₹{((totalPaidAmount / 1.05) * 0.025).toFixed(2)}</span></div>
              <div className="summary-row"><span><strong>Total Paid (with GST):</strong></span><span>₹{totalPaidAmount.toFixed(2)}</span></div>
            </>
          )}
          <div className={`summary-row ${(dueAmount - totalPaidAmount) > 0 ? 'remaining-amount' : 'complete-amount'}`}>
            <span><strong>Remaining Due:</strong></span>
            <span>₹{Math.max(0, dueAmount - totalPaidAmount).toLocaleString()}</span>
          </div>
        </Card>

        <div className="footer-buttons">
          <Button type="primary" htmlType="submit" loading={loading || addingInvoice} className="save-btn" disabled={totalPaidAmount <= 0 || totalPaidAmount > dueAmount || remainingAmount > 0}>
            Clear Balance
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddonClearBalance;
