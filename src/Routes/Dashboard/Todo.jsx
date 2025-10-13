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
  Checkbox,
} from "antd";
const { Search } = Input;
import axios from "../Axios";
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Todo() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editTodo, setEditTodo] = useState(null);
  const [color, setColor] = useState("all");
  const [priority, setPriority] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  const pageSize = 8;

  const GetTodoss = async (page = 1, limit = pageSize, searchValue) => {
    try {
      setLoading(true);
      const searchToSend = searchValue !== undefined ? searchValue : searchText;
      const res = await axios.post("/todo/read", {
        page,
        limit,
        search: searchToSend,
        color,
        priorty: priority,
      });

      if (res.data.status) {
        setTodos(res.data.data);
        setTotal(res.data.totalTodos);
        setCurrentPage(page);
      } else {
        setTodos([]);
        message.warning("No todos found");
      }
    } catch (err) {
      console.log(err);
      message.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueTodos = async (page = 1, limit = pageSize, searchValue) => {
    try {
      setLoading(true);
      const searchToSend = searchValue !== undefined ? searchValue : searchText;
      const res = await axios.post("/todo/overdue", {
        page,
        limit,
        search: searchToSend,
        color,
        priorty: priority,
      });

      if (res.data.status) {
        setTodos(res.data.data);
        setTotal(res.data.totalOverdue);
        setCurrentPage(page);
      } else {
        setTodos([]);
        message.info(res.data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch overdue todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showOverdue) fetchOverdueTodos();
    else GetTodoss();
  }, [showOverdue, color, priority]);

  const download = async () => {
    try {
      let allTodos = [];
      const endpoint = showOverdue ? "/todo/overdue" : "/todo/read";

      for (let page = 1, moreTodos = true; moreTodos; page++) {
        const res = await axios.post(endpoint, {
          page,
          limit: 8,
          color,
          priorty: priority,
          search: searchText,
        });

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
      doc.text(showOverdue ? "Overdue Todos" : "Todos List", 14, 10);

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

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save(
        showOverdue ? "overdue_todos.pdf" : `todos_${color}_${priority}.pdf`
      );
    } catch (err) {
      message.error("Failed to download all pages");
    }
  };

  const addTodo = async (values) => {
    try {
      const dateSet = {
        ...values,
        duedate: dayjs(values.duedate).format("YYYY-MM-DD HH:mm:ss"),
      };

      if (editTodo) {
        const res = await axios.put("/todo/update", {
          id: editTodo.Id,
          ...dateSet,
        });

        if (res.data.status) {
          message.success("Todo updated successfully");
          setEditTodo(null);
          form.resetFields();
          setOpen(false);
          showOverdue
            ? fetchOverdueTodos(currentPage, pageSize)
            : GetTodoss(currentPage, pageSize);
        } else {
          message.error(res.data.message);
        }
      } else {
        const res = await axios.post("/todo/create", dateSet);
        if (res.data.status) {
          message.success("Todo added successfully");
          form.resetFields();
          setOpen(false);
          showOverdue
            ? fetchOverdueTodos(currentPage, pageSize)
            : GetTodoss(currentPage, pageSize);
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
      const res = await axios.post("/todo/delete", { id });

      if (res.data.status) {
        message.success(res.data.message);
        showOverdue
          ? fetchOverdueTodos(currentPage, pageSize)
          : GetTodoss(currentPage, pageSize);
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      message.error("Failed to delete todo");
    }
  };

  const columns = [
    { title: "Id", dataIndex: "Id", key: "Id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Due Date",
      dataIndex: "duedate",
      key: "duedate",
      render: (date) => {
        if (!date) return "-";
        const isOverdue = dayjs().isAfter(dayjs(date), "second");
        return (
          <span style={{ color: isOverdue ? "red" : "black" }}>
            {dayjs(date).format("DD/MM/YYYY HH:mm:ss")}
          </span>
        );
      },
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
      render: (_, record) => (
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
                const res = await axios.post("/todo/getTodoById", {
                  id: record.Id,
                });

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
              } catch {
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
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "10px",
            paddingTop: "20px",
          }}
        >

          <Checkbox
            checked={showOverdue}
            onChange={(e) => setShowOverdue(e.target.checked)}
          >
            Show Overdue Only
          </Checkbox>

          <Button onClick={download}>Download</Button>

          <Select
            value={color}
            style={{ width: 150 }}
            onChange={(value) => setColor(value)}
          >
            <Select.Option value="all">All Colors</Select.Option>
            <Select.Option value="red">Red</Select.Option>
            <Select.Option value="green">Green</Select.Option>
            <Select.Option value="yellow">Yellow</Select.Option>
          </Select>

          <Select
            value={priority}
            style={{ width: 150 }}
            onChange={(value) => setPriority(value)}
          >
            <Select.Option value="all">All Priorities</Select.Option>
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
          </Select>

          <Search
            placeholder="Search Todos..."
            allowClear
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              showOverdue
                ? fetchOverdueTodos(1, pageSize, value)
                : GetTodoss(1, pageSize, value);
            }}
            style={{ width: 300 }}
            enterButton={false}
          />

          <Button type="primary" onClick={() => setOpen(true)}>
            Add Todo
          </Button>
        </div>

        <Modal
          open={open}
          title={editTodo ? "Edit Todo" : "Add Todo"}
          onCancel={() => {
            setOpen(false);
            setEditTodo(null);
            form.resetFields();
          }}
          okText={editTodo ? "Update" : "Add"}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={addTodo} initialValues={{ color: "red", priorty: "medium" }}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="duedate" label="Due Date">
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item name="color" label="Color">
              <Select>
                <Select.Option value="red">Red</Select.Option>
                <Select.Option value="green">Green</Select.Option>
                <Select.Option value="yellow">Yellow</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="priorty" label="Priority">
              <Select>
                <Select.Option value="low">Low</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="high">High</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Header>

      <Content
        style={{
          padding: "20px",
          background: "#fff",
          minHeight: "82vh",
          borderRadius: "8px",
        }}
      >
        <Table
          dataSource={todos}
          columns={columns}
          rowKey="Id"
          loading={loading}
          pagination={{
            current: currentPage,
            total,
            pageSize,
            onChange: (page) => {
              showOverdue
                ? fetchOverdueTodos(page, pageSize)
                : GetTodoss(page, pageSize);
            },
            showSizeChanger: false,
          }}
        />
      </Content>
    </Layout>
  );
}

export default Todo;
