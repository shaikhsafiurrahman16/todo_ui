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
const { Search } = Input;
import axios from "axios";
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Todo() {
  const [open, setOpen] = useState(false); // modal open or close
  const [form] = Form.useForm(); // for form handling
  const [todos, setTodos] = useState([]); // for adding todos
  const [loading, setLoading] = useState(false); // loading indicator
  const [total, setTotal] = useState(0); // pagination total
  const [currentPage, setCurrentPage] = useState(1); // pagination current
  const [editTodo, setEditTodo] = useState(null); // editing ke liye
  const [color, setColor] = useState("all"); // color kay lia
  const [priority, setPriority] = useState("all"); // priorty kay lia

  const pageSize = 8;
  const token = localStorage.getItem("token");

  const GetTodoss = async (page = 1, limit = pageSize, search = "") => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/todo/read",
        { page, limit, search, color, priorty: priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        setTodos(res.data.data);
        setTotal(res.data.totalTodos);
        setCurrentPage(page);
      } else {
        message.warning("No todos found");
        setTodos([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };
  const download = async () => {
    try {
      let allTodos = [];
      for (let page = 1, moreTodos = true; moreTodos; page++) {
        const res = await axios.post(
          "http://localhost:3001/api/todo/read",
          { page, limit: 8, color, priorty: priority },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.data || [];
        if (res.data.status && data.length > 0) {
          allTodos.push(...data);
          moreTodos = data.length === 8;
        } else {
          moreTodos = false;
        }
      }

      if (!allTodos.length) {
        message.warning("No todos to download");
        return;
      }

      const doc = new jsPDF();
      doc.text("Todos List", 14, 10);

      const tableColumn = [
        "ID",
        "Title",
        "Description",
        "Color",
        "Priority",
        "Due Date",
      ];

      const tableRows = allTodos.map((todo) => [
        todo.Id,
        todo.title,
        todo.description,
        todo.color,
        todo.priorty,
        todo.duedate
          ? dayjs(todo.duedate).format("DD-MM-YYYY hh:mm:ss")
          : "No Date",
      ]);

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 }); // pdf may formatted table may convert karrahi hai  // jspdf-autotale library ka func hai
      doc.save(`todos_${color}_${priority}.pdf`);
    } catch (err) {
      message.error("Failed to download all pages");
    }
  };

  useEffect(() => {
    GetTodoss();
  }, [color, priority]);

  const columns = [
    { title: "Id", dataIndex: "Id", key: "Id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Due Date",
      dataIndex: "duedate",
      key: "duedate",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
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
      render: (
        _,
        record // record = current row ka data
      ) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this todo?"
            onConfirm={() => TodoDelete(record.Id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger>
              Delete
            </Button>
          </Popconfirm>
          <Button
            type="text"
            onClick={async () => {
              try {
                const res = await axios.post(
                  "http://localhost:3001/api/todo/getTodoById",
                  { id: record.Id },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.status) {
                  const todo = res.data.data;
                  setEditTodo(todo);
                  form.setFieldsValue({
                    ...todo,
                    duedate: todo.duedate ? dayjs(todo.duedate) : null,
                  });
                  setOpen(true);
                } else {
                  message.error(res.data.message);
                }
              } catch (err) {
                message.error("Failed to fetch todo details");
              }
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const addTodo = async (values) => {
    try {
      const dateSet = {
        ...values,
        duedate: dayjs(values.duedate).format("YYYY-MM-DD HH:mm:ss"),
      };

      if (editTodo) {
        const res = await axios.put(
          "http://localhost:3001/api/todo/update",
          {
            id: editTodo.Id,
            ...dateSet,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status) {
          message.success("Todo updated successfully");
          setEditTodo(null);
          setOpen(false);
          GetTodoss(currentPage, pageSize);
        } else {
          message.error(res.data.message);
        }
      } else {
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
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
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
        <div
          style={{
            textAlign: "right",
            display: "flex",
            justifyContent: "end",
            paddingTop: "20px",
          }}
        >
          <Button style={{ marginRight: "20px" }} onClick={download}>
            Download
          </Button>
          <Select
            value={priority}
            style={{ width: 120, marginRight: "20px" }}
            onChange={(value) => {
              setPriority(value);
              GetTodoss(1, pageSize);
            }}
          >
            <Select.Option value="all">All Priorities</Select.Option>
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
          </Select>
          <Select
            value={color}
            style={{ width: 110, marginBottom: 16, marginRight: "20px" }}
            onChange={(value) => {
              setColor(value);
              GetTodoss(1, pageSize);
            }}
          >
            <Select.Option value="all">All Colors</Select.Option>
            <Select.Option value="red">Red</Select.Option>
            <Select.Option value="yellow">Yellow</Select.Option>
            <Select.Option value="green">Green</Select.Option>
          </Select>
          <Search
            placeholder="Search todos..."
            allowClear
            onChange={(e) => GetTodoss(1, pageSize, e.target.value)}
            style={{ width: 300, marginRight: "20px" }}
            enterButton={false}
          />

          <Button
            type="primary"
            onClick={() => {
              setEditTodo(null);
              setOpen(true);
              form.resetFields();
            }}
          >
            Add Todo
          </Button>
        </div>

        <Modal
          title={editTodo ? "Edit Todo" : "Add Todo"}
          open={open}
          closable={false}
          footer={null}
          afterClose={() => {
            setEditTodo(null);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={addTodo}
            initialValues={{ color: "red", priorty: "medium" }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="duedate"
              label="Due Date"
              rules={[{ required: true, message: "Due Date is required" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="color" label="Color">
              <Select>
                <Select.Option value="red">Red</Select.Option>
                <Select.Option value="yellow">Yellow</Select.Option>
                <Select.Option value="green">Green</Select.Option>
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
          background: "#fff",
          minHeight: "80vh",
          borderRadius: "8px",
        }}
      >
        <Table
          columns={columns}
          dataSource={todos.map((todo, index) => ({
            ...todo,
            key: todo.Id ?? index,
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
