import React from 'react';
import './mainPage.css';
import { useNavigate } from 'react-router-dom';
import signup from '../../asset/signup.svg';

function MainPage(props) {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <div className="content-wrapper">
        <h1 className="welcome-text">Kiruna </h1>
        <h1 className="welcome-text">Relocation</h1>
        <h1 className="welcome-text">Explorer</h1>
        <p>
          200 Km north of the Artic Circle, you will experience contrasts from northen lights to the midnight sun, 
          the highest mountain in Sweden to the world's largest underground iron-one mine,
          ancient Sàmi culture to an angoing city trasformation.
        </p>
        {!props.loggedIn && (
            
          <button className="btn-secondary" onClick={()=>{navigate('/registration')}}>
            <img src={signup} alt="" />
             Sign-Up
          </button>
        ) }
        
      </div>
    </div>
  );
}

export default MainPage;
