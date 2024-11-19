import './header.css';
import { Link, useNavigate } from 'react-router-dom';

function Header(props) {
    const navigate = useNavigate();
    
  return (
    <div className="header-wrapper">
      <div className='container-fluid'>
          <nav>
          <label htmlFor="check" className="checkbtn">
              <i className="fa-solid fa-bars"></i>
          </label>

          <label className="logo">Kiruna-Express</label>

          <ul>
              <li><Link to="/homePage" >Map</Link></li>
              {props.isUrbanPlanner && <li><Link to="/documentPage" >Documents</Link></li>}
              {props.loggedIn ?   <button onClick={props.handleLogout}>Logout</button>:
                                  <button onClick={()=>{navigate('/login')}}>Login</button>}
          </ul>
          </nav>
      </div>
  </div>

  );
}

export default Header;
