import { Routes, Route } from "react-router-dom";

import Home from "../pages/store/Home";
import Login from "../pages/auth/Login";
import CadastroUser from "../pages/auth/CadastroUser";
import HomeClient from "../pages/client/HomeClient";

function AppRoutes() { 
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/CadastroUser" element={<CadastroUser />} />
            <Route path="/homeClient" element={<HomeClient />} />
        </Routes>
    );
}

export default AppRoutes;