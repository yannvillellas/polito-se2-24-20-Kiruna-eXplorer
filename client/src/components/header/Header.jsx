import './header.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../asset/logo.png'
import signup from '../../asset/signup.svg';

import { Button } from 'react-bootstrap';


function Header(props) {
  const navigate = useNavigate();

  return (
    <div className="header-wrapper">
      <div className="container-fluid">
        <div className="header-left">
          <Link to="/mainPage">
            <img
              src={logo}
              alt="Kiruna-Express Logo"
              className="logo-img"
            />
          </Link>
          <span className="separator">|</span>
          <nav className="header-center">
            <ul>
              <li><Link to="/mapPage">Map</Link></li>
              {<li><Link to="/documentPage">Documents</Link></li>}
              {<li><Link to="/diagram">Diagram</Link></li>}
            </ul>
          </nav>
        </div>
        <div className="header-right">

          {props.loggedIn ? (
            <Button onClick={props.handleLogout} className="btn-primary" style={{ marginRight: '15px', backgroundColor: '#3e5168', border: 'none' }}>Logout</Button>
          ) : (
            <>

              <Button 
                className="btn-primary" 
                onClick={() => { navigate('/registration') }}
                style={{ marginRight: '20px', backgroundColor: '#3e5168', border: 'none' }} 
              >
                <i class="bi bi-person-plus" style={{ marginRight: '8px' }}></i>
                Sign-Up
              </Button>

              <Button onClick={() => navigate('/login')} className="btn-primary" style={{ marginRight: '15px', backgroundColor: '#3e5168', border: 'none' }}>Login</Button>
            </>
          )}


        </div>
      </div>
    </div >
  );
}

export default Header;
