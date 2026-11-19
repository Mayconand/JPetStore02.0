import { Routes, Route } from "react-router-dom";

import Home from "../pages/store/Home";
import Login from "../pages/auth/Login";
import CadastroUser from "../pages/auth/CadastroUser";
import HomeClient from "../pages/client/HomeClient";
import Products from "../pages/client/Products";
import SpecificProduct from "../pages/client/SpecificProduct";
import Cart from "../pages/client/Cart";
import AdressPayment from "../pages/client/AdressPayment";
import DetailsPayment from "../pages/client/DetailsPayment";
import Orders from "../pages/client/Orders";
import ErrorPage from "../pages/store/ErrorPage";
import ProfilePage from "../pages/client/ProfilePage";
import HelpPage from "../pages/client/HelpPage";
import DashboardAdm from "../pages/admin/DashboardAdm";
import CadastroCachorro from "../pages/admin/CadastroCachorro";
import CadastroGato from "../pages/admin/CadastroGato";
import CadastroReptil from "../pages/admin/CadastroReptil";
import CadastroPassaro from "../pages/admin/CadastroPassaro";
import CadastroPeixe from "../pages/admin/CadastroPeixe";
import ListaCachorros from "../pages/admin/ListaCachorros";
import ListaGatos from "../pages/admin/ListaGatos";
import ListaRepteis from "../pages/admin/ListaRepteis";
import ListaPassaros from "../pages/admin/ListaPassaros";
import ListaPeixes from "../pages/admin/ListaPeixes";


function AppRoutes() { 
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/CadastroUser" element={<CadastroUser />} />
            <Route path="/HomeClient" element={<HomeClient />} />
            <Route path="/Products" element={<Products />} />
            <Route path="/SpecificProduct" element={<SpecificProduct />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/AdressPayment" element={<AdressPayment />} />
            <Route path="/DetailsPayment" element={<DetailsPayment />} />
            <Route path="/Orders" element={<Orders />} />
            <Route path="/ErrorPage" element={<ErrorPage />} />
            <Route path="/ProfilePage" element={<ProfilePage />} />
            <Route path="/HelpPage" element={<HelpPage />} />
            <Route path="/DashboardAdm" element={<DashboardAdm />} />
            <Route path="/adm/adicionar" element={<CadastroCachorro />} />
            <Route path="/adm/adicionar-gato" element={<CadastroGato />} />
            <Route path="/adm/adicionar-reptil" element={<CadastroReptil />} />
            <Route path="/adm/adicionar-passaro" element={<CadastroPassaro />} />
            <Route path="/adm/adicionar-peixe" element={<CadastroPeixe />} />
            <Route path="/adm/categoria/cachorro" element={<ListaCachorros />} />
            <Route path="/adm/categoria/gatos" element={<ListaGatos />} />
            <Route path="/adm/categoria/repteis" element={<ListaRepteis />} />
            <Route path="/adm/categoria/passaros" element={<ListaPassaros />} />
            <Route path="/adm/categoria/peixes" element={<ListaPeixes />} />
        </Routes>
    );
}

export default AppRoutes;