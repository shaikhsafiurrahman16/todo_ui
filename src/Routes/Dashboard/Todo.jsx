import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getTodos,
  OverdueTodos,
  addTodo as addTodoThunk,
  deleteTodo as deleteTodoThunk,
  getTodoById, 
} from "../Redux/TodoSlice";
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
import { Header, Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Search } = Input;

function Todo() {
  const dispatch = useDispatch();

  const { todos = [], total = 0, loading = false, selectedTodo = null } =
    useSelector((state) => state.todo || {});

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [editTodo, setEditTodo] = useState(null);
  const [color, setColor] = useState("all");
  const [priority, setPriority] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    fetchPage(1);
  }, [showOverdue, color, priority]);

  const fetchPage = (page = 1, search = searchText) => {
    setCurrentPage(page);
    const params = { page, search, color, priority };
    if (showOverdue) {
      dispatch(OverdueTodos(params));
    } else {
      dispatch(getTodos(params));
    }
  };

  const handlePageChange = (page) => {
    fetchPage(page, searchText);
  };


  const AddOrEdit = async (values) => {
    try {
      const payload = {
        ...values,
        duedate: values.duedate
          ? dayjs(values.duedate).format("YYYY-MM-DD HH:mm:ss")
          : null,
      };
      await dispatch(
        addTodoThunk({
          id: editTodo?.Id,
          values: payload,
        })
      ).unwrap();

      message.success(editTodo ? "Todo updated" : "Todo added");
      setOpen(false);
      setEditTodo(null);
      form.resetFields();
      fetchPage(currentPage);
    } catch (err) {
      message.error(err?.message || "Failed to save todo");
    }
  };

  const Delete = async (id) => {
    try {
      await dispatch(deleteTodoThunk(id)).unwrap();
      message.success("Todo deleted");
      fetchPage(currentPage);
    } catch (err) {
      message.error(err?.message || "Failed to delete todo");
    }
  };

  const Edit = async (id) => {
    try {
      const res = await dispatch(getTodoById(id)).unwrap(); // 👈 Redux call
      if (res.status) {
        const todo = res.data;
        setEditTodo(todo);
        form.setFieldsValue({
          ...todo,
          duedate: todo.duedate ? dayjs(todo.duedate) : null,
        });
        setOpen(true);
      } else {
        message.error(res.message || "Failed to fetch todo");
      }
    } catch (err) {
      message.error("Failed to fetch todo details");
    }
  };

  const download = async () => {
    try {
      let allTodos = [];
      const endpoint = showOverdue ? "/todo/overdue" : "/todo/read";
      for (let page = 1, more = true; more; page++) {
        const res = await fetch(
          endpoint,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page,
              limit: pageSize,
              color,
              priorty: priority,
              search: searchText,
            }),
          }
        );
        const data = await res.json();
        const todos = data.data || [];
        if (data.status && todos.length > 0) {
          allTodos.push(...todos);
          more = todos.length === pageSize;
        } else {
          more = false;
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
      render: (col) => {
        const textColor = col === "yellow" ? "#000" : "#fff";
        return (
          <div
            style={{
              backgroundColor: col,
              padding: "5px 10px",
              borderRadius: "15px",
              color: textColor,
              textAlign: "center",
              fontWeight: 500,
              minWidth: "60px",
            }}
          >
            {col ? col.charAt(0).toUpperCase() + col.slice(1) : "-"}
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
            onConfirm={() => Delete(record.Id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger>
              Delete
            </Button>
          </Popconfirm>

          <Button type="text" onClick={() => Edit(record.Id)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const searchValue = (e) => {
    const value = e.target.value;
    setSearchText(value);
    fetchPage(1, value);
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
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "10px",
            paddingTop: "20px",
          }}
        >
          <Checkbox
            checked={showOverdue}
            onChange={(e) => {
              setShowOverdue(e.target.checked);
            }}
          >
            Show Overdue Only
          </Checkbox>

          <Button onClick={download}>Download</Button>

          <Select
            value={color}
            style={{ width: 150 }}
            onChange={(c) => setColor(c)}
          >
            <Select.Option value="all">All Colors</Select.Option>
            <Select.Option value="red">Red</Select.Option>
            <Select.Option value="green">Green</Select.Option>
            <Select.Option value="yellow">Yellow</Select.Option>
          </Select>

          <Select
            value={priority}
            style={{ width: 150 }}
            onChange={(p) => setPriority(p)}
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
            onChange={searchValue}
            style={{ width: 300 }}
            enterButton={false}
          />

          <Button
            type="primary"
            onClick={() => {
              setEditTodo(null);
              form.resetFields();
              setOpen(true);
            }}
          >
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
          <Form
            form={form}
            layout="vertical"
            onFinish={AddOrEdit}
            initialValues={{ color: "red", priorty: "medium" }}
          >
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
              rules={[
                { required: true, message: "Please enter description" },
              ]}
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
            onChange: handlePageChange,
            showSizeChanger: false,
          }}
        />
      </Content>
    </Layout>
  );
}

export default Todo;
