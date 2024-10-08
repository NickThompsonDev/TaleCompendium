"use client";

import EmptyState from '@/components/EmptyState';
import LoaderSpinner from '@/components/LoaderSpinner';
import NPCCard from '@/components/NPCCard';
import NPCDetail from '@/components/NPCDetail';
import NPCAttributes from '@/components/NPCAttributes';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import React from 'react';

const parseJSONField = (field: string | undefined) => {
  try {
    // First parse
    const parsedOnce = field ? JSON.parse(field) : [];
    // Check if the result is still a string (double-encoded)
    const parsedTwice = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
    return Array.isArray(parsedTwice) ? parsedTwice : [];
  } catch (e) {
    console.error('Failed to parse JSON field:', e);
    return [];
  }
};


const NPCDetailsPage = ({ params: { npcId } }: { params: { npcId: Id<'npcs'> } }) => {
  const { user } = useUser();

  const npc = useQuery(api.npcs.getNPCById, { npcId });

  const similarNPCsResponse = useQuery(api.npcs.getNPCByAuthorId, { authorId: npc?.authorId || '' });
  const similarNPCs = similarNPCsResponse?.npcs || [];

  const isOwner = user?.id === npc?.authorId;

  if (!similarNPCsResponse || !npc) return <LoaderSpinner />;

  console.log('npc', npc);

  const skills = parseJSONField(npc.skills);
  const senses = parseJSONField(npc.senses);
  const languages = parseJSONField(npc.languages);
  const specialTraits = parseJSONField(npc.specialTraits);
  const actions = parseJSONField(npc.actions);

  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">NPC Details</h1>
        <figure className="flex gap-3 ">
          <Image
            src="/icons/eye.svg"
            width={24}
            height={24}
            alt="views"
            className="cl-Icon-dark"
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

      <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3 p-6  mt-8  bg-black-1 mr-8">
          <NPCAttributes
            skills={skills}
            senses={senses}
            languages={languages}
            specialTraits={specialTraits}
            actions={actions}
          />
        </div>
        <p
          className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center md:w-2/3"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {npc?.npcDescription}
        </p>

      </div>

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
          <EmptyState
            title="No similar NPCs found"
            buttonLink="/discover"
            buttonText="Discover more NPCs"
          />
        )}
      </section>
    </section>
  );
};

export default NPCDetailsPage;
