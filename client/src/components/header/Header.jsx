import './header.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

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
              {props.loggedIn ?   <Button onClick={props.handleLogout}>Logout</Button>:
                                  <Button onClick={()=>{navigate('/login')}}>Login</Button>}
          </ul>
          </nav>
      </div>
  </div>

  );
}

export default Header;
