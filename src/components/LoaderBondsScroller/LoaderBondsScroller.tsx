import { BondsService } from '@/api/tbank/BondsService';
import * as RU from '../../locale/ru.json';

import { IBond, TIBond } from '@/api/tbank/types';
import { addLocale, locale as Locale  } from 'primereact/api';
import { DataScroller } from 'primereact/datascroller';
import { FloatLabel } from 'primereact/floatlabel';
import { FC, JSX, RefObject, useEffect, useRef, useState } from 'react';
import { Rating } from 'primereact/rating';
import { convertTIBond, getRiskLevel, getRiskLevelText, getSeverity, getStatus } from '@/api/tbank/methods';
import { BookmarkButton } from '../BookmarkButton/BookmarkButton';
import { Tag } from 'primereact/tag';
import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '@/hooks/useAuth';
import { fetchBonds } from '@/utils/common';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

interface IBondsScrollerProps {
  bonds: IBond[];
}
  
const LoaderBondsScroller: FC<IBondsScrollerProps> = (props) => {
  const [bonds, setBonds] = useState<IBond[]>([]);
  const ds = useRef<DataScroller | null>(null);
  const [filterValue, setFilterValue] = useState('');

  const { user } = useAuth();
  const { getItem } = useLocalStorage();
  
  const [/*fullaccess*/, setFullAccess] = useState<string>();
  const [/*readonly*/, setReadOnly] = useState<string>();
  const [/*sandbox*/, setSandBox] = useState<string>();

  const itemRefs = useRef<RefObject<HTMLDivElement|null>[]>([]);

  useEffect(() => {
    getBonds();
  }, []);

  function getBonds() {
    const data = getItem('tokens');
    const tokens = JSON.parse(data || '{}');
    
    if (data) {
      if (tokens.fullaccess) setFullAccess(tokens.fullaccess);
      if (tokens.readonly) setReadOnly(tokens.readonly);
      if (tokens.sandbox) setSandBox(tokens.sandbox);
      
    }
    if (tokens.readonly === '' && tokens.fullaccess === '' && tokens.sandbox === '') return;
    const ttoken = tokens.readonly !== '' ? tokens.readonly : tokens.fullaccess !== '' ? tokens.fullaccess : tokens.sandbox !== '' ? tokens.sandbox : '';
      
    if (!user?.token) return;

    if (ttoken !== '') fetchBonds(`http://${HOST}:${PORT}/getBonds`, ttoken, user?.token)
    .then(res => {
      return res.json();
    }).then(res => {
      let bonds: IBond[] = [];
      res.forEach((bond: TIBond) => {
        bonds.push(convertTIBond(bond));
      })
      setBonds(bonds);
    });
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    let filteredList = bonds.filter((item: IBond) => {
        return item.name.toLowerCase().includes(value);
      }
    );
    console.log('filteredList: ', filteredList);
    setFilterValue(value);
    if (value.length === 0) {
      BondsService.getBonds(props.bonds).then((data) => setBonds(data));

    } else {
      setBonds(filteredList);
    }

  };
  
  useEffect(() => {
  }, [bonds]);

  useEffect(() => {
    if (bonds.length === 0) {
      BondsService.getBonds(props.bonds).then((data) => setBonds(data));
    } else {
      console.log('%cbonds: ', 'color: firebrick; background-color: white', bonds);
    }

  }); // eslint-disable-line react-hooks/exhaustive-deps

  const ItemTemplate = ({ data }: { data: IBond }): JSX.Element => {
    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!itemRefs.current.find((item) => item.current?.id === elementRef.current?.id)) {
        console.log('elementRef: ', elementRef);
        itemRefs.current.push(elementRef);
      } 
    },[elementRef]);

    //console.log(loadedBonds.current.length);
    return (
      <div 
        id={data.isin}
        ref={elementRef}
        className='col-12'
      >
        <div className='flex flex-column md:flex-row md:align-items-start p-1 gap-1' style={{minWidth: '300px'}}>
          <div className='flex overflow-hidden flex-column sm:flex-row justify-content-between align-items-top md:align-items-start sm:flex-1 gap-1'>
            <div className='flex flex-column align-items-center sm:align-items-start gap-1'>
              <div className='flex flex-column gap-1'>
                <div className='text-md font-bold'>{data.name}</div>
                <div className=''>{data.isin}</div>
              </div>
              <div className='flex flex-column gap-1'>
                {/*<Rating value={data.rating} readOnly cancel={false}></Rating>*/}
                <span className='flex align-items-center gap-1'>
                  {/*<i className='pi pi-tag product-category-icon'></i>*/}
                  <Rating
                    className={'bonds'}
                    value={getRiskLevel(data) ?? 0}
                    alt={getRiskLevelText(data) ?? ''}
                    readOnly
                    cancel={false}
                    stars={3}
                  />
                  {/*<span className={classNames('font-semibold', 'text-' + getRiskLevel(data))}>{getRiskLevelText(data)}</span>*/}
                </span>
              </div>
            </div>
            <div className='flex w-4 flex-row sm:flex-column align-items-center sm:align-items-end gap-1 md:gap-1'>
              <span className='text-md font-semibold'>{Number(data.nominal.units).toLocaleString('ru-RU')} ₽</span>
              <BookmarkButton isin={data.isin} />
              <Tag className='bonds' value={getStatus(data)} severity={getSeverity(data)}></Tag>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const footer = (
    <React.Fragment>
      {<Button
        type='button'
        className='profile mb-4'
        icon='pi pi-angle-down'
        label='Загрузить'
        onClick={() => {
          if (ds.current !== null && ds.current.load) {
            //console.log(ds.current);
            ds.current.load();
          }
        }} 
      />}
    </React.Fragment>
  );

  const lng = 'ru';

  addLocale(lng, RU.ru);
  Locale(lng);

  return (
    <div className="card">
      <div className="p-grid p-dir-col mt-4">
        <div className="p-col-12 my-2">
          <FloatLabel>
            <InputText
              type="search"
              onChange={(e) => {
                handleFilterChange(e)}} 
              value={filterValue}
              className='profile w-full'
              id='bondsfilter'
            />
            <label htmlFor="bondsfilter">Фильтрация...</label>
          </FloatLabel>
        </div>
      
        <DataScroller
          ref={ds}
          value={bonds}
          onLoad={(event)=>console.log(event)}
          itemTemplate={(item)=>{
            return <ItemTemplate data={item}/>;
          }}
          rows={5}
          loader
          footer={footer}
          /*header={<div className='text-xl mt-2 font-bold text-900'>Список облигаций</div>}*/
        />
        
      </div>
        
    </div>
    
  )
}

export default LoaderBondsScroller;

