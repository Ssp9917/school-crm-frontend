import { Form, Input, Select, Button, message, Row, Col, Card, notification } from 'antd';
import { SaveOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, WalkInIncomingRoute } from '../../routes/routepath';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface WalkInFormValues {
  clientName:  string;
  mobileNo:    string;
  source:      string;
  enquiryFor:  string;
  branch:      string;
  assistedBy:  string;
  remark?:     string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const sourceOptions = [
  { label: 'Walk-in',      value: 'Walk-in'      },
  { label: 'Phone Call',   value: 'Phone Call'   },
  { label: 'Website',      value: 'Website'      },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Referral',     value: 'Referral'     },
  { label: 'Other',        value: 'Other'        },
];

const enquiryOptions = [
  { label: 'Gym Membership',    value: 'Gym Membership'    },
  { label: 'Personal Training', value: 'Personal Training' },
  { label: 'Yoga Classes',      value: 'Yoga Classes'      },
  { label: 'Pilates',           value: 'Pilates'           },
  { label: 'Therapy',           value: 'Therapy'           },
  { label: 'MMA',               value: 'MMA'               },
  { label: 'Other',             value: 'Other'             },
];

const branchOptions = [
  { label: 'Fitclub Golf Course Road',  value: 'Fitclub Golf Course Road'  },
  { label: 'Fitclub Vikas Puri Delhi',  value: 'Fitclub Vikas Puri Delhi'  },
];

const employeeOptions = [
  { label: 'John Trainer',  value: 'John Trainer'  },
  { label: 'Sarah Coach',   value: 'Sarah Coach'   },
  { label: 'Mike Trainer',  value: 'Mike Trainer'  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddWalkIn = () => {
  const [form]   = Form.useForm<WalkInFormValues>();
  const navigate = useNavigate();

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

  const handleSubmit = async (values: WalkInFormValues) => {
    try {
      console.log('Form values:', values);
      message.success('Walk-in entry saved successfully!');
      navigate(WalkInIncomingRoute);
    } catch (error) {
      console.error('Error saving walk-in:', error);
      message.error('Failed to save walk-in entry');
    }
  };

  return (
    <div className="add-walkin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add Walk-in / Incoming</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'Walk-in / Incoming', to: WalkInIncomingRoute },
            { label: 'Add Walk-in' },
          ]}
        />
      </div>

      <Card className="form-card">
        <Form form={form} layout="vertical" onFinish={handleSubmit} onFinishFailed={onFinishFailed} autoComplete="off">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Client Name" name="clientName" rules={[{ required: true, message: 'Please enter client name' }]}>
                <Input placeholder="Client Name" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Mobile Number"
                name="mobileNo"
                rules={[
                  { required: true, message: 'Please enter mobile number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10 digit mobile number' },
                ]}
              >
                <Input placeholder="Mobile Number" size="large" maxLength={10} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Source" name="source" rules={[{ required: true, message: 'Please select source' }]}>
                <Select placeholder="Select Source" size="large" options={sourceOptions} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Enquiry For" name="enquiryFor" rules={[{ required: true, message: 'Please enter enquiry for' }]}>
                <Input placeholder="Enquiry For" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Branch" name="branch" rules={[{ required: true, message: 'Please select branch' }]}>
                <Select placeholder="Fitclub Golf Course Road" size="large" options={branchOptions} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Assisted By" name="assistedBy" rules={[{ required: true, message: 'Please select employee' }]}>
                <Select placeholder="Select Employee" size="large" options={employeeOptions} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Remark" name="remark">
                <Input.TextArea placeholder="Remark" rows={4} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={16} className="action-buttons">
            <Col>
              <Button danger icon={<DeleteOutlined />} size="large" onClick={() => navigate(WalkInIncomingRoute)}>
                Delete
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddWalkIn;
