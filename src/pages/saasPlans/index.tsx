import React from "react";
import { Typography, Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SaaSPlans = () => {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>SaaS Subscriptions</Title>
          <Text type="secondary">Manage global subscription plans for all schools.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>Create Plan</Button>
      </div>
      
      <Card>
        <Text>Plan configuration table will go here.</Text>
      </Card>
    </div>
  );
};

export default SaaSPlans;
