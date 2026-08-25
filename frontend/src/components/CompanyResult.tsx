import React from 'react';
import { CompanyData } from '../types';
import { CompanyProfile } from './CompanyProfile';

interface CompanyResultProps {
  company: CompanyData | null | undefined;
  employees: any;
}

export const CompanyResult: React.FC<CompanyResultProps> = ({ company, employees }) => {
  return <CompanyProfile company={company} employees={employees} />;
};
