import {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router";
import "./AdView.css"; 

function AdView() {
  const { adName } = useParams(); 
  const navigate = useNavigate();

  return (
    <div className="ad-view">
        <div className="ad-view-head">
            <button onClick={() => navigate(-1)}>⬅</button>
            <h1>{adName}</h1>
        </div>

        <div className="ad-view-video">
            <video controls>
                <source src="/Users/joyitodo/Downloads/IMG_6090.MOV" type="video/mov" />
            </video>
        </div>
        
        <div className="ad-view-content">
            <p>Details about {adName}</p>
        </div>
        
    </div>
  );
}

export default AdView;
