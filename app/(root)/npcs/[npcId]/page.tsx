'use client';

import EmptyState from '@/components/EmptyState';
import LoaderSpinner from '@/components/LoaderSpinner';
import NPCCard from '@/components/NPCCard';
import NPCDetail from '@/components/NPCDetail';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import React from 'react';

const NPCDetailsPage = ({ params: { npcId } }: { params: { npcId: Id<'npcs'> } }) => {
  const { user } = useUser();

  const npc = useQuery(api.npcs.getNPCById, { npcId });

  const similarNPCsResponse = useQuery(api.npcs.getNPCByAuthorId, { authorId: npc?.authorId || '' });
  const similarNPCs = similarNPCsResponse?.npcs || [];

  const isOwner = user?.id === npc?.authorId;

  if (!similarNPCsResponse || !npc) return <LoaderSpinner />;

  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">
          NPC Details
        </h1>
        <figure className="flex gap-3 ">
          <Image
            src="/icons/eye.svg"
            width={24}
            height={24}
            alt="views"
            className='cl-Icon-dark'
          />
          <h2 className="text-16 font-bold text-white-1">{npc?.views}</h2>
        </figure>
      </header>

      <NPCDetail 
        isOwner={isOwner}
        npcId={npc._id}
        npcName={npc.npcName}
        npcDescription={npc.npcDescription}
        imageUrl={npc.imageUrl || '/path/to/default-image.png'} // Provide a default image URL
        author={npc.author}
        authorId={npc.authorId || ''}
        authorImageUrl={npc.authorImageUrl || '/path/to/default-author-image.png'} // Provide a default author image URL
        imageStorageId={npc.imageStorageId} // Ensure this is passed
        armorClass={npc.armorClass ?? 0}
        hitPoints={npc.hitPoints ?? 0}
        challenge={npc.challenge ?? 0}
        proficiencyBonus={npc.proficiencyBonus ?? 0}
        str={npc.str ?? 0}
        dex={npc.dex ?? 0}
        con={npc.con ?? 0}
        int={npc.int ?? 0}
        wis={npc.wis ?? 0}
        cha={npc.cha ?? 0}
      />

      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center" style={{ whiteSpace: 'pre-wrap' }}>
        {npc?.npcDescription}
      </p>

      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar NPCs</h1>

        {similarNPCs.length > 0 ? (
          <div className="npc_grid">
            {similarNPCs.map(({ _id, npcName, npcDescription, imageUrl }) => (
              <NPCCard 
                key={_id}
                imgUrl={imageUrl || '/path/to/default-image.png'} // Provide a default image URL
                title={npcName}
                description={npcDescription}
                npcId={_id}
              />
            ))}
          </div>
        ) : (
          <> 
            <EmptyState 
              title="No similar NPCs found"
              buttonLink="/discover"
              buttonText="Discover more NPCs"
            />
          </>
        )}
      </section>
    </section>
  );
}

export default NPCDetailsPage;
