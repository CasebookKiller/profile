import { MegaMenu } from 'primereact/megamenu';
import { MenuItem } from 'primereact/menuitem';
import React, { FC } from 'react';
import { Link } from '@/components/Link/Link';

export const TopMenu: FC = () => {
  const itemRenderer = (item: MenuItem) => (
      <Link to={item.url||'/'} className="flex align-items-center p-menuitem-link">
        <span className={item.icon} />
        <span className="mx-1">{item.label}</span>
      </Link>
    );
  const items: MenuItem[] = [
    {
      label: 'Главная',
      url: '/',
      icon: 'pi pi-home',
      template: itemRenderer
    },
    {
      label: 'Что купить',
      url: '/catalog',
      icon: 'pi pi-shopping-cart',
      template: itemRenderer
    },
    {
      label: 'Настройки',
      url: '/settings',
      icon: 'pi pi-cog',
      template: itemRenderer
    }
  ];

return (
  <React.Fragment>
  {true && <div id='header'
    style={{
      position:"sticky",
      top: 0,
      overflow: "hidden",
      zIndex: 7777
    }}
  >
    <MegaMenu model={items} className='shadow-5 justify-content-center' style={{
      border: '1px solid var(--tg-theme-hint-color)',
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
      background: 'var(--tg-theme-secondary-bg-color)'
    }}/>
  </div>}
  </React.Fragment>
  )
}