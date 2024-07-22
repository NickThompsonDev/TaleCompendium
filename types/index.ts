/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

import { Id } from "@/convex/_generated/dataModel";

export interface EmptyStateProps {
  title: string;
  search?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

export interface GenerateThumbnailProps {
  setImage: Dispatch<SetStateAction<string>>;
  setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  image: string;
  imagePrompt: string;
  setImagePrompt: Dispatch<SetStateAction<string>>;
}

export interface CarouselProps {
  fansLikeDetail: TopCreatorsProps[];
}

export interface TopCreatorsProps {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  imageUrl: string;
  clerkId: string;
  name: string;
  npcs: {
    npcName: string;
    npcId: Id<"npcs">;
  }[];
  totalNPCs: number;
}

export interface ProfileNPCProps {
  npcs: NPCProps[];
  viewers: number;
}

export interface ProfileCardProps {
  npcData: ProfileNPCProps;
  imageUrl: string;
  userFirstName: string;
}

export type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
}

// Add the new NPC-related interfaces
export interface NPCProps {
  _id: Id<"npcs">;
  _creationTime: number;
  imageUrl?: string;
  skills?: string;
  senses?: string;
  languages?: string;
  challenge?: number;
  armorClass?: number;
  hitPoints?: number;
  speed?: number;
  proficiencyBonus?: number;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  specialTraits?: string;
  actions?: string;
  npcName: string;
  npcDescription: string;
  views: number;
  author: string;
  authorImageUrl: string;
  imageStorageId?: Id<"_storage">;
}

export interface GenerateNPCProps {
  setNPCDetails: Dispatch<SetStateAction<NPCProps | null>>;
  npcDetails: NPCProps | null;
  inputPrompt: string;
  setInputPrompt: React.Dispatch<React.SetStateAction<string>>;
}

export interface NPCCardProps {
  imgUrl: string;
  title: string;
  description: string;
  npcId: Id<"npcs">;
}

export interface NPCDetailProps {
  npcName: string;
  npcDescription: string;
  author: string;
  imageUrl: string;
  npcId: Id<"npcs">;
  imageStorageId?: Id<"_storage">;
  isOwner: boolean;
  authorImageUrl: string;
  authorId: string;
  armorClass: number;
  hitPoints: number;
  challenge: number;
  proficiencyBonus: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}
