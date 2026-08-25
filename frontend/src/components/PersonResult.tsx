import React from 'react';
import { PersonData } from '../types';
import { PersonProfile } from './PersonProfile';

interface PersonResultProps {
  person: PersonData | null | undefined;
}

export const PersonResult: React.FC<PersonResultProps> = ({ person }) => {
  return <PersonProfile person={person} />;
};
