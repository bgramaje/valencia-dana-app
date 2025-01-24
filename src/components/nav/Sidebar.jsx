import Image from 'next/image';
import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <div className="w-8 h-full flex flex-col basis-[65px] justify-between items-center py-4">
      <div className="flex items-center justify-center pl-0">
        <Image src="som_heart.svg" alt="logo-som" width={40} height={40} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 items-center">
          <Icon
            icon="ri:instagram-line"
            width="24"
            height="24"
          />
        </div>
        <Link href="https://github.com/bgramaje" passHref target="_blank">
          <Image
            alt="github"
            src="https://avatars.githubusercontent.com/u/56760866?s=400&u=85f1f7114a7c9f4afc1c63e3d06d35a7e204ce1a&v=4"
            width={24}
            height={24}
            className="rounded-md p-0 bg-white"
          />
        </Link>
      </div>
    </div>
  );
}
