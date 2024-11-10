'use client';

import React, { memo } from 'react';
import { Icon } from '@iconify/react';

export const Legend = memo(({ types, loading }) => (
  <div className="bg-white p-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between min-w-[230px]">
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
      <div key={type.id} className="flex items-center mb-0 basis-[100px] flex gap-1.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `rgb(${type.color.join(',')})` }}
        >
          <Icon
            icon={type.icon}
            width="16"
            height="16"
            style={{ color: '#202020' }}
          />
        </div>
        <span
          className="font-semibold max-w-[60px] text-[13px] uppercase leading-tight"
        >
          {type.label}
        </span>
      </div>
    ))}
  </div>
));
