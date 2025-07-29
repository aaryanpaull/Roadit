'use server';
/**
 * @fileOverview A flow for finding the nearest municipal corporation to a given location.
 *
 * - findMunicipality - A function that handles finding the municipality.
 * - FindMunicipalityInput - The input type for the findMunicipality function.
 * - FindMunicipalityOutput - The return type for the findMunicipality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindMunicipalityInputSchema = z.object({
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});
export type FindMunicipalityInput = z.infer<
  typeof FindMunicipalityInputSchema
>;

const FindMunicipalityOutputSchema = z.object({
  municipality: z.string().describe('The name of the municipal corporation.'),
});
export type FindMunicipalityOutput = z.infer<
  typeof FindMunicipalityOutputSchema
>;

const getMunicipalityFromCoordinates = ai.defineTool(
  {
    name: 'getMunicipalityFromCoordinates',
    description:
      'Returns the administrative area or city for a given latitude and longitude.',
    inputSchema: FindMunicipalityInputSchema,
    outputSchema: z.object({
      name: z.string(),
    }),
  },
  async ({lat, lng}) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured.');
      // Return a structured error or a default value
      return { name: 'Unknown (API key missing)' };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
         console.error(`Geocoding API error: ${data.status} - ${data.error_message || ''}`);
         // Propagate a meaningful error message
         throw new Error(`Could not find municipality due to a mapping service error: ${data.status}`);
      }
      
      const results = data.results;
      if (results.length > 0) {
        // Look for locality, administrative_area_level_2, or similar which often holds the city name
        const localityComponent = results[0].address_components.find(
          c => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        );
         if (localityComponent) {
            return { name: localityComponent.long_name };
        }
        // Fallback to formatted address
        return { name: results[0].formatted_address };
      }
      return {name: 'Unknown'};
    } catch (error) {
      console.error('Failed to get municipality from coordinates:', error);
      // Re-throw a generic error to avoid leaking implementation details to the LLM/client.
      throw new Error('An external service error occurred while finding the municipality.');
    }
  }
);

const prompt = ai.definePrompt({
  name: 'findMunicipalityPrompt',
  input: {schema: FindMunicipalityInputSchema},
  output: {schema: FindMunicipalityOutputSchema},
  tools: [getMunicipalityFromCoordinates],
  prompt: `Use the getMunicipalityFromCoordinates tool to find the name of the municipality for the given coordinates: latitude {{{lat}}}, longitude {{{lng}}}.
  
  Return the name in the 'municipality' field.`,
});

const findMunicipalityFlow = ai.defineFlow(
  {
    name: 'findMunicipalityFlow',
    inputSchema: FindMunicipalityInputSchema,
    outputSchema: FindMunicipalityOutputSchema,
  },
  async input => {
     try {
        const {output} = await prompt(input);
        if (!output) {
          throw new Error('Could not determine municipality from the AI model.');
        }
        return output;
    } catch (error) {
        console.error('Error in findMunicipalityFlow:', error);
        // Ensure a structured response even in case of failure.
        // You might want to return a specific error structure or a default value.
        // For now, we'll re-throw to be handled by the action.
        throw new Error('Failed to determine municipality.');
    }
  }
);

export async function findMunicipality(
  input: FindMunicipalityInput
): Promise<FindMunicipalityOutput> {
  return findMunicipalityFlow(input);
}
