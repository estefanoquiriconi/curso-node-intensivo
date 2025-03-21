import { minLength, object, pipe, string, type InferInput } from 'valibot';

/**
 * Schema for validating a character object.
 */
export const CharacterSchema = object({
  name: pipe(string(), minLength(3)),
  lastName: pipe(string(), minLength(3)),
});

/**
 * Type representing a character with an id.
 */
export type Character = InferInput<typeof CharacterSchema> & {
  id: number;
};

const characters: Map<number, Character> = new Map();

/**
 * Retrieves all characters.
 * @returns An array of all characters.
 */
export const getAllCharacters = (): Character[] => {
  return Array.from(characters.values());
};

/**
 * Retrieves a character by its ID.
 * @param id - The ID of the character to retrieve.
 * @returns The character if found, otherwise undefined.
 */
export const getCharacterById = (id: number): Character | undefined => {
  return characters.get(id);
};

/**
 * Adds a new character.
 * @param character - The character to add.
 * @returns The newly added character with an assigned ID.
 */
export const addCharacter = (character: Character): Character => {
  if (character.id && !characters.has(character.id)) {
    console.error(`Character with id, ${character.id}, already exists`);
    return character;
  }

  const newCharacter = {
    ...character,
    id: new Date().getTime(),
  };

  characters.set(newCharacter.id, newCharacter);

  return newCharacter;
};

/**
 * Updates an existing character by its ID.
 * @param id - The ID of the character to update.
 * @param updatedCharacter - The updated character data.
 * @returns The updated character if found, otherwise null.
 */
export const updateCharacter = (
  id: number,
  updatedCharacter: Character
): Character | null => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found.`);
    return null;
  }

  characters.set(id, updatedCharacter);

  return updatedCharacter;
};

/**
 * Deletes a character by its ID.
 * @param id - The ID of the character to delete.
 * @returns True if the character was deleted, otherwise false.
 */
export const deleteCharacter = (id: number): boolean => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found`);
    return false;
  }

  characters.delete(id);
  return true;
};
