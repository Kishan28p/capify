
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login/Login";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="login/" element={<Login/>} />
          </Routes> 
      </BrowserRouter>
      {/* <Home/> */}
      {/* <Login/> */}
    </div>
  );
}

export default App;
