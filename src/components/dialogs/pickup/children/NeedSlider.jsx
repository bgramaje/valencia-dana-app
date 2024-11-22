import React from 'react';

import { Icon } from '@iconify/react';
import { Slider } from '@/components/ui/slider';

export function NeedSlider(props) {
  const { label, icon, value } = props;

  return (
    <div
      key={label}
      className={`
          flex items-center mb-0 gap-1.5 flex-1 bg-zinc-50
          rounded-xl border border-zinc-200 p-2 pb-3
        `}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center">
        <Icon icon={icon} style={{ color: '#202020', width: 20, height: 20 }} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full flex justify-between">
          <span className="font-semibold text-[12px] uppercase leading-tight">{label}</span>
          <span className="text-xs font-medium text-gray-600">{`${value}%`}</span>
        </div>

        <Slider
          value={[value]}
          max={100}
          step={1}
          disabled
        />
      </div>
    </div>
  );
}
