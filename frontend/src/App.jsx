import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import MyJobs from "./pages/MyJob";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

function App(){
  return(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>

          <Route element={  <ProtectedRoute>
                              <AppLayout />
                            </ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/myjobs" element={<MyJobs />}/>
          </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App;