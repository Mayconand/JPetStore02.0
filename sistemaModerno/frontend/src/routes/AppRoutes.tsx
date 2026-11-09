import { Routes, Route } from "react-router-dom";

import Home from "../pages/store/Home";
import Login from "../pages/auth/Login";
import CadastroUser from "../pages/auth/CadastroUser";
import HomeClient from "../pages/client/HomeClient";
import Products from "../pages/client/Products";
import SpecificProduct from "../pages/client/SpecificProduct";

function AppRoutes() { 
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/CadastroUser" element={<CadastroUser />} />
            <Route path="/HomeClient" element={<HomeClient />} />
            <Route path="/Products" element={<Products />} />
            <Route path="/SpecificProduct" element={<SpecificProduct />} />
        </Routes>
    );
}

export default AppRoutes;