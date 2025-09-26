import { Layout, Menu, Button, Row, Modal } from "antd";
import "antd/dist/reset.css";
import { Outlet, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
const { Header, Sider, Content, Footer } = Layout;
function DashboardLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <Layout
      className="app-layout"
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        width={240}
        style={{ background: "#fff", borderRight: "1px solid #00000022" }}
      >
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["/app/dashboard"]}
          items={[
            {
              key: "/app/dashboard",
              icon: <DashboardOutlined />,
              label: <NavLink to="/app/dashboard">Dashboard</NavLink>,
            },
            {
              key: "/app/todo",
              icon: <CarryOutOutlined />,
              label: <NavLink to="/app/todo">Todo</NavLink>,
            },
            {
              key: "/app/user",
              icon: <UserOutlined />,
              label: <NavLink to="/app/user">User</NavLink>,
            },
            {
              key: "/app/setting",
              icon: <SettingOutlined />,
              label: <NavLink to="/app/setting">Setting</NavLink>,
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #00000022",
            height: 45,
            padding: "0 15px",
          }}
        >
          <Row justify="end" align="middle" style={{ height: "100%" }}>
            <Button
              type="default"
              onClick={() => setModalOpen(true)}
              style={{ border: "1px solid #d9d9d9" }}
            >
              <span style={{ marginRight: 15 }}>
                <UserOutlined /> {user.name}
              </span>
            </Button>
          </Row>
        </Header>

        <Content>
          <Outlet />
        </Content>

        <Footer
          style={{
            height: 45,
            lineHeight: "45px",
            textAlign: "center",
            borderTop: "1px solid #00000022",
            background: "#fff",
            padding: 0,
          }}
        >
          Todo App @2025
        </Footer>
      </Layout>
      <Modal
        title="Confirm Logout"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="logout" danger onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </Layout>
  );
}

export default DashboardLayout;
