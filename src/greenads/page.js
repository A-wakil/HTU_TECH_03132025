import { useState, useEffect } from "react";
import AdCard from "../components/ui/j_comp/AdCard.js/index.js";
import "./page.css"; 

function AdTab(){
    const ads = Array.from({ length: 10 }, (_, i) => `Ad ${i + 1}`);

    return(
        <main className="ad-tab">
            <div>
                <h1>Ads</h1>
            </div>
            <div className="ad-grid">
                {ads.map((adName, index) => (
                    <AdCard key={index} name={adName} />
                ))}
            </div>
        </main>

    )
    

}

export default AdTab;