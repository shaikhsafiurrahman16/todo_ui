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
  Popconfirm,
  Space,
} from "antd";
import axios from "axios";
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";

function User() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;
  const token = localStorage.getItem("token");

  const addUser = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/register",
        values
      );
      if (res.data.status) {
        message.success(res.data.message);
        form.resetFields();
        setOpen(false);
        GetUsers(currentPage, pageSize);
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
        "http://localhost:3001/api/user/userRead",
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

  const userDelete = async (id) => {
    if (!id) {
      message.error("Id is required!");
      return;
    }
    try {
      const res = await axios.delete(
        "http://localhost:3001/api/user/userDelete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { id },
        }
      );

      if (res.data.status) {
        message.success(res.data.message);
        GetUsers(currentPage, pageSize);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete user");
    }
  };

  const EditUser = async (values) => {
    try {
      const res = await axios.put(
        "http://localhost:3001/api/user/userUpdate",
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        message.success(res.data.message);
        form.resetFields();
        setOpen(false);
        GetUsers(currentPage, pageSize);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    }
  };

  const columns = [
    { title: "Id", dataIndex: "id", key: "Id" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Full Name", dataIndex: "full_name", key: "Full_name" },
    { title: "Email", dataIndex: "email", key: "Email" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "--"),
    },
    {
      title: "Last Login",
      dataIndex: "last_login",
      key: "last_login",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "--"),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        console.log("Record clicked:", record);
        return (
          <Space>
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => userDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger>
                Delete
              </Button>
            </Popconfirm>
            <Button
              type="text"
              onClick={() => {
                form.setFieldsValue(record);
                setOpen(true);
              }}
            >
              Edit
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    GetUsers();
  }, []);

  return (
    <Layout>
      <Header
        style={{
          backgroundColor: "white",
          textAlign: "right",
          paddingRight: "16px",
        }}
      >
        <Button type="primary" onClick={() => {setOpen(true); form.resetFields()}}>
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
            onFinish={(values) => {
              if (values.id) {
                EditUser(values);
              } else {
                addUser(values);
              }
            }}
            initialValues={{
              role: "user",
            }}
          >
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[{ required: true, message: "Fullname is required" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

              <Form.Item name="role" label="Role">
                <Select>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="user">User</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Password is required" }]}
              >
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
          background: "#ffffffff",
          minHeight: "80vh",
          borderRadius: "8px",
        }}
      >
        <Table
          columns={columns}
          dataSource={users.map((user, index) => ({
            ...user,
            key: user.Id ?? index,
            id: user.Id,
          }))}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            onChange: (page) => GetUsers(page, pageSize),
          }}
          style={{ padding: "19px" }}
        />
      </Content>
    </Layout>
  );
}

export default User;
