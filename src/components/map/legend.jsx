'use client';

import React, { memo } from 'react';
import { Icon } from '@iconify/react';

export const Legend = memo(({ types, loading }) => (
  <div className="bg-white p-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between min-h-[100px] min-w-[190px]">
    {loading && (
      <div className="flex items-center justify-center w-full">
        <Icon
          icon="line-md:loading-loop"
          width="20"
          height="20"
          style={{ color: '#202020' }}
        />
      </div>
    )}
    {!loading && types.map((type) => (
      <div key={type.id} className="flex items-center mb-0">
        <div
          className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `rgb(${type.color.join(',')})` }}
        >
          <Icon
            icon={type.icon}
            width="20"
            height="20"
            style={{ color: '#202020' }}
          />
        </div>
        <span
          className="font-semibold w-[100px] text-[13px] uppercase leading-tight"
        >
          {type.label}
        </span>
      </div>
    ))}
  </div>
));
