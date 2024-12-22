import React from "react";
import { useLanguage } from "../../../LanguageContext";

const Boutique = () => {

const { translations } = useLanguage();

    return (
        <div>
            <h1>{translations.page.shop.title}</h1>
        </div>
    );
};

export default Boutique;
