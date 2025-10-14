import { useEffect, useState } from "react";
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
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, deleteUser, addUser } from "../Redux/UserSlice";

function User() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;
  const dispatch = useDispatch();
  const { users, total, loading } = useSelector((state) => state.user);

  const GetUsers = (page = 1, limit = pageSize) => {
    dispatch(getUsers({ page, limit }));
    setCurrentPage(page);
  };

  const userDelete = (id) => {
    if (!id) {
      message.error("Id is required!");
      return;
    }
    dispatch(deleteUser(id))
      .unwrap()
      .then((res) => {
        if (res.status) {
          message.success(res.message);
          GetUsers(currentPage, pageSize);
        } else {
          message.error(res.message);
        }
      })
      .catch(() => message.error("Failed to delete user"));
  };

  const Edit = (record) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Token not found");
      return;
    }
    const decoded = jwtDecode(token);
    const currentUserEmail = decoded.email;

    if (record.email === currentUserEmail) {
      message.warning("You cannot edit your own account from here.");
      return;
    }
    form.setFieldsValue({
      id: record.id,
      full_name: record.full_name,
      email: record.email,
      role: record.role,
    });
    form.setFieldValue("password", null);
    setOpen(true);
  };

  useEffect(() => {
    GetUsers();
  }, []);

  const onFinish = (values) => {
    if (values.id && (!values.password || values.password.trim() === "")) {
      delete values.password;
    }
    if (!values.id && (!values.password || values.password.trim() === "")) {
      message.error("Password is required for new users");
      return;
    }

    dispatch(addUser(values))
      .unwrap()
      .then((res) => {
        if (res.status) {
          message.success(res.message);
          form.resetFields();
          setOpen(false);
          GetUsers(currentPage, pageSize);
        } else {
          message.error(res.message);
        }
      })
      .catch(() => message.error("Something went wrong"));
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
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "--",
    },
    {
      title: "Last Login",
      dataIndex: "last_login",
      key: "last_login",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "--",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
          <Button type="text" onClick={() => Edit(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
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
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
            form.resetFields();
          }}
        >
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
            onFinish={onFinish}
            initialValues={{ role: "user" }}
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
              rules={[
                !form.getFieldValue("id")
                  ? [
                      { required: true, message: "Password is required" },
                      {
                        pattern:
                          /^(?!.*\s)(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,12}$/,
                        message:
                          "Strict Password 1 uppercase, 1 number & 1 special char and no spaces required",
                      },
                    ]
                  : [
                      {
                        pattern:
                          /^(?!.*\s)(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,12}$/,
                        message:
                          "Strict Password 1 uppercase, 1 number & 1 special char and no spaces required",
                      },
                    ],
              ].flat()}
            >
              <Input.Password
                placeholder={form.getFieldValue("id") ? "" : "Enter password"}
              />
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
