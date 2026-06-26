import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message, notification } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAddInvoiceMutation } from '../../../services/invoice';
import { useUserDetailDataQuery } from '../../../services/user';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Coupon {
  _id?: string;
  couponType?: string;
  discountType?: string;
  value?: number;
}

interface Invoice {
  paidAmount?: number;
  coupon?: Coupon;
  discountAmount?: number;
}

interface CurrentMembership {
  planName?: string;
  pricing?: number;
  planId?: string;
  startDate?: string;
  expiryDate?: string;
  assignedTrainer?: string;
  invoice?: Invoice;
}

interface SalesPerson {
  _id?: string;
}

interface UserData {
  _id?: string;
  totalDueAmount?: number;
  currentMembership?: CurrentMembership;
  salesPerson?: SalesPerson;
}

interface UserOutletContext {
  userData?: UserData;
}

interface PaymentMode {
  id: number;
  mode: string;
  amount: number | string;
}

/* ─── Module-level helpers ───────────────────────────────────────────── */

const numFmt = (v: number | string | undefined) =>
  `₹ ${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const numParse = (v: string | undefined) =>
  v ? v.replace(/₹\s?|(,*)/g, '') : '';

const gstClaimOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No'  },
];

const paymentModeOptions = [
  { value: 'cash',         label: 'Cash'          },
  { value: 'upi',          label: 'UPI'           },
  { value: 'card',         label: 'Card'          },
  { value: 'cheque',       label: 'Cheque'        },
  { value: 'banktransfer', label: 'Bank Transfer' },
  { value: 'creditnote',   label: 'Credit Note'   },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const PayDueAmount = () => {
  const { userData }  = useOutletContext<UserOutletContext>();
  const navigate      = useNavigate();
  const { id }        = useParams<{ id: string }>();
  const [form]        = Form.useForm();
  const [loading, setLoading]           = useState(false);
  const [gstClaim, setGstClaim]         = useState(false);
  const gstPercentage                    = 5;
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [addInvoice, { isLoading: addingInvoice }]         = useAddInvoiceMutation();
  const { data: userQueryData, refetch: refetchUserData }  = useUserDetailDataQuery(id);

  const freshUser  = (userQueryData as any)?.user || userData;
  const dueAmount  = freshUser?.totalDueAmount || 0;

  useEffect(() => {
    form.setFieldsValue({ invoiceDate: dayjs(), paymentDate: dayjs() });
  }, [form]);

  const calculatePaymentAmounts = () => {
    const fv    = form.getFieldsValue();
    let total   = 0;
    paymentModes.forEach(p => { total += Number(fv[`paymentAmount_${p.id}`] || 0); });
    setTotalPaidAmount(total);
    setRemainingAmount(Math.max(0, dueAmount - total));
  };

  useEffect(() => { calculatePaymentAmounts(); }, [paymentModes.length]);

  const handleGstClaimChange = (value: string) => setGstClaim(value === 'yes');

  const handlePaymentModeChange = (mode: string, paymentId: number) => {
    setPaymentModes(prev => prev.map(p => p.id === paymentId ? { ...p, mode } : p));
    if (mode === 'cash') {
      try {
        const u = JSON.parse(localStorage.getItem('user') ?? '{}') || {};
        if (u.name) form.setFieldsValue({ [`cashEmployee_${paymentId}`]: u.name });
      } catch {}
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
    if (paymentModes.length <= 1) return;
    setPaymentModes(prev => prev.filter(p => p.id !== paymentId));
    setTimeout(() => calculatePaymentAmounts(), 100);
  };

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

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);

      if (totalPaidAmount <= 0) {
        message.error('Please enter payment amount');
        return;
      }

      const paymentTerms: object[] = [];
      paymentModes.forEach(payment => {
        const mode   = form.getFieldValue(`paymentMode_${payment.id}`) as string;
        const amount = form.getFieldValue(`paymentAmount_${payment.id}`) || 0;
        if (!mode || amount === 0) return;

        switch (mode) {
          case 'cash': {
            const cashEmployee = form.getFieldValue(`cashEmployee_${payment.id}`);
            if (cashEmployee) paymentTerms.push({ modeOfPayment: 'cash', amount: Number(amount), receivedBy: cashEmployee, receipt: [] });
            break;
          }
          case 'upi': {
            const upiScreenshot  = form.getFieldValue(`upiScreenshot_${payment.id}`);
            const upiReferenceId = form.getFieldValue(`upiReferenceId_${payment.id}`);
            if (upiScreenshot) paymentTerms.push({ modeOfPayment: 'upi', amount: Number(amount), receipt: [upiScreenshot], referenceId: upiReferenceId || '' });
            break;
          }
          case 'card': {
            const cardScreenshot = form.getFieldValue(`cardScreenshot_${payment.id}`);
            if (cardScreenshot) paymentTerms.push({ modeOfPayment: 'card', amount: Number(amount), receipt: [cardScreenshot] });
            break;
          }
          case 'cheque': {
            const chequeNumber     = form.getFieldValue(`chequeNumber_${payment.id}`);
            const chequeScreenshot = form.getFieldValue(`chequeScreenshot_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'cheque', amount: Number(amount), chequeNumber, receipt: chequeScreenshot ? [chequeScreenshot] : [] });
            break;
          }
          case 'banktransfer': {
            const transferScreenshot = form.getFieldValue(`transferScreenshot_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'banktransfer', amount: Number(amount), receipt: transferScreenshot ? [transferScreenshot] : [] });
            break;
          }
          case 'creditnote': {
            const creditNoteUpload = form.getFieldValue(`creditNoteUpload_${payment.id}`);
            paymentTerms.push({ modeOfPayment: 'creditnote', amount: Number(amount), receipt: creditNoteUpload ? [creditNoteUpload] : [] });
            break;
          }
          default: break;
        }
      });

      if (paymentTerms.length === 0) {
        message.error('Please add at least one payment mode with amount');
        return;
      }

      const planPrice          = freshUser?.currentMembership?.pricing || 0;
      const baseAmount         = totalPaidAmount / 1.05;
      const gstOnPaidAmount    = totalPaidAmount - baseAmount;
      const paymentType        = totalPaidAmount >= dueAmount ? 'fullPayment' : 'partial';

      const response = await (addInvoice as any)({
        userId:                freshUser?._id,
        planId:                freshUser?.currentMembership?.planId,
        startDate:             freshUser?.currentMembership?.startDate,
        expiryDate:            freshUser?.currentMembership?.expiryDate,
        planPrice,
        couponId:              freshUser?.currentMembership?.invoice?.coupon?._id || null,
        discountAmount:        freshUser?.currentMembership?.invoice?.discountAmount || 0,
        afterDiscount:         planPrice - (freshUser?.currentMembership?.invoice?.discountAmount || 0),
        gstClaim,
        gstPercentage:         gstClaim ? gstPercentage : 0,
        gstAmount:             gstOnPaidAmount,
        gstNumber:             values.gstNumber ?? null,
        registeredCompanyName: values.registeredCompanyName ?? null,
        totalInvoiceAmount:    totalPaidAmount,
        dueAmount:             dueAmount - totalPaidAmount,
        paymentType,
        paymentDate:           values.paymentDate
          ? dayjs(values.paymentDate as dayjs.Dayjs).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        paymentTerm:           paymentTerms,
        invoiceType:           'balance_clear',
        coachId:               freshUser?.currentMembership?.assignedTrainer || null,
        lockerNumber:          null,
        salesPersonId:         freshUser?.salesPerson?._id || null,
        details:               [],
      }).unwrap();

      if (response.success) {
        await refetchUserData();
        navigate(`/user-detail/${id}/buy-membership`);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="pay-due-amount-container">
      <div className="form-header">
        <h2>Pay Due Amount</h2>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item label="Invoice Date" name="invoiceDate" rules={[{ required: true, message: 'Please select invoice date' }]}>
            <DatePicker disabled format="DD-MM-YYYY" style={{ width: '100%', height: '46px' }} />
          </Form.Item>

          <Form.Item label="Payment Date" name="paymentDate" rules={[{ required: true, message: 'Please select payment date' }]}>
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: '100%', height: '46px' }}
              disabledDate={current => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Plan Name">           <Input disabled value={freshUser?.currentMembership?.planName || ''} /></Form.Item>
          <Form.Item label="Plan Price">          <InputNumber disabled style={{ width: '100%' }} value={freshUser?.currentMembership?.pricing   || 0} formatter={numFmt as any} parser={numParse as any} /></Form.Item>
          <Form.Item label="Total Bill Amount">   <InputNumber disabled style={{ width: '100%' }} value={freshUser?.currentMembership?.pricing   || 0} formatter={numFmt as any} parser={numParse as any} /></Form.Item>
          <Form.Item label="Previous Paid Amount"><InputNumber disabled style={{ width: '100%' }} value={freshUser?.currentMembership?.invoice?.paidAmount || 0} formatter={numFmt as any} parser={numParse as any} /></Form.Item>
          <Form.Item label="Discount Coupon">     <Input disabled value={(() => { const c = freshUser?.currentMembership?.invoice?.coupon; if (!c) return '-'; const amt = c.discountType === 'percentage' ? `${c.value}%` : `₹${c.value}`; return `${c.couponType} - ${amt}`; })()} /></Form.Item>
          <Form.Item label="Due Amount">          <InputNumber disabled style={{ width: '100%' }} value={dueAmount} formatter={numFmt as any} parser={numParse as any} /></Form.Item>

          <Form.Item label="GST Claim" name="gstClaim" rules={[{ required: true, message: 'Please select GST claim option' }]}>
            <Select placeholder="Select GST claim" options={gstClaimOptions} onChange={(v: string) => handleGstClaimChange(v)} />
          </Form.Item>
        </div>

        {gstClaim && (
          <div className="row">
            <Form.Item
              name="gstNumber" label="GST Number"
              rules={[
                { required: true, message: 'Please enter GST number' },
                { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter valid GST number' },
              ]}
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>
            <Form.Item
              name="registeredCompanyName" label="Registered Company Name"
              rules={[
                { required: true, message: 'Please enter registered company name' },
                { min: 2, message: 'Company name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter registered company name" />
            </Form.Item>
          </div>
        )}

        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>

          {paymentModes.map((payment, index) => (
            <div key={payment.id} className="payment-group">
              <div className="row payment-row">
                <Form.Item
                  name={`paymentMode_${payment.id}`}
                  label={index === 0 ? 'Mode of Payment' : 'Additional Payment Mode'}
                  rules={[{ required: true, message: 'Please select payment mode' }]}
                >
                  <Select
                    placeholder="Select Payment Mode"
                    options={paymentModeOptions}
                    onChange={(v: string) => handlePaymentModeChange(v, payment.id)}
                  />
                </Form.Item>

                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label="Amount"
                  rules={[
                    { required: true, message: 'Amount is required' },
                    {
                      validator: (_, value) => {
                        if (value) {
                          const fv = form.getFieldsValue();
                          let calculatedTotal = 0;
                          paymentModes.forEach(pm => { calculatedTotal += Number(fv[`paymentAmount_${pm.id}`] || 0); });
                          if (calculatedTotal > dueAmount)
                            return Promise.reject(new Error(`Amount exceeds by ₹${(calculatedTotal - dueAmount).toFixed(2)}. Maximum allowed: ₹${dueAmount.toFixed(2)}`));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter amount"
                    min={0}
                    style={{ width: '100%' }}
                    formatter={numFmt as any}
                    parser={numParse as any}
                    onChange={v => handlePaymentAmountChange(v, payment.id)}
                  />
                </Form.Item>

                <div className="payment-actions">
                  {index === paymentModes.length - 1 && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={addPaymentMode} style={{ marginRight: '8px' }}>Add</Button>
                  )}
                  {paymentModes.length > 1 && (
                    <Button danger icon={<DeleteOutlined />} onClick={() => removePaymentMode(payment.id)}>Remove</Button>
                  )}
                </div>
              </div>

              {payment.mode === 'cash' && (
                <div className="row payment-details">
                  <Form.Item name={`cashEmployee_${payment.id}`} label="Employee (Cash Handler)" rules={[{ required: true, message: 'Please enter employee name for cash payment' }]}>
                    <Input placeholder="Employee handling cash payment" />
                  </Form.Item>
                </div>
              )}
              {payment.mode === 'upi' && (
                <div className="row payment-details">
                  <Form.Item name={`upiScreenshot_${payment.id}`} label="UPI Payment Screenshot" rules={[{ required: true, message: 'Please upload UPI payment screenshot' }]}>
                    <ImagePicker form={form} name={`upiScreenshot_${payment.id}`} />
                  </Form.Item>
                  <Form.Item name={`upiReferenceId_${payment.id}`} label="UPI Reference ID">
                    <Input placeholder="Enter UPI transaction reference ID (optional)" />
                  </Form.Item>
                </div>
              )}
              {payment.mode === 'card' && (
                <div className="row payment-details">
                  <Form.Item name={`cardScreenshot_${payment.id}`} label="Card Payment Screenshot" rules={[{ required: true, message: 'Please upload card payment screenshot' }]}>
                    <ImagePicker form={form} name={`cardScreenshot_${payment.id}`} />
                  </Form.Item>
                </div>
              )}
              {payment.mode === 'cheque' && (
                <div className="row payment-details">
                  <Form.Item name={`chequeNumber_${payment.id}`} label="Cheque Number" rules={[{ required: true, message: 'Please enter cheque number' }]}>
                    <Input placeholder="Enter cheque number" />
                  </Form.Item>
                  <Form.Item name={`chequeScreenshot_${payment.id}`} label="Upload Cheque Image" rules={[{ required: true, message: 'Please upload cheque image' }]}>
                    <ImagePicker form={form} name={`chequeScreenshot_${payment.id}`} />
                  </Form.Item>
                </div>
              )}
              {payment.mode === 'banktransfer' && (
                <div className="row payment-details">
                  <Form.Item name={`transferScreenshot_${payment.id}`} label="Upload Transfer Screenshot" rules={[{ required: true, message: 'Please upload transfer screenshot' }]}>
                    <ImagePicker form={form} name={`transferScreenshot_${payment.id}`} />
                  </Form.Item>
                </div>
              )}
              {payment.mode === 'creditnote' && (
                <div className="row payment-details">
                  <Form.Item name={`creditNoteUpload_${payment.id}`} label="Credit Note" rules={[{ required: true, message: 'Please upload credit note' }]}>
                    <ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} />
                  </Form.Item>
                </div>
              )}
            </div>
          ))}

          {remainingAmount > 0 && (
            <div className="remaining-balance-info">
              <strong>Remaining Balance:</strong> ₹{remainingAmount.toFixed(2)}
            </div>
          )}
        </div>

        <Card className="package-summary" size="small" title="Payment Summary">
          <div className="summary-row">
            <span><strong>Total Due Amount:</strong></span>
            <span>₹{dueAmount.toLocaleString()}</span>
          </div>
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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || addingInvoice}
            className="save-btn"
            disabled={remainingAmount > 0 || totalPaidAmount > dueAmount}
          >
            Submit Payment
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PayDueAmount;
