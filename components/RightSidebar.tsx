'use client';

import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Header from './Header';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import PaymentModal from './PaymentModal';

const RightSidebar = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user data
  const userData = useQuery(api.users.getUserById, {
    clerkId: user?.id || '',
  });

  const tokenAmount = userData?.tokens || 0;

  const topCreators = useQuery(api.users.getTopUserByNPCCreationCount);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className={cn('right_sidebar h-[calc(100vh-5px)]')}>
      <SignedIn>
        <Link href={`/profile/${user?.id}`} className="flex gap-3">
          <UserButton />
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between">
              <h1 className="text-16 truncate font-semibold text-white-1">
                {user?.firstName} {user?.lastName}
              </h1>
              <Image src="/icons/right-arrow.svg" alt="arrow" width={24} height={24} />
            </div>
          </div>
        </Link>
        <div className="flex items-center mt-2">
          <div className="flex items-center ml-8">

            <Image src="/icons/token.svg" alt="tokens" width={24} height={24} />

            <span className="ml-1 text-14 font-medium text-orange-1">{tokenAmount}</span>
          </div>
          <div className="flex items-center">
            <button onClick={openModal} className="invert ml-1">
              <Image src="/icons/cart.svg" alt="Buy More" width={20} height={20} />
            </button>
          </div>
        </div>

      </SignedIn>
      <section className="flex flex-col gap-8 pt-12">
        <Header headerTitle="Top Creators" />
        <div className="flex flex-col gap-6">
          {topCreators?.slice(0, 3).map((creator) => (
            <div
              key={creator._id}
              className="flex cursor-pointer justify-between"
              onClick={() => router.push(`/profile/${creator.clerkId}`)}
            >
              <figure className="flex items-center gap-2">
                <Image
                  src={creator.imageUrl}
                  alt={creator.name}
                  width={44}
                  height={44}
                  className="aspect-square rounded-lg"
                />
                <h2 className="text-14 font-semibold text-white-1">{creator.name}</h2>
              </figure>
              <div className="flex items-center">
                <p className="text-12 font-normal text-white-1">{creator.totalNPCs} NPCs</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {isModalOpen && (
        <PaymentModal open={isModalOpen} onClose={closeModal} userId={user?.id || ''} />
      )}
    </section>
  );
};

export default RightSidebar;
