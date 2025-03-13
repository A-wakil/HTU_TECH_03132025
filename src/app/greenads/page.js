"use client"

import { useState, useEffect } from "react";
import AdCard from "../../components/ui/j_comp/AdCard.js";
import "./page.css"; 

function AdTab() {
    // Generate unique data for each ad
    const generateAdData = (index) => {
        return [
            { month: "Jan", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Feb", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Mar", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Apr", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "May", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Jun", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
        ];
    };

    // Create ads with unique data
    const ads = Array.from({ length: 10 }, (_, i) => ({
        name: `Ad ${i + 1}`,
        chartData: generateAdData(i)
    }));

    return(
        <main className="ad-tab">
            <div>
                <h1>Ads</h1>
            </div>
            <div className="ad-grid">
                {ads.map((ad, index) => (
                    <AdCard 
                        key={index} 
                        name={ad.name} 
                        chartData={ad.chartData}
                    />
                ))}
            </div>
        </main>
    );
}

export default AdTab;