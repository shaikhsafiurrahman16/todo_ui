import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "antd/dist/reset.css";
import store from "./Routes/Redux/Store.jsx";
import { Provider } from "react-redux";


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
