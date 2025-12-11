import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Avatar, Dropdown } from 'rsuite';

import { useAuthContext } from '../../context/AuthContext';
import { siteUrls } from '../../utils/siteUrls';
import { getUserAvatar, hasAnyNotifications } from '../../utils/utils';
import { pagesList } from '../../data/Pages';
import { Img } from '../ui';

export default function Header({ headerData }) {
  const { user } = useAuthContext();
  const email = user?.email || "Neznámý uživatel";

  // читаємо нотифікації прямо з контексту
  const notifications = user?.notifications || {};

  const avatarUrl = useMemo(() => {
    return getUserAvatar(user) + "?v=" + (user?.updatedAt || Date.now());
  }, [user]);

  //
  // Аватар-тригер меню
  //
  const renderToggle = (props, ref) => {
    const showBadge = hasAnyNotifications(notifications);

    const avatar = (
      <Avatar
        circle
        {...props}
        ref={ref}
        src={avatarUrl}
        style={{ cursor: "pointer" }}
      />
    );
  
    return showBadge ? (
      <Badge placement="topStart">
        {avatar}
      </Badge>
    ) : (
      avatar
    );
  };
  

  return (
    <div className="header">
      <div className="container">

        <Link to="/" className="header__logo-link">
          <Img src="/img/logo.png" alt="Logo" className="header__logo" />
        </Link>

        <h3 className="header__label">{headerData.title}</h3>

        <div className="header__user">
          <Dropdown renderToggle={renderToggle} placement="bottomEnd">

            {/* Верхня панель */}
            <Dropdown.Item panel style={{ padding: 10, width: 190 }}>
              <p style={{ margin: 0, opacity: 0.7 }}>Přihlášen jako</p>
              <strong>{email}</strong>
            </Dropdown.Item>

            <Dropdown.Separator />

            {/* Профіль */}
            <Dropdown.Item as={Link} to={siteUrls.editContacts(user?.id)}>
              <span>Profil</span>
            </Dropdown.Item>

            <Dropdown.Separator />

            {/* Інші розділи */}
            {pagesList.map((btn, i) => {
              const hasBadge = notifications?.[btn.key] === true;

              return (
                <Dropdown.Item as={Link} to={btn.to} key={i}>
                  {hasBadge ? (
                    <Badge placement="topStart">
                      <span>{btn.text}</span>
                    </Badge>
                  ) : (
                    <span>{btn.text}</span>
                  )}
                </Dropdown.Item>
              );
            })}

          </Dropdown>
        </div>

      </div>
    </div>
  );
}
