"use client";

import { useQuery } from "convex/react";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import NPCCard from "@/components/NPCCard";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/convex/_generated/api";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const user = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });
  const npcsData = useQuery(api.npcs.getNPCByAuthorId, {
    authorId: params.profileId,
  });

  if (!user || !npcsData) return <LoaderSpinner />;

  const totalViews = npcsData.npcs.reduce((sum, npc) => sum + npc.views, 0);

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-20 font-bold text-white-1 max-md:text-center">
        Creator Profile
      </h1>
      <div className="mt-6 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          npcData={{ npcs: npcsData.npcs, viewers: totalViews }}
          imageUrl={user?.imageUrl!}
          userFirstName={user?.name!}
        />
      </div>
      <section className="mt-9 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">All NPCs</h1>
        {npcsData && npcsData.npcs.length > 0 ? (
          <div className="npc_grid">
            {npcsData?.npcs
              ?.slice(0, 4)
              .map((npc) => (
                <NPCCard
                  key={npc._id}
                  imgUrl={npc.imageUrl!}
                  title={npc.npcName!}
                  description={npc.npcDescription}
                  npcId={npc._id}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            title="You have not created any NPCs yet"
            buttonLink="/create-npc"
            buttonText="Create NPC"
          />
        )}
      </section>
    </section>
  );
};

export default ProfilePage;
