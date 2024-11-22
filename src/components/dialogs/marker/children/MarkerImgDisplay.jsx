import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import React from 'react';

export function MarkerImgDisplay({ img }) {
  return (
    <div className="w-full p-1 px-4 rounded-xl overflow-auto">
      <AspectRatio ratio={4 / 3}>
        <Image
          src={img}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
          fill
        />
      </AspectRatio>
    </div>
  );
}
