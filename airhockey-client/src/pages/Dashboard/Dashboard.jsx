import React from "react";
import { useLanguage } from "../../../LanguageContext";

const Dashboard = () => {

    const { translations } = useLanguage();

    return (
        <div>
            <h1>{translations.page.home.title}</h1>

        </div>
    );
}

export default Dashboard;
