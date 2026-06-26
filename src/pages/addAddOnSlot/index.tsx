import React from "react";
import { Form, Select, Button, message, DatePicker, TimePicker, notification } from "antd";
import { HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllAddOnSlotsRoute, Home } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";

const AddAddOnSlot = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();

  // Get classes for selected package (mock - update based on actual data structure)
  const classesOptions = [
    { label: 'Morning Yoga', value: 'morning_yoga' },
    { label: 'Evening Gym', value: 'evening_gym' },
    { label: 'Zumba Class', value: 'zumba_class' },
    { label: 'Strength Training', value: 'strength_training' },
    { label: 'Pilates', value: 'pilates' },
  ];

  const onFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    const unique = [...new Set(labels)];
    notification.error({
      message: 'Required Fields Missing',
      description: unique.join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleAddAddOnSlot = async (values) => {
    const slots = (values.slots || []).map((slot) => ({
      date: slot.date?.format('YYYY-MM-DD'),
      timeFrom: slot.timeFrom?.format('HH:mm'),
      timeTo: slot.timeTo?.format('HH:mm'),
    }));

    const payload = {
      className: values.className,
      slots,
      status: 'active',
    };

    console.log('Add Add On Slot Payload:', payload);
    message.success('Add On Slot added successfully!');
    nav(AllAddOnSlotsRoute);
  };

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Add On Slots", to: AllAddOnSlotsRoute },
    { label: "Add On Slot" },
  ];

  return (
    <div className="add-add-on-slot-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Add On Slot</h2>

        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAddOnSlot}
          onFinishFailed={onFinishFailed}
          initialValues={{ slots: [{}] }}
          className="add-on-slot-form"
        >
          {/* Row 1: Class Name */}
          <div className="form-row-single">
            <Form.Item
              label="Class Name"
              name="className"
              rules={[{ required: true, message: 'Please select a class' }]}
            >
              <Select
                placeholder="Select class"
                options={classesOptions}
              />
            </Form.Item>
          </div>

          {/* Row 2: Repeatable Date + Time From/To */}
          <Form.List name="slots">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div className="slot-row" key={key}>
                    <div className="form-row three-cols">
                      <Form.Item
                        {...restField}
                        name={[name, 'date']}
                        label="Date"
                        rules={[{ required: true, message: 'Please select date' }]}
                      >
                        <DatePicker
                          placeholder="Select date"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'timeFrom']}
                        label="Time From"
                        rules={[{ required: true, message: 'Please select time from' }]}
                      >
                        <TimePicker
                          placeholder="Select start time"
                          format="HH:mm"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'timeTo']}
                        label="Time To"
                        rules={[{ required: true, message: 'Please select time to' }]}
                      >
                        <TimePicker
                          placeholder="Select end time"
                          format="HH:mm"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>

                    <div className="slot-actions">
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({})}
                  block
                  icon={<PlusOutlined />}
                  className="add-slot-btn"
                >
                  Add Slot
                </Button>
              </>
            )}
          </Form.List>

          {/* Submit Button */}
          <div className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              className="submit-btn"
            >
              Add Add On Slot
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddAddOnSlot;
