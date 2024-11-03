'use client';

import React, { memo } from 'react';
import { Icon } from '@iconify/react';

import { ASSISTANCE_TYPES } from '@/lib/enums';

export const Legend = memo(() => (
  <div className="bg-white p-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
    {Object.entries(ASSISTANCE_TYPES).map(([key, value]) => (
      <div key={key} className="flex items-center mb-0">
        <div
          className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `rgb(${value.color.join(',')})` }}
        >
          <Icon
            icon={value.icon}
            width="20"
            height="20"
            style={{ color: 'white' }}
          />
        </div>
        <span className="font-semibold w-[100px] text-[13px] uppercase leading-tight">{value.label}</span>
      </div>
    ))}
  </div>
));
