import { Routes, Route } from "react-router-dom";

import Home from "../pages/store/Home";
import Login from "../pages/auth/Login";
import CadastroUser from "../pages/auth/CadastroUser";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/CadastroUser" element={<CadastroUser />} />
        </Routes>
    );
}

export default AppRoutes;