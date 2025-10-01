import { useState, useEffect } from "react";
import {
  Button,
  Layout,
  Modal,
  Form,
  Input,
  Select,
  message,
  Table,
  Space,
  // Popconfirm,
} from "antd";
import axios from "axios";
import { Header, Content } from "antd/es/layout/layout";

function User() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]); //  for addingtodos
  const [loading, setLoading] = useState(false); //  jb data fetch horaha hota hai tb loding dikhanay kay lia
  const [total, setTotal] = useState(0); //  PAGINATION KAY LIA ISMAY total todos ka count hai
  const [currentPage, setCurrentPage] = useState(1); // pagination kay lia issay pata chalta hai kay user bhi konsay page pr hai
  const pageSize = 8;
  const token = localStorage.getItem("token");

  const Register = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/register",
        values
      );
      if (res.data.status) {
        message.success(res.data.message);
        form.resetFields();
        setOpen(false);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      message.error("Something went wrong");
    }
  };
  const GetUsers = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/dashboard/userread",
        { page, limit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Users from backend:", res.data.data);
      if (res.data.status) {
        setUsers(res.data.data);
        setTotal(res.data.totalUsers);
        setCurrentPage(page);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    GetUsers();
  }, []);

  const columns = [
    { title: "Id", dataIndex: "Id", key: "Id" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Full_name", dataIndex: "full_name", key: "Full_name" },
    { title: "Email", dataIndex: "email", key: "Email" },
    { title: "CreatedAT", dataIndex: "createdAt", key: "CreatedAt" },
  ];

  return (
    <Layout>
      <Header
        style={{
          backgroundColor: "white",
          textAlign: "right",
          paddingRight: "16px",
        }}
      >
        <Button type="primary" onClick={() => setOpen(true)}>
          Add User
        </Button>
        <Modal
          title="Register User"
          open={open}
          closable={false}
          footer={null}
          onCancel={() => setOpen(false)}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={Register}
            initialValues={{
              role: "user",
            }}
          >
            <Form.Item name="full_name" label="Full Name">
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item name="role" label="Role">
              <Select>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="password" label="Password">
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="default"
                  htmlType="button"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                  Save
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Header>
      <hr />
      <Content
        style={{
          padding: "20px",
          background: "#ffffffff",
          minHeight: "80vh",
          borderRadius: "8px",
        }}
      >
        <Table
          columns={columns}
          dataSource={users.map((user, index) => ({
            ...user,
            key: user.Id ?? index, // Antd ke liye unique key
            id: user.Id, // delete ke liye
          }))}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            onChange: (page) => GetUsers(page, pageSize),
          }}
          style={{ padding: "19px",  }}
        />
      </Content>
    </Layout>
  );
}

export default User;
