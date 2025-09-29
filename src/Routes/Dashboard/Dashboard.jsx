import { useEffect, useState } from "react";
import { Card, Row, Col, message } from "antd";
import axios from "axios";
import {
  BarChart,
  Cell,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
function Dashboard() {
  const [completed, setCompleted] = useState(0); // total todos kay count kay lia
  const [pending, setPending] = useState(0); // pending todos kay count kay lia
  const [all, setAll] = useState(0); // all todos kay count kay lia
  const [chart, setChart] = useState([]); //chart kay lia

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Unauthorized! Please login again.");
          return;
        }

        const completedTodos = await axios.get(
          "http://localhost:3001/api/dashboard/completedTodo",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (completedTodos.data.status) setCompleted(completedTodos.data.data);

        const pendingTodos = await axios.get(
          "http://localhost:3001/api/dashboard/pendingTodo",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (pendingTodos.data.status) setPending(pendingTodos.data.data);

        const alltodos = await axios.post(
          "http://localhost:3001/api/todo/read",
          { page: 1, limit: 10000 }, // large limit to get all todos
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (alltodos.data.status) {
          setAll(alltodos.data.totalTodos); // ya res.data.data.length bhi le sakte ho
        }

        const res = await axios.post(
          "http://localhost:3001/api/dashboard/report",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const apiData = res.data.data;
        
        // const apidata = apiData.january
        // const apidata = apiData['january']

        setChart(
          Object.keys(apiData).map((month) => (
            {
            month,
            todos: apiData[month],
          }
        
        ))
        );
      } catch (err) {
        console.error("Error fetching counts:", err);
        message.error("Failed to fetch todo counts");
      }
    };

    fetchCounts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={40}>
        <Col span={8}>
          <Card
            title="Completed"
            style={{
              backgroundColor: "#e4f7e4",
              textAlign: "center",
              height: "150px",
            }}
          >
            <h1>{completed}</h1>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Pending"
            style={{
              backgroundColor: "#f9f2d7",
              textAlign: "center",
              height: "150px",
            }}
          >
            <h1>{pending}</h1>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="All"
            style={{
              backgroundColor: "#f7d1d1",
              textAlign: "center",
              height: "150px",
            }}
          >
            <h1>{all}</h1>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card title="Todo Status">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={chart}>
                <CartesianGrid />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="todos">
                  {chart.map((entry, index) => (
                    <Cell
                      key={`index-${index}`} //  har bar kee unique id
                      fill={
                        ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
