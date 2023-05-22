import "./App.css";
import { Login } from "./pages/login";
import { Route, Routes } from "react-router-dom";
import { Posts } from "./pages/posts";

function App() {
  return (
    <>
        <Routes>
          <Route exact path="/login" element={<Login/>} />
          <Route exact path="/posts" element={<Posts/>} />
        </Routes>
    </>
  );
}

export default App;
