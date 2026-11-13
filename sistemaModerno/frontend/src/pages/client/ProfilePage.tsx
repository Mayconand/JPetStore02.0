
import "./ProfilePage.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link } from "react-router-dom";

function ProfilePage() {

    return (

        <div className="container detailsPaymentPage">

            <header className="headerClient">

                <Link to="/" className="logoLink">

                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />

                </Link>

            </header>

            <main className="ProfileMain">
                
            </main>

        </div>

    );

}

export default ProfilePage;
