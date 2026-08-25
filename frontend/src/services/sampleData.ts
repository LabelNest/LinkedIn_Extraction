import { EnrichmentResultItem } from '../types';

export const SAMPLE_PERSON_RESULT: EnrichmentResultItem = {
  url: "https://www.linkedin.com/in/satyanadella",
  canonical_url: "https://www.linkedin.com/in/satyanadella",
  type: "person",
  status: "success",
  data: {
    company: null,
    person: {
      full_name: "Satya Nadella",
      linkedin_url: "https://www.linkedin.com/in/satyanadella",
      headline: "Chairman and Chief Executive Officer at Microsoft",
      about: "Satya Nadella is Chairman and Chief Executive Officer of Microsoft. Before being named CEO in February 2014, Nadella held leadership roles in both enterprise and consumer businesses across the company. He joined Microsoft in 1992 and quickly became known as a leader who could span a breadth of technologies and businesses to transform some of Microsoft's biggest product offerings.",
      location: {
        city: "Seattle",
        state: "Washington",
        country: "United States"
      },
      current_positions: [
        {
          company_name: "Microsoft",
          position: "Chairman and Chief Executive Officer",
          start_date: "Feb 2014",
          end_date: null,
          description: "Leading Microsoft's mission to empower every person and every organization on the planet to achieve more. Spearheading enterprise cloud transformation and modern AI infrastructure.",
          location: "Redmond, WA"
        }
      ],
      historical_positions: [
        {
          company_name: "Microsoft",
          position: "Executive Vice President, Cloud & Enterprise Group",
          start_date: "2011",
          end_date: "2014",
          description: "Led the transformation to the cloud infrastructure and services business, which outperformed the market and took share from competition.",
          location: "Redmond, WA"
        },
        {
          company_name: "Microsoft",
          position: "Senior Vice President, R&D for Online Services Division",
          start_date: "2007",
          end_date: "2011",
          description: "Oversaw search, portal, and advertising platforms including Bing and MSN.",
          location: "Redmond, WA"
        },
        {
          company_name: "Sun Microsystems",
          position: "Member of Technology Staff",
          start_date: "1990",
          end_date: "1992",
          description: "Software engineering and systems development.",
          location: "Mountain View, CA"
        }
      ],
      education: [
        {
          degree: "Master of Business Administration (MBA)",
          school_name: "University of Chicago Booth School of Business",
          field_of_study: "Business Administration",
          start_date: "1995",
          end_date: "1997"
        },
        {
          degree: "Master of Science (MS)",
          school_name: "University of Wisconsin–Milwaukee",
          field_of_study: "Computer Science",
          start_date: "1988",
          end_date: "1990"
        },
        {
          degree: "Bachelor of Engineering (BE)",
          school_name: "Manipal Institute of Technology",
          field_of_study: "Electrical and Electronics Engineering",
          start_date: "1984",
          end_date: "1988"
        }
      ],
      skills: [
        "Cloud Computing",
        "Enterprise Software",
        "Artificial Intelligence",
        "Strategic Leadership",
        "Business Transformation",
        "Product Management",
        "Distributed Systems",
        "SaaS & PaaS",
        "Executive Management",
        "Technology Strategy"
      ],
      certifications: [
        {
          title: "Executive Leadership & Corporate Governance",
          issued_by: "Harvard Business School Executive Education",
          issued_at: "2015"
        },
        {
          title: "Distinguished Engineering Fellow",
          issued_by: "IEEE Computer Society",
          issued_at: "2018"
        }
      ]
    },
    employees: null
  }
};

export const SAMPLE_COMPANY_RESULT: EnrichmentResultItem = {
  url: "https://www.linkedin.com/company/microsoft",
  canonical_url: "https://www.linkedin.com/company/microsoft",
  type: "company",
  status: "success",
  data: {
    person: null,
    company: {
      name: "Microsoft",
      linkedin_url: "https://www.linkedin.com/company/microsoft",
      tagline: "Empowering every person and organization on the planet to achieve more.",
      description: "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge. Its mission is to empower every person and every organization on the planet to achieve more. Microsoft operates worldwide across cloud computing, AI, productivity software, gaming, and personal hardware.",
      industry: "Software Development & Cloud Computing",
      company_size: "10,001+ employees",
      headquarters: {
        city: "Redmond",
        state: "Washington",
        country: "United States"
      },
      website: "https://www.microsoft.com",
      founded: "1975",
      specialties: [
        "Cloud Computing (Azure)",
        "Artificial Intelligence & Copilot",
        "Productivity (Microsoft 365)",
        "Enterprise Software",
        "Gaming & Xbox",
        "Developer Tools & GitHub",
        "Hardware (Surface)",
        "Cybersecurity"
      ]
    },
    employees: [
      {
        name: "Satya Nadella",
        title: "Chairman and Chief Executive Officer",
        linkedin_url: "https://www.linkedin.com/in/satyanadella",
        location: "Seattle, WA",
        department: "Executive Leadership"
      },
      {
        name: "Brad Smith",
        title: "Vice Chair and President",
        linkedin_url: "https://www.linkedin.com/in/bradsmith",
        location: "Seattle, WA",
        department: "Legal & Corporate Affairs"
      },
      {
        name: "Amy Hood",
        title: "Executive Vice President and CFO",
        linkedin_url: "https://www.linkedin.com/company/microsoft",
        location: "Seattle, WA",
        department: "Finance"
      },
      {
        name: "Kevin Scott",
        title: "Chief Technology Officer & EVP of AI",
        linkedin_url: "https://www.linkedin.com/company/microsoft",
        location: "San Francisco Bay Area",
        department: "Engineering & AI"
      }
    ]
  }
};
