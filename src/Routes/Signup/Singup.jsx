import { Form, Input, Button, Card } from "antd";

function Signup() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card
        title={<span style={{ fontSize: "44px" }}>SignUp</span>}
        style={{ width: 450, height: 480, textAlign: "center", lineHeight: 2 }}
      >
        <Form
          name="login"
          layout="vertical"
          style={{ padding: 10 }}
          onFinish={(values) => {
            console.log("Form Data:", values);
          }}
        >
          <Form.Item label="Name" name="name">
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Signup;
