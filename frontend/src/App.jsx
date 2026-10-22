import { useState } from "react";
import Categories from "./pages/Categories";
import Unites from "./pages/Unites";
import Produits from "./pages/Produits";
import Fournisseurs from "./pages/Fournisseurs";
import Achats from "./pages/Achats";
import "./index.css";

export default function App() {
    const [page, setPage] = useState("categories");

    function changerPage(nouvellePage) {
        setPage(nouvellePage);
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <h2>StockManager</h2>

                <nav>
                    <button
                        type="button"
                        className={`nav-link ${
                            page === "categories" ? "active" : ""
                        }`}
                        onClick={() => changerPage("categories")}
                    >
                        Catégories
                    </button>

                    <button
                        type="button"
                        className={`nav-link ${
                            page === "unites" ? "active" : ""
                        }`}
                        onClick={() => changerPage("unites")}
                    >
                        Unités
                    </button>

                    <button
                        type="button"
                        className={`nav-link ${
                            page === "produits" ? "active" : ""
                        }`}
                        onClick={() => changerPage("produits")}
                    >
                        Produits
                    </button>

                    <button
                        type="button"
                        className={`nav-link ${page === "fournisseurs" ? "active" : ""}`}
                        onClick={() => changerPage("fournisseurs")}
                    >
                        Fournisseurs
                    </button>

                    <button
                        type="button"
                        className={`nav-link ${page === "achats" ? "active" : ""}`}
                        onClick={() => changerPage("achats")}
                    >
                        Achats
                    </button>
                </nav>

                <div className="sidebar-footer">
                    Gestion de stock
                    <span>Administration</span>
                </div>
            </aside>

            <div className="main-content">
                <header className="topbar">
                    <div>
                        <span className="topbar-title">
                            Gestion de stock
                        </span>
                        <span className="topbar-subtitle">
                            Application de gestion
                        </span>
                    </div>

                    <div className="admin-badge">
                        <span className="admin-avatar">A</span>
                        <span>Administration</span>
                    </div>
                </header>

                <main className="content-area">
                    {page === "categories" && <Categories />}
                    {page === "unites" && <Unites />}
                    {page === "produits" && <Produits />}
                    {page === "fournisseurs" && <Fournisseurs />}
                    {page === "achats" && <Achats />}
                </main>
            </div>
        </div>
    );
}
