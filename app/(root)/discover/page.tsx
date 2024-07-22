"use client"

import EmptyState from '@/components/EmptyState'
import LoaderSpinner from '@/components/LoaderSpinner'
import NPCCard from '@/components/NPCCard'
import Searchbar from '@/components/Searchbar'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React from 'react'

const Discover = ({ searchParams: { search } }: { searchParams: { search: string } }) => {
  const npcsData = useQuery(api.npcs.getNPCBySearch, { search: search || '' })

  return (
    <div className="flex flex-col gap-9">
      <Searchbar />
      <div className="flex flex-col gap-9">
        <h1 className="text-20 font-bold text-white-1">
          {!search ? 'Discover Trending Creations' : 'Search results for '}
          {search && <span className="text-white-2">{search}</span>}
        </h1>
        {npcsData ? (
          <>
            {npcsData.length > 0 ? (
              <div className="npc_grid">
                {npcsData?.map(({ _id, npcName, npcDescription, imageUrl }) => (
                  <NPCCard
                    key={_id}
                    imgUrl={imageUrl as string}
                    title={npcName}
                    description={npcDescription}
                    npcId={_id}
                  />
                ))}
              </div>
            ) : <EmptyState title="No results found" />}
          </>
        ) : <LoaderSpinner />}
      </div>
    </div>
  )
}

export default Discover