import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        values
      );

      if (res.data.status) {
        const userData = res.data.data;
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));

        message.success("Login successful!");
        navigate("/app/dashboard");
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      console.log(err);
      message.error(msg);
    }
  };

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
        title={<span style={{ fontSize: "44px" }}>Login</span>}
        style={{ width: 450, height: 420, textAlign: "center", lineHeight: 2 }}
      >
        <Form
          name="login"
          layout="vertical"
          style={{ padding: 10 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
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

export default Login;
