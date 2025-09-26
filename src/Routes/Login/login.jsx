import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Login() {
    const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email: values.email,
        password: values.password,
      });
      console.log(res)
      if (res.data.status) {
        localStorage.setItem("token", res.data.data.token);
        // console.log("token", res.data.data.token)
        alert("Login Successful");
        navigate("/app/dashboard")
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
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

export default Login;
