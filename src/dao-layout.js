import React, {useEffect} from 'react';
import { Link, Outlet, useParams } from 'react-router-dom'
import { slide as Menu } from 'react-burger-menu';

const Layout = ({setDao}) => {
  const { dao } = useParams();
  useEffect(() => {
    setDao(dao);
  }, [dao, setDao]);

  return (
    <>
      <Menu pageWrapId={ "page-wrapper" } outerContainerId={ "App" }>
        <Link className="menu-item" to="">
          Dao Dashboard
        </Link>

        <Link className="menu-item" to="jobs">
          Jobs
        </Link>

        <Link className="menu-item" to="tasks">
          Tasks
        </Link>

        <Link className="menu-item" to="members">
          Members
        </Link>
      </Menu>
      
      <main id="page-wrapper">
        <Outlet/>
      </main>
    </>
  );
};

export default Layout;