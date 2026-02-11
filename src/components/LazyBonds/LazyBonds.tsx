import '@/components/LazyList/LazyList.css';

import { ChangeEvent, JSX, useEffect, useRef, useState } from 'react';

import { IBond, TIBond } from '@/api/tbank/types';
import { Tag } from 'primereact/tag';
import { convertTIBond, getRiskLevel, getRiskLevelText, getSeverity, getStatus } from '@/api/tbank/methods';
import { BookmarkButton } from '../BookmarkButton/BookmarkButton';
import { Rating } from 'primereact/rating';
import { fetchBonds } from '@/utils/common';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';

const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

// Новый подход: берем данные из массива, а не генерируем их заново
const BOND_PAGE_SIZE = 5; // Количество облигаций на одну страницу подгрузки

// Основной компонент LazyLoader
const LazyBonds = () => {
  const [allBonds, setAllBonds] = useState<IBond[]>([]);

  const [currentPage, setCurrentPage] = useState(0); // Текущая страница подгрузки
  
  const [bonds, setBonds] = useState<IBond[]>([]);
  const [filteredBonds, setFilteredBonds] = useState<IBond[]>([]);
  
  const [filterValue, setFilterValue] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLUListElement | null>(null);

  const { user } = useAuth();
  const { getItem } = useLocalStorage();
  
  const [
    /*fullaccess*/
    , setFullAccess] = useState<string>();
  const [
    /*readonly*/
    , setReadOnly] = useState<string>();
  const [
    /*sandbox*/
    , setSandBox] = useState<string>();

  useEffect(() => {
    getAllBonds();
  }, []);

  function getAllBonds() {
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
      let allbonds: IBond[] = [];
      res.forEach((bond: TIBond) => {
        allbonds.push(convertTIBond(bond));
      })
      setAllBonds(allbonds);
    });
  }

  // Получаем фрагмент данных из исходного массива
  const loadNextPage = () => {
    const startIdx = currentPage * BOND_PAGE_SIZE;
    const endIdx = startIdx + BOND_PAGE_SIZE;
    const nextBonds = filterValue.length > 0 ? filteredBonds.slice(startIdx, endIdx) : allBonds.slice(startIdx, endIdx);
    
    if (nextBonds.length > 0) {
      filteredBonds.length > 0 ? setFilteredBonds(prevBonds => [...prevBonds, ...nextBonds]) : setBonds(prevBonds => [...prevBonds, ...nextBonds]);
      setCurrentPage(currentPage + 1);
    }
  };

  // Загрузка следующей страницы облигаций
  const handleFetchMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
    loadNextPage();
    setIsLoading(false);
  };

  // Обработчик события scroll
  const onScrollHandler = () => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
      if ((scrollHeight - clientHeight - scrollTop) <= 100 ) { // Threshold
        !isLoading && handleFetchMore();
      }
    }
  };

  // Наблюдение за событием scroll
  useEffect(() => {
    window.addEventListener('scroll', onScrollHandler);
    return () => {
      window.removeEventListener('scroll', onScrollHandler);
    };
  }, [isLoading]);

  // Шаблон элемента списка об`лигаций
  const ItemTemplate = ({ data }: { data: IBond }): JSX.Element => {
    //const elementRef = useRef<HTMLDivElement | null>(null);
    //useEffect(() => {
    //  if (!itemRefs.current.find((item) => item.current?.id === elementRef.current?.id)) {
    //    //console.log('elementRef: ', elementRef);
    //    itemRefs.current.push(elementRef);
    //  }
    //}, [elementRef]);
    //useEffect(() => {
    //  // Проверяем, есть ли уже ссылка на элемент с таким же ISIN
    //  if (!itemRefs.current.some(ref => ref.current?.id === ('lazy_' + data.isin))) {
    //    itemRefs.current.push(elementRef);
    //  }
    //}, [elementRef, data.isin]); // Теперь зависимостей две: ref и isin

    return (
      
      <li data-pc-section="item">
        <div 
          id={'lazyitem_' + data.isin}
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
                  {
                    //<Rating value={data.rating} readOnly cancel={false}></Rating>
                  }
                  <span className='flex align-items-center gap-1'>
                    {
                      //<i className='pi pi-tag product-category-icon'></i>
                    }
                    <Rating
                      className={'bonds'}
                      value={getRiskLevel(data) ?? 0}
                      alt={getRiskLevelText(data) ?? ''}
                      readOnly
                      cancel={false}
                      stars={3}
                    />
                    {
                      //<span className={classNames('font-semibold', 'text-' + getRiskLevel(data))}>{getRiskLevelText(data)}</span>
                    }
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
      </li>
    );
  };

  function handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.toLowerCase();
    console.log('value: ', value);
    console.log('bonds: ', bonds);
    let filteredList = allBonds.filter((item: IBond) => {
        return item.name.toLowerCase().includes(value);
      }
    );
    console.log('filteredList: ', filteredList);
    setFilterValue(value);

    if (value === '') {
      setBonds([]);
      setCurrentPage(0); // Возвращаемся на первую страницу

    } else {
      setFilteredBonds(filteredList);
    }
  }

  return (
    <div className="card">
      <div className="p-grid p-dir-col mt-4"></div>
        <div className="p-col-12 my-2">
          <FloatLabel>
            <InputText
              type="search"
              onChange={(e) => {
                handleFilterChange(e)}} 
              value={filterValue}
              className='profile w-full'
              id='lazybondsfilter'
            />
            <label htmlFor="lazybondsfilter">Фильтрация...</label>
          </FloatLabel>
        </div>
        <div className='p-datascroller p-component' data-pc-name="datascroller" data-pc-section="root">
          <div className='p-datascroller-content' data-pc-section="content">
            <ul id='ullist' className='p-datascroller-list' ref={containerRef} data-pc-section="list">
              {filterValue.length > 0 ?  filteredBonds.map((bond, index) => (
                <ItemTemplate data={bond} key={index}/>
              )): bonds.map((bond, index) => (
                <ItemTemplate data={bond} key={index}/>
              ))}
              {isLoading && <li className='list-group-item'>Загрузка...</li>}
            </ul>  
          </div>
        </div>
      </div>  
  );
};

export default LazyBonds;
