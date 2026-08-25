import type { IOpportunity, IStudentProfile, MatchScore } from '@/types';

// ============================================================
// Scholarship Matching Engine
// ============================================================

const WEIGHTS = {
  nationality: 30,
  degree: 25,
  field: 20,
  destination: 15,
  gpa: 10,
};

const NATIONALITY_WILDCARDS = [
  'all',
  'all nationalities',
  'international',
  'international students',
  'all countries',
  'open to all',
  'worldwide',
];

const AFRICA_WILDCARDS = [
  'african students',
  'africa',
  'sub-saharan africa',
  'east africa',
  'west africa',
  'southern africa',
];

export function calculateMatchScore(
  opportunity: IOpportunity,
  profile: IStudentProfile
): MatchScore {
  const breakdown = {
    nationality: 0,
    degree: 0,
    field: 0,
    destination: 0,
    gpa: 0,
  };

  const reasons: string[] = [];
  const missingInfo: string[] = [];

  // ---- Nationality Match (30pts) ----
  if (!profile.nationality) {
    missingInfo.push('nationality');
    breakdown.nationality = 0;
  } else {
    const nat = profile.nationality.toLowerCase();
    const opNationalities = (opportunity.nationality || []).map((n) => n.toLowerCase());

    const isWildcard = opNationalities.some((n) => NATIONALITY_WILDCARDS.includes(n));
    const isAfrica = opNationalities.some((n) => AFRICA_WILDCARDS.includes(n));
    const directMatch = opNationalities.includes(nat);
    const noRestriction = opNationalities.length === 0;

    if (noRestriction || isWildcard) {
      breakdown.nationality = WEIGHTS.nationality;
      reasons.push('Open to all nationalities');
    } else if (directMatch) {
      breakdown.nationality = WEIGHTS.nationality;
      reasons.push(`Eligible for ${profile.nationality} students`);
    } else if (isAfrica) {
      // Give partial credit for African students
      const AFRICAN_COUNTRIES = [
        'rwanda', 'kenya', 'uganda', 'tanzania', 'ethiopia', 'nigeria', 'ghana',
        'south africa', 'egypt', 'morocco', 'senegal', 'cameroon', 'zimbabwe',
        'zambia', 'malawi', 'mozambique'
      ];
      if (AFRICAN_COUNTRIES.includes(nat)) {
        breakdown.nationality = WEIGHTS.nationality;
        reasons.push('Open to African students');
      } else {
        breakdown.nationality = 0;
      }
    } else {
      breakdown.nationality = 0;
    }
  }

  // ---- Degree Level Match (25pts) ----
  if (!profile.educationLevel && !profile.preferredDegree) {
    missingInfo.push('education level');
    breakdown.degree = 0;
  } else {
    const profileDegree = profile.preferredDegree || profile.educationLevel;
    const opDegrees = opportunity.degree || [];

    if (opDegrees.length === 0) {
      breakdown.degree = Math.round(WEIGHTS.degree * 0.5); // partial if no restriction
    } else if (profileDegree && opDegrees.includes(profileDegree)) {
      breakdown.degree = WEIGHTS.degree;
      reasons.push('Degree level matches');
    } else {
      breakdown.degree = 0;
    }
  }

  // ---- Field Match (20pts) ----
  if (!profile.field && (!profile.preferredFields || profile.preferredFields.length === 0)) {
    missingInfo.push('field of study');
    breakdown.field = 0;
  } else {
    const profileFields = [
      profile.field,
      ...(profile.preferredFields || []),
    ].filter(Boolean).map((f) => f!.toLowerCase());

    const opFields = (opportunity.field || []).map((f) => f.toLowerCase());

    if (opFields.length === 0) {
      breakdown.field = Math.round(WEIGHTS.field * 0.5); // partial if no field restriction
    } else {
      const fieldMatch = profileFields.some((pf) =>
        opFields.some((of) => of.includes(pf!) || pf!.includes(of))
      );
      if (fieldMatch) {
        breakdown.field = WEIGHTS.field;
        reasons.push('Field of study matches');
      } else {
        breakdown.field = 0;
      }
    }
  }

  // ---- Destination Match (15pts) ----
  if (!profile.preferredCountries || profile.preferredCountries.length === 0) {
    missingInfo.push('preferred study countries');
    breakdown.destination = Math.round(WEIGHTS.destination * 0.3); // small partial
  } else {
    const dest = opportunity.studyDestination || opportunity.country;
    const preferred = profile.preferredCountries.map((c) => c.toLowerCase());
    const destLower = dest?.toLowerCase() ?? '';

    if (preferred.some((p) => destLower.includes(p) || p.includes(destLower))) {
      breakdown.destination = WEIGHTS.destination;
      reasons.push('Study destination matches your preferences');
    } else {
      breakdown.destination = 0;
    }
  }

  // ---- GPA Match (10pts) ----
  if (!profile.gpa) {
    missingInfo.push('GPA');
    breakdown.gpa = Math.round(WEIGHTS.gpa * 0.5);
  } else if (!opportunity.gpa) {
    breakdown.gpa = WEIGHTS.gpa; // No GPA requirement — full credit
    reasons.push('No minimum GPA requirement');
  } else if (profile.gpa >= opportunity.gpa) {
    breakdown.gpa = WEIGHTS.gpa;
    reasons.push(`GPA meets minimum requirement (${opportunity.gpa})`);
  } else {
    breakdown.gpa = 0;
  }

  const total = Math.min(
    100,
    breakdown.nationality + breakdown.degree + breakdown.field + breakdown.destination + breakdown.gpa
  );

  return {
    total,
    breakdown,
    reasons,
    missingInfo,
  };
}

export function getMatchLabel(score: number): string {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Partial Match';
  return 'Low Match';
}

export function getMatchColor(score: number): string {
  if (score >= 80) return 'text-accent';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-gold';
  return 'text-text-muted';
}
