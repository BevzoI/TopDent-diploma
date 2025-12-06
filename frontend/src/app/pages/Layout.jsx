import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useState } from 'react';

export default function Layout() {
  const [headerData, setHeaderData] = useState({
    title: 'TopDentTeam',
  })

  return (
    <>
      <Header headerData={headerData} />
      <div className='page-content'>
        <div className="container">
          <Outlet context={{ setHeaderData }} />
        </div>
      </div>
    </>
  )
}
