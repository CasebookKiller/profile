import { convertTIBond, getRiskLevel, getRiskLevelText, getStatus } from '@/api/tbank/methods';
import { IBond } from '@/api/tbank/types';
import { Page } from '@/components/Page';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchBond, fetchBondEvents } from '@/utils/common';

import { Panel } from 'primereact/panel';
import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { classNames } from '@/css/classnames';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';

const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

export const BondDetailPage: FC = () => {
  const { classcode, isin } = useParams<{classcode: string, isin: string}>();
  const [ bond, setBond ] = useState<IBond | null>(null);

  const { getItem } = useLocalStorage();
  
  async function getBond(ticker: string, classcode: string) {
    const stored = getItem('user');
    const user = JSON.parse(stored || '{}');
    
    const data = getItem('tokens');
    const tokens = JSON.parse(data || '{}');
    
    if (tokens.readonly === '' && tokens.fullaccess === '' && tokens.sandbox === '') return;
    const ttoken = tokens.readonly !== '' ? tokens.readonly : tokens.fullaccess !== '' ? tokens.fullaccess : tokens.sandbox !== '' ? tokens.sandbox : '';
      
    if (!user?.token) return;
    if (ttoken === '' || ticker === '' || classcode === '') return;
    
    const res = await fetchBond(`http://${HOST}:${PORT}/getBond`, ticker, classcode, ttoken, user?.token)
    if (!res.ok) return;
    const ibond: IBond = convertTIBond(await res.json());
    console.log(ibond);
    setBond(ibond);
  }

  async function getBondEvents(from: string, to: string, instrumentId: string, type: string) {
    const stored = getItem('user');
    const user = JSON.parse(stored || '{}');
    
    const data = getItem('tokens');
    const tokens = JSON.parse(data || '{}');
    
    if (tokens.readonly === '' && tokens.fullaccess === '' && tokens.sandbox === '') return;
    const ttoken = tokens.readonly !== '' ? tokens.readonly : tokens.fullaccess !== '' ? tokens.fullaccess : tokens.sandbox !== '' ? tokens.sandbox : '';
      
    if (!user?.token) return;
    if (ttoken === '' || from === '' || to === '' || instrumentId === '' || type === '') return;
    
    const res = await fetchBondEvents(`http://${HOST}:${PORT}/getBondEvents`, from, to, instrumentId, type, ttoken, user?.token)
    if (!res.ok) return;
    const events = await res.json();
    console.log(events);
    //setEvents(events);
  }

  useEffect(() => {
    if (isin && classcode) getBond(isin, classcode);
    
  }, []);

  useEffect(() => {
    if (bond) {
      const fromdate = bond.first1dayCandleDate || '';
      const todate = new Date();
      const instrumentId = bond.uid;
      const type = 'EVENT_TYPE_UNSPECIFIED';//'EVENT_TYPE_CPN';
      console.log(fromdate, todate.toISOString(), instrumentId, type);
      getBondEvents(fromdate, todate.toISOString(), instrumentId, type);
    }
  },[bond]);

  const countryOfRisk = bond?.countryOfRisk ? bond.countryOfRisk + ', ': ''; 
  const classCode = bond?.classCode ? bond.classCode + ', ': '';

  const header = (
    <div>
      <div>{bond?.name}{bond && ' (' + getStatus(bond)+')'}</div>
      <div className='mt-2'>{bond && countryOfRisk + classCode + 'ISIN: ' + bond.isin}</div>
      <div className='mt-2'>{bond && <Rating
        className={'bonds'}
        value={getRiskLevel(bond) ?? 0}
        alt={getRiskLevelText(bond) ?? ''}
        readOnly
        cancel={false}
        stars={3}

      />}</div>
    </div>
  );

  return (
    <React.Fragment>
      <Page back={false}>
        <div className='app p-0'/>
        
        <Panel
          className='shadow-5 mx-1'
          header={header}
        >
          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Идентификаторы
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  uid: {bond.uid}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  ISIN: {bond.isin}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  FIGI: {bond.figi}
                </span>
              </div>
              
            </div>
          </div>}

          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Выпуск
              </span>
              {bond.countryOfRiskName && <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  {'Страна:'} {bond.countryOfRiskName}
                </span>
              </div>}
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Сектор: {bond.sector?.charAt(0).toUpperCase()}{bond.sector?.slice(1)}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Регистрация: {new Date(bond.stateRegDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Погашение: {new Date(bond.maturityDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Размер: {bond.issueSize}, План: {bond.issueSizePlan}
                </span>
              </div>
            </div>
          </div>}

          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Размещение
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Дата: {new Date(bond.placementDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Цена: {Number(bond.placementPrice.units+'.'+bond.placementPrice.nano).toFixed(2)}, 
                  Номинал: {Number(bond.initialNominal.units+'.'+bond.initialNominal.nano).toFixed(2)}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Размер лота: {bond.lot}, Валюта: {bond.currency === 'rub' ? 'руб.' : bond.currency}
                </span>
              </div>
            </div>
          </div>}

          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Купоны
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Количество в год: {bond.couponQuantityPerYear}
                </span>
              </div>
        
            </div>
          </div>}

          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Текущая стоимость
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Номинал: {Number(bond.nominal.units+'.'+bond.nominal.nano).toFixed(2)} {bond.currency === 'rub' ? 'руб.' : bond.currency}
                </span>
              </div>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  НКД: {Number(bond.aciValue.units+'.'+bond.aciValue.nano)} {bond.currency === 'rub' ? 'руб.' : bond.currency}
                </span>
              </div>
              
        
            </div>
          </div>}


          {bond && <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Другие свойства
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content wrap my-2'
                >
                  {bond && Object.keys(bond).map((key, index) => {
                    const ibond: IBond = bond as IBond;
                    const keyTyped = key as keyof IBond;
                    const value = typeof ibond[keyTyped] === 'object' ? JSON.stringify(ibond[keyTyped]) : ibond[keyTyped];
            
                    const classes = classNames(['m-1']);

                    if (keyTyped === 'figi') return null; //"figi": "BBG00XH4W3N3",
                    if (keyTyped === 'ticker') return null; //"ticker": "RU000A101RZ3",
                    if (keyTyped === 'classCode') return null;  //"classCode": "TQCB",
                    if (keyTyped === 'isin') return null; //"isin": "RU000A101RZ3",
                    if (keyTyped === 'lot') return null; //"lot": 1,
                    if (keyTyped === 'currency') return null; //"currency": "rub",
                    if (keyTyped === 'shortEnabledFlag') return null; //"shortEnabledFlag": false,
                    if (keyTyped === 'name') return null; //"name": "Казахстан выпуск 11",
                    if (keyTyped === 'exchange') return null; //"exchange": "moex_plus_bonds",
                    if (keyTyped === 'couponQuantityPerYear') return null; //"couponQuantityPerYear": 2,
                    if (keyTyped === 'maturityDate') return null; //"maturityDate": "2030-09-11T00:00:00.000Z",
                    if (keyTyped === 'nominal') return null; //"nominal": { "currency": "rub", "units": "1000", "nano": 0 },
                    if (keyTyped === 'initialNominal') return null; //"initialNominal": { "currency": "rub", "units": "1000", "nano": 0 },
                    if (keyTyped === 'stateRegDate') return null; //"stateRegDate": "2020-07-16T00:00:00.000Z",
                    if (keyTyped === 'placementDate') return null; //"placementDate": "2020-09-23T00:00:00.000Z",
                    if (keyTyped === 'placementPrice') return null; //"placementPrice": { "currency": "", "units": "0", "nano": 0 },
                    if (keyTyped === 'aciValue') return null; //"aciValue": { "currency": "rub", "units": "28", "nano": 0 },
                    if (keyTyped === 'countryOfRisk') return null; //"countryOfRisk": "KZ",
                    if (keyTyped === 'countryOfRiskName') return null; //"countryOfRiskName": "Республика Казахстан",
                    if (keyTyped === 'sector') return null; //"sector": "government",
                    if (keyTyped === 'issueKind') return null; //"issueKind": "non_documentary",
                    if (keyTyped === 'issueSize') return null; //"issueSize": "10000000",
                    if (keyTyped === 'issueSizePlan') return null; //"issueSizePlan": "10000000",
                    if (keyTyped === 'tradingStatus') return null; //"tradingStatus": "SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING",
                    if (keyTyped === 'otcFlag') return null; //"otcFlag": false,
                    if (keyTyped === 'buyAvailableFlag') { //"buyAvailableFlag": true,
                      const text = value ? 'Покупка доступна' : 'Покупка недоступна';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'sellAvailableFlag') {   //"sellAvailableFlag": true,
                      const text = value ? 'Продажа доступна' : 'Продажа недоступна';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'floatingCouponFlag') {  //"floatingCouponFlag": false,
                      const text = value ? 'Плавающий купон' : 'Фиксированный купон';
                      const color = value ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'perpetualFlag') {  //"perpetualFlag": false,
                      const text = value ? 'Бессрочная' : 'Срочная';
                      const color = value ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'amortizationFlag') {  //"amortizationFlag": false,
                      const text = value ? 'С амортизацией' : 'Без амортизации';
                      const color = value ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'minPriceIncrement') return null; //"minPriceIncrement": { "units": "0", "nano": 10000000 },
                    if (keyTyped === 'apiTradeAvailableFlag') {  //"apiTradeAvailableFlag": true,
                      const text = value ? 'Доступна через API' : 'Не доступна через API';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'uid') return null; //"uid": "2dd3b003-aca2-4920-89ce-8d827c637372",
                    if (keyTyped === 'realExchange') return null; //"realExchange": "REAL_EXCHANGE_MOEX",
                    if (keyTyped === 'positionUid') return null; //"positionUid": "2c354d2c-98d0-4705-8370-92e604e31ece",
                    if (keyTyped === 'assetUid') return null; //"assetUid": "28887b0a-20a8-409d-b895-e9831a56152e",
                    if (keyTyped === 'requiredTests') return null; //"requiredTests": [],
                    if (keyTyped === 'forIisFlag') {  //"forIisFlag": false,
                      const text = value ? 'Доступна на ИИС' : 'Не доступна на ИИС';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'forQualInvestorFlag') {  //"forQualInvestorFlag": false,
                      const text = value ? 'Для квалифицированных' : 'Для всех';
                      const color = value ? 'var(--tg-theme-hint-color)': 'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'weekendFlag') {  //"weekendFlag": false,
                      const text = value ? 'Доступна в выходные' : 'Не доступна в выходные';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                    }
                    if (keyTyped === 'blockedTcaFlag') {  //"blockedTcaFlag": false,
                      const text = value ? 'Заблокированная' : 'Незаблокированная';
                      const color = value ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    if (keyTyped === 'subordinatedFlag') {  //"subordinatedFlag": false,
                      const text = value ? 'Субординированная' : 'Несубординированная';
                      const color = value ? 'var(--tg-theme-hint-color)':'var(--tg-theme-accent-text-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                    }
                    
                    if (keyTyped === 'liquidityFlag') { //"liquidityFlag": true,
                      const text = value ? 'Ликвидная' : 'Неликвидная';
                      const color = value ? 'var(--tg-theme-accent-text-color)' : 'var(--tg-theme-hint-color)';
                      const bgcolor = value ? 'var(--tg-theme-secondary-bg-color)' : 'var(--tg-theme-secondary-bg-color)';
                      return (
                        <Tag key={index}
                          value={text}
                          style={{
                            color: color,
                            backgroundColor: bgcolor,
                          }}
                          className='mr-1'
                        /> 
                      );
                      
                    }
                    
                    if (keyTyped === 'first1minCandleDate') return null; //"first1minCandleDate": "2020-09-23T07:00:00.000Z",
                    if (keyTyped === 'first1dayCandleDate') return null; //"first1dayCandleDate": "2020-09-23T07:00:00.000Z",
                    if (keyTyped === 'riskLevel') return null; //"riskLevel": "RISK_LEVEL_LOW",
                    //  <div key={index} className={classes}>
                    //    {'Уровень риска'}: {getRiskLevelText(ibond)?.charAt(0).toUpperCase()}{getRiskLevelText(ibond)?.slice(1)}
                    //  </div>
                    //);
                    if (keyTyped === 'brand') return null; //"brand": { "logoName": "RU000A101RP4.png", "logoBaseColor": "#000000", "textColor": "#ffffff" },
                    if (keyTyped === 'bondType') return null; //"bondType": "BOND_TYPE_UNSPECIFIED"
        
                    // общий вывод
                    return (
                      <div key={index} className={classes}>
                        {keyTyped}: {value?.toString()}<br/>
                      </div>
                    );
                  })}
                </span>
              </div>
              
              
        
            </div>
          </div>}

          <div className='m-0'>
            
          </div>
        </Panel>
        
        
      </Page>
    </React.Fragment>
  );
};


/*
// EVENT_TYPE_UNSPECIFIED


{
  "events": [
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 1,
      "eventDate": "2025-01-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-01-24T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-01-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "31",
        "nano": 510000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "242627000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2024-12-12T00:00:00Z",
      "couponEndDate": "2025-01-27T00:00:00Z",
      "couponPeriod": 46,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 2,
      "eventDate": "2025-02-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-02-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-02-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-01-27T00:00:00Z",
      "couponEndDate": "2025-02-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 3,
      "eventDate": "2025-03-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-03-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-03-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "19",
        "nano": 180000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "147686000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-02-27T00:00:00Z",
      "couponEndDate": "2025-03-27T00:00:00Z",
      "couponPeriod": 28,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 4,
      "eventDate": "2025-04-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-04-25T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-04-28T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-03-27T00:00:00Z",
      "couponEndDate": "2025-04-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 5,
      "eventDate": "2025-05-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-05-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-05-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "20",
        "nano": 550000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "158235000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-04-27T00:00:00Z",
      "couponEndDate": "2025-05-27T00:00:00Z",
      "couponPeriod": 30,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 6,
      "eventDate": "2025-06-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-06-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-06-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-05-27T00:00:00Z",
      "couponEndDate": "2025-06-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 7,
      "eventDate": "2025-07-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-07-25T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-07-28T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "20",
        "nano": 550000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "158235000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-06-27T00:00:00Z",
      "couponEndDate": "2025-07-27T00:00:00Z",
      "couponPeriod": 30,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 8,
      "eventDate": "2025-08-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-08-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-08-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-07-27T00:00:00Z",
      "couponEndDate": "2025-08-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 9,
      "eventDate": "2025-09-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-09-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-09-29T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-08-27T00:00:00Z",
      "couponEndDate": "2025-09-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 10,
      "eventDate": "2025-10-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-10-24T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-10-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "20",
        "nano": 550000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "158235000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-09-27T00:00:00Z",
      "couponEndDate": "2025-10-27T00:00:00Z",
      "couponPeriod": 30,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 11,
      "eventDate": "2025-11-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-11-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "payDate": "2025-11-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-10-27T00:00:00Z",
      "couponEndDate": "2025-11-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 12,
      "eventDate": "2025-12-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2025-12-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "realPayDate": "2025-12-29T00:00:00Z",
      "payDate": "2025-12-29T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "20",
        "nano": 550000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "158235000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-11-27T00:00:00Z",
      "couponEndDate": "2025-12-27T00:00:00Z",
      "couponPeriod": 30,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 13,
      "eventDate": "2026-01-27T00:00:00Z",
      "eventType": "EVENT_TYPE_CPN",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2026-01-26T00:00:00Z",
      "rateDate": "2024-12-11T00:00:00Z",
      "realPayDate": "2026-01-27T00:00:00Z",
      "payDate": "2026-01-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "21",
        "nano": 230000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "163471000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "Фиксированный",
      "value": {
        "units": "25",
        "nano": 0
      },
      "note": "",
      "convertToFinToolId": "",
      "couponStartDate": "2025-12-27T00:00:00Z",
      "couponEndDate": "2026-01-27T00:00:00Z",
      "couponPeriod": 31,
      "couponInterestRate": {
        "units": "25",
        "nano": 0
      }
    },
    {
      "instrumentId": "cdfb7fe3-13ce-4a72-89eb-4a01693cb1b5",
      "eventNumber": 1,
      "eventDate": "2026-01-27T00:00:00Z",
      "eventType": "EVENT_TYPE_MTY",
      "eventTotalVol": {
        "units": "7700000",
        "nano": 0
      },
      "fixDate": "2026-01-26T00:00:00Z",
      "rateDate": "2026-01-21T00:00:00Z",
      "payDate": "2026-01-27T00:00:00Z",
      "payOneBond": {
        "currency": "rub",
        "units": "177",
        "nano": 990000000
      },
      "moneyFlowVal": {
        "currency": "rub",
        "units": "1370523000",
        "nano": 0
      },
      "execution": "E",
      "operationType": "CA",
      "value": {
        "units": "17",
        "nano": 799000000
      },
      "note": "",
      "convertToFinToolId": "",
      "couponPeriod": 0
    }
  ]
}
*/