import { Layout, Menu, Button, Row, Dropdown, Space } from "antd";
import "antd/dist/reset.css";
import {
  NavLink,
  useNavigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  CarryOutOutlined,
  LogoutOutlined,
  MailOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Dashboard from "./Dashboard";
import Todo from "./Todo";
import User from "./User";
import Setting from "./Setting";
import NotFound from "../../notFound";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/userSlice";

const { Header, Sider, Content, Footer } = Layout;

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  console.log(user);

  const Logout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const Items = [
    {
      key: "user-info",
      icon: <UserOutlined />,
      label: `${user.email || "No Email"}`,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: Logout,
    },
  ];

  return (
    <Layout className="app-layout" style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        style={{ background: "#fff", borderRight: "1px solid #00000022" }}
      >
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["/app/dashboard"]}
          selectedKeys={[location.pathname]}
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
            ...(user?.role === "admin"
              ? [
                  {
                    key: "/app/user",
                    icon: <UserOutlined />,
                    label: <NavLink to="/app/user">User</NavLink>,
                  },
                ]
              : []),
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
            <Dropdown
              menu={{ items: Items }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <Button type="default" style={{ border: "1px solid #d9d9d9" }}>
                <Space>
                  <UserOutlined />
                  {user.name || "Guest"}
                  {/* Redux se name show ho raha */}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Row>
        </Header>

        <Content>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="todo" element={<Todo />} />
            {user?.role === "admin" && <Route path="user" element={<User />} />}
            <Route path="setting" element={<Setting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
    </Layout>
  );
}

export default DashboardLayout;
