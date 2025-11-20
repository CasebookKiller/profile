import { isRGB } from '@tma.js/sdk-react';
import type { FC, ReactNode } from 'react';

import { RGB } from '@/components/RGB/RGB.tsx';
import { Link } from '@/components/Link/Link.tsx';
import { bem } from '@/css/bem.ts';

import './DisplayData.css';

import { Panel } from 'primereact/panel';
import { Checkbox } from 'primereact/checkbox';
import React from 'react';

const [, e] = bem('display-data');

export type DisplayDataRow =
  & { title: string }
  & (
  | { type: 'link'; value?: string }
  | { value: ReactNode }
  )

export interface DisplayDataProps {
  header?: ReactNode;
  footer?: ReactNode;
  rows: DisplayDataRow[];
}

export const DisplayData: FC<DisplayDataProps> = ({ header, rows }) => (
  <React.Fragment>
    <Panel
      className='shadow-5 mx-1 mt-1 mb-2'
      header={header}
    >
      {rows.map((item, idx) => {
        let valueNode: ReactNode;

        if (item.value === undefined) {
          valueNode = <i>empty</i>;
        } else {
          if ('type' in item) {
            valueNode = <Link to={item.value}>Open</Link>;
          } else if (typeof item.value === 'string') {
            valueNode = isRGB(item.value)
              ? <RGB color={item.value}/>
              : item.value;
          } else if (typeof item.value === 'boolean') {
            valueNode = <Checkbox checked={item.value} disabled/>;
          } else {
            valueNode = item.value;
          }
        }

        return (
          <React.Fragment key={idx}>
            <div
              key={idx}
              className={'flex flex-wrap align-items-center gap-4 app p-2 item-border-bottom '+ e('line')}
            >
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size theme-hint-color'
                >
                  {item.title}
                </span>
                <div className='flex align-items-center gap-2'>
                  <div
                    className='app font-size-subheading theme-text-color font-weight-content wrap text-readonly'
                  >
                    {valueNode}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </Panel>
  </React.Fragment>
);
