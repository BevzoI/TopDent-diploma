import { Link } from 'react-router-dom';
import Img from '../ui/Img';
import { useAuthContext } from '../../context/AuthContext';
import { Badge, Avatar, Tooltip, Whisper } from 'rsuite';
import { filePath, siteUrls } from '../../utils/siteUrls';
import { getUserAvatar } from '../../utils/utils';

export default function Header({ headerData }) {
  const { user } = useAuthContext();

  const email = user?.email || "Neznámý uživatel";

  return (
    <div className='header'>
      <div className="container">

        <Link to="/" className="header__logo-link">
          <Img src="/img/logo.png" alt="Logo" className='header__logo' />
        </Link>

        <h3 className="header__label">{headerData.title}</h3>

        <Link to={siteUrls.userEdit} className="header__user">
          <Whisper
            placement="bottomEnd"
            trigger="hover"
            speaker={<Tooltip>{email}</Tooltip>}
          >
            <Badge content={6} placement="topStart">
              <Avatar circle src={getUserAvatar(user) + "?v=" + Date.now()} />
            </Badge>
          </Whisper>
        </Link>

      </div>
    </div>
  );
}
