"use client";
import NPCCard from '@/components/NPCCard';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoaderSpinner from '@/components/LoaderSpinner';

const Home = () => {
  const trendingNPCs = useQuery(api.npcs.getTrendingNPCs);

  if (!trendingNPCs) return <LoaderSpinner />

  return (
    <div className="mt-9 flex flex-col gap-9 md:overflow-hidden">
      <section className='flex flex-col gap-5'>
        <h1 className="text-20 font-bold text-white-1">Trending NPCs</h1>
        <div className="npc_grid">
          {trendingNPCs?.map(({ _id, npcName, npcDescription, imageUrl }) => (
            <NPCCard
              key={_id}
              imgUrl={imageUrl as string}
              title={npcName}
              description={npcDescription}
              npcId={_id}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home