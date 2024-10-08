import { GenerateNPCProps } from '@/types';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from "@/components/ui/use-toast";
import { useFormContext } from 'react-hook-form';
import { NPCProps } from '@/types';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

const useGenerateNPC = ({
  setNPCDetails,
  formData,
}: GenerateNPCProps & { formData: any}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const getNPCDetails = useAction(api.openai.generateNPCDetails);
  const consumeTokens = useMutation(api.users.consumeTokens);

  const generateNPC = async (p0: { formData: NPCProps; setNPCDetails: React.Dispatch<React.SetStateAction<NPCProps | null>>; npcDetails: NPCProps | null; inputPrompt: string; setInputPrompt: React.Dispatch<React.SetStateAction<string>>; }) => {
    setIsGenerating(true);
    setNPCDetails(null);

    if (!formData.npcName || !formData.challenge || !formData.npcDescription) {
      toast({
        title: "Please fill in Name, Challenge Rating, and Description to generate NPC details",
      });
      return setIsGenerating(false);
    }

    try {
      if (!user) throw new Error('User not authenticated');
      await consumeTokens({ clerkId: user.id, tokens: 1 });
      const response = await getNPCDetails({
        input: JSON.stringify(formData),
      });

      setNPCDetails(response);
      setIsGenerating(false);
      toast({
        title: "NPC details generated successfully",
      });
    } catch (error) {
      console.log('Error generating NPC details', error);
      toast({
        title: "Error generating NPC details",
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateNPC };
};

const GenerateNPC = (props: GenerateNPCProps & { formData: any}) => {
  const { isGenerating, generateNPC } = useGenerateNPC(props);
  const { setValue, getValues } = useFormContext<NPCProps>();
  const [showDetails, setShowDetails] = useState(false);

  // Populate form fields with generated NPC details
  React.useEffect(() => {
    if (props.npcDetails) {
      Object.entries(props.npcDetails).forEach(([key, value]) => {
        setValue(key as keyof NPCProps, value);
      });
    }
  }, [props.npcDetails, setValue]);

  const handleGenerateNPC = () => {
    const currentFormValues = getValues();
    generateNPC({ ...props, formData: currentFormValues });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <Button type="button" className="text-16 bg-orange-1 py-4 font-bold text-white-1" onClick={handleGenerateNPC}>
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            <>
              Generate NPC Details
              <Image src="/icons/token.svg" alt={"Token"} width={20} height={20} className={"ml-2"} />
              1
            </>
          )}
        </Button>
        {props.npcDetails && (
          <Button
            type="button"
            className="text-16 bg-orange-1 py-4 font-bold text-white-1"
            onClick={() => setShowDetails(!showDetails)}
          >
            Info
          </Button>
        )}
      </div>
      {showDetails && props.npcDetails && (
        <div className="mt-5">
          <h2 className="text-16 font-bold text-white-1">Generated NPC Details</h2>
          <pre className="text-white-1">{JSON.stringify(props.npcDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GenerateNPC;
