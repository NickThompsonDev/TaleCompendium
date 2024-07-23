import { NPCCardProps } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const NPCCard = ({
  imgUrl, title, description, npcId
}: NPCCardProps) => {
  const router = useRouter();
  const updateNPCViews = useMutation(api.npcs.updateNPCViews);

  const handleViews = async () => {
    // increase views
    await updateNPCViews({ npcId });

    router.push(`/npcs/${npcId}`, {
      scroll: true
    });
  };

  return (
    <div className="cursor-pointer" onClick={handleViews}>
      <figure className="flex flex-col gap-2">
        <Image 
          src={imgUrl}
          width={174}
          height={174}
          alt={title}
          className="aspect-square h-fit w-full rounded-xl 2xl:size-[200px]"
        />
        <div className="flex flex-col">
          <h1 className="text-16 truncate font-bold text-white-1">{title}</h1>
          <h2 className="text-12 truncate font-normal capitalize text-white-4">{description}</h2>
        </div>
      </figure>
    </div>
  )
}

export default NPCCard;
