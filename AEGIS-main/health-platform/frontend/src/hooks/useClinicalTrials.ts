import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  conditions: string[];
  interventions: string[];
  phase: string;
  enrollmentCount: number;
  startDate: string;
  completionDate: string;
  sponsor: string;
}

export const useClinicalTrials = (countryName: string) => {
  return useQuery<ClinicalTrial[]>({
    queryKey: ['clinicalTrials', countryName],
    queryFn: async () => {
      try {
        
        const searchExpr = encodeURIComponent(`AREA[LocationCountry] ${countryName}`);
        const response = await axios.get(
          `https://clinicaltrials.gov/api/query/study_fields?expr=${searchExpr}&fields=NCTId,BriefTitle,OverallStatus,Condition,InterventionName,Phase,EnrollmentCount,StartDate,PrimaryCompletionDate,LeadSponsorName&min_rnk=1&max_rnk=10&fmt=json`,
          { timeout: 15000 }
        );
        
        if (!response.data.StudyFieldsResponse?.StudyFields) {
          return [];
        }
        
        const studies = response.data.StudyFieldsResponse.StudyFields;
        return studies.map((study: any) => ({
          nctId: study.NCTId?.[0] || '',
          title: study.BriefTitle?.[0] || '',
          status: study.OverallStatus?.[0] || '',
          conditions: study.Condition || [],
          interventions: study.InterventionName || [],
          phase: study.Phase?.[0] || 'N/A',
          enrollmentCount: parseInt(study.EnrollmentCount?.[0] || '0'),
          startDate: study.StartDate?.[0] || '',
          completionDate: study.PrimaryCompletionDate?.[0] || '',
          sponsor: study.LeadSponsorName?.[0] || '',
        }));
      } catch (error) {
        console.warn('ClinicalTrials.gov API failed', error);
        return [];
      }
    },
    enabled: !!countryName,
    staleTime: 10 * 60 * 1000, 
    refetchInterval: 60 * 1000, 
    retry: 2,
  });
};
