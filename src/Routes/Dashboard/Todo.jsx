import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Layout,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  message,
  Popconfirm,
} from "antd";
import axios from "axios";
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";

function Todo() {
  const [open, setOpen] = useState(false); // modal open or close
  const [form] = Form.useForm(); // for form handling
  const [todos, setTodos] = useState([]); //  for addingtodos
  const [loading, setLoading] = useState(false); //  jb data fetch horaha hota hai tb loding dikhanay kay lia
  const [total, setTotal] = useState(0); //  PAGINATION KAY LIA ISMAY total todos ka count hai
  const [currentPage, setCurrentPage] = useState(1); // pagination kay lia issay pata chalta hai kay user bhi konsay page pr hai

  const pageSize = 8;
  const token = localStorage.getItem("token");

  useEffect(() => {
    // jb comp render hoga todos load hojayengay or tble may show hongay
    GetTodoss();
  }, []);

  const GetTodoss = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/todo/read",
        { page, limit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Todos from backend:", res.data.data); // <--- ye add karo
      if (res.data.status) {
        setTodos(res.data.data);
        setTotal(res.data.totalTodos);
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

  const columns = [
    { title: "Id", dataIndex: "Id", key: "Id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Due Date", dataIndex: "duedate", key: "duedate" },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => {
        const textColor = color === "yellow" ? "#000" : "#fff";
        return (
          <div
            style={{
              backgroundColor: color,
              padding: "5px 10px",
              borderRadius: "15px",
              color: textColor,
              textAlign: "center",
              fontWeight: 500,
              minWidth: "60px",
            }}
          >
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </div>
        );
      },
    },
    { title: "Priority", dataIndex: "priorty", key: "priorty" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        console.log("Record clicked:", record);
        return (
          <Space>
            <Popconfirm
              title="Are you sure to delete this todo"
              onConfirm={() => TodoDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const addTodo = async (values) => {
    try {
      const dateSet = {
        ...values,
        duedate: dayjs(values.duedate).format("YYYY-MM-DD HH:mm:ss"), // date ko parse karkay string format may karega
      };

      const res = await axios.post(
        "http://localhost:3001/api/todo/create",
        dateSet,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        message.success("Todo added successfully");
        form.resetFields();
        setOpen(false);
        GetTodoss(currentPage, pageSize);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const TodoDelete = async (id) => {
    if (!id) {
      message.error("Id is required!");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:3001/api/todo/delete",
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        message.success(res.data.message);
        GetTodoss(currentPage, pageSize);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      message.error("Failed to delete todo");
    }
  };

  

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
          Add Todo
        </Button>

        <Modal title="Add Todo" open={open} closable={false} footer={null}>
          <Form
            form={form}
            layout="vertical"
            onFinish={addTodo} // jb form submit kartay hai tb trigger hota hai
            initialValues={{ color: "red", priorty: "medium" }}
          >
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="duedate"
              label="Due Date"
              rules={[{ required: true }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="color" label="Color">
              <Select>
                <Select.Option value="red">
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "red",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  ></span>
                  Red
                </Select.Option>

                <Select.Option value="yellow">
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "yellow",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  ></span>
                  Yellow
                </Select.Option>

                <Select.Option value="green">
                  <div
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "green",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  >
                    Green
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="priorty" label="Priority">
              <Select
                options={[
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="default"
                  htmlType="button"
                  onClick={() => setOpen(false)} // <-- yaha onClick use karo
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
          dataSource={todos.map((todo, index) => ({
            ...todo,
            key: todo.Id ?? index, // Antd ke liye unique key
            id: todo.Id, // delete ke liye
          }))}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            onChange: (page) => GetTodoss(page, pageSize),
          }}
          style={{ padding: "6px" }}
        />
      </Content>
    </Layout>
  );
}

export default Todo;
