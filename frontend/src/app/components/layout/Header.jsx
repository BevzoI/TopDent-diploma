import { Link } from 'react-router-dom';
import Img from '../ui/Img';
import { useAuthContext } from '../../context/AuthContext';


export default function Header({ headerData }) {
  const { user } = useAuthContext();

  return (
    <div className='header'>
        <div className="container">

            <Link to="/" className="header__logo-link">
                <Img src="/img/logo.png" alt="Logo" className='header__logo' />
            </Link>

            <h3 className="header__label">{headerData.title}</h3>

            <div className="header__user">
                <Img src="/img/avatar.jpg" alt="User" className='header__user-img' />
            </div>

        </div>
    </div>
  )
}
