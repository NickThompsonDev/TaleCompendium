import { action } from "./_generated/server";
import { v } from "convex/values";

import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as SpeechCreateParams['voice'],
      input,
    });

    const buffer = await mp3.arrayBuffer();

    return buffer;
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    const url = response.data[0].url;

    if (!url) {
      throw new Error('Error generating thumbnail');
    }

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    return buffer;
  }
});

// Add the new action to generate NPC details
export const generateNPCDetails = action({
  args: { input: v.string() },
  handler: async (_, { input }) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            You are a helpful D&D Dungeon Master assistant. Provide the D&D 5e NPC details in JSON format.
            The JSON object should have the following structure:

            {
              "npcName": "string",
              "npcDescription": "string",
              "challenge": "number",
              "armorClass": "number",
              "hitPoints": "number",
              "speed": "number",
              "proficiencyBonus": "number",
              "str": "number",
              "dex": "number",
              "con": "number",
              "int": "number",
              "wis": "number",
              "cha": "number",
              "skills": [
                { "name": "string", "description": "number" }
              ],
              "senses": [
                { "name": "string", "description": "string" }
              ],
              "languages": [
                { "name": "string" }
              ],
              "specialTraits": [
                { "name": "string", "description": "string" }
              ],
              "actions": [
                { "name": "string", "description": "string" }
              ]
            }

            The 'npcDescription' field should be replaced with a new description composing of a 1 sentence title, and 2 to 4 paragraph background based on the input provided by the user.
          `,
        },
        { role: "user", content: input },
      ],
    });

    let content = response.choices[0].message.content;
    if (content) {
      // Ensure it's valid JSON
      try {
        const npcDetails = JSON.parse(content); // Parse the JSON response

        // Ensure the npcDescription is present
        if (!npcDetails.npcDescription) {
          throw new Error('npcDescription field is missing from the generated JSON');
        }

        return npcDetails;
      } catch (error) {
        throw new Error('Failed to parse NPC details: Invalid JSON format');
      }
    } else {
      throw new Error('Failed to generate NPC details: Response content is null');
    }
  },
});





