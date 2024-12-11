import './header.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../asset/logo.png'

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
            </ul>
          </nav>
        </div>
        <div className="header-right">
          {props.loggedIn ? (
            <button onClick={props.handleLogout} className="logout-btn">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="login-btn">Login</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
