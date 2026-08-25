import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const demoOpportunities = [
  {
    title: {
      en: 'Mastercard Foundation Scholars Program at University of Rwanda',
      fr: 'Programme de bourses de la Fondation Mastercard à l\'Université du Rwanda',
    },
    slug: 'mastercard-foundation-scholars-program-ur',
    provider: 'Mastercard Foundation',
    organization: 'University of Rwanda',
    type: 'scholarship',
    country: 'Rwanda',
    location: 'Kigali',
    degree: ['undergraduate', 'masters'],
    field: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Agriculture'],
    fundingType: 'fully_funded',
    funding: {
      tuition: true,
      stipend: true,
      accommodation: true,
      travel: true,
    },
    description: {
      en: 'The Mastercard Foundation Scholars Program at UR provides comprehensive support to academically talented yet economically disadvantaged young people in Africa. It covers full tuition, accommodation, living stipends, and leadership development programs.',
      fr: 'Le programme de bourses de la Fondation Mastercard à l\'UR offre un soutien complet aux jeunes Africains talentueux sur le plan académique mais économiquement défavorisés.',
    },
    eligibility: {
      en: 'Must be a citizen of a Sub-Saharan African country. Must demonstrate financial need. Must have a strong academic record and leadership potential.',
      fr: 'Doit être citoyen d\'un pays d\'Afrique subsaharienne. Doit démontrer un besoin financier.',
    },
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2 months from now
    officialUrl: 'https://ur.ac.rw/?Mastercard-Foundation-Scholars-Program',
    status: 'published',
    isFeatured: true,
    isDemo: true,
    verification: {
      status: 'verified',
      sourceUrl: 'https://ur.ac.rw/?Mastercard-Foundation-Scholars-Program',
    }
  },
  {
    title: {
      en: 'Eiffel Excellence Scholarship Program',
      fr: 'Programme de bourses d\'excellence Eiffel',
    },
    slug: 'eiffel-excellence-scholarship-france',
    provider: 'French Ministry for Europe and Foreign Affairs',
    type: 'scholarship',
    country: 'France',
    degree: ['masters', 'phd'],
    field: ['Engineering', 'Management', 'Law', 'Political Science'],
    fundingType: 'fully_funded',
    funding: {
      tuition: true,
      stipend: true,
      accommodation: false,
      travel: true,
    },
    description: {
      en: 'The Eiffel Excellence Scholarship Program was established by the French Ministry for Europe and Foreign Affairs to enable French higher education institutions to attract top foreign students to enroll in their masters and PhD programs.',
      fr: 'Le programme de bourses d\'excellence Eiffel a été créé par le ministère de l\'Europe et des Affaires étrangères pour permettre aux établissements d\'enseignement supérieur français d\'attirer les meilleurs étudiants étrangers.',
    },
    deadline: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
    officialUrl: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
    status: 'published',
    isFeatured: true,
    isDemo: true,
    verification: {
      status: 'verified',
      sourceUrl: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
    }
  },
  {
    title: {
      en: 'Chevening Scholarships for Rwandan Students',
      fr: 'Bourses Chevening pour les étudiants rwandais',
    },
    slug: 'chevening-scholarships-uk',
    provider: 'UK Government',
    type: 'scholarship',
    country: 'United Kingdom',
    degree: ['masters'],
    field: ['All'],
    fundingType: 'fully_funded',
    funding: {
      tuition: true,
      stipend: true,
      accommodation: true,
      travel: true,
    },
    description: {
      en: 'Chevening is the UK government’s international awards programme aimed at developing global leaders. Funded by the Foreign, Commonwealth and Development Office (FCDO) and partner organisations, Chevening offers a unique opportunity for future leaders, influencers, and decision-makers from all over the world to develop professionally and academically.',
      fr: 'Chevening est le programme de récompenses internationales du gouvernement britannique visant à développer des leaders mondiaux.',
    },
    deadline: new Date(new Date().setDate(new Date().getDate() - 5)), // Expired 5 days ago
    officialUrl: 'https://www.chevening.org/scholarship/rwanda/',
    status: 'published',
    isFeatured: false,
    isDemo: true,
    verification: {
      status: 'verified',
      sourceUrl: 'https://www.chevening.org/scholarship/rwanda/',
    }
  },
  {
    title: {
      en: 'DAAD EPOS Scholarships in Germany',
      fr: 'Bourses DAAD EPOS en Allemagne',
    },
    slug: 'daad-epos-scholarships-germany',
    provider: 'DAAD (German Academic Exchange Service)',
    type: 'scholarship',
    country: 'Germany',
    degree: ['masters', 'phd'],
    field: ['Development Studies', 'Engineering', 'Public Health', 'Economics'],
    fundingType: 'fully_funded',
    funding: {
      tuition: true,
      stipend: true,
      accommodation: false,
      travel: true,
    },
    description: {
      en: 'The EPOS programme offers individual scholarships to participants from developing countries so that they may study development-related postgraduate courses at selected universities in Germany.',
      fr: 'Le programme EPOS offre des bourses individuelles aux participants des pays en développement pour étudier des cours de troisième cycle liés au développement dans des universités sélectionnées en Allemagne.',
    },
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months from now
    officialUrl: 'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/',
    status: 'published',
    isFeatured: true,
    isDemo: true,
    verification: {
      status: 'verified',
      sourceUrl: 'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/',
    }
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    // We'll import the model directly to avoid next.js runtime issues in simple script
    const OpportunitySchema = new mongoose.Schema({
      title: {
        en: { type: String, required: true },
        fr: { type: String },
      },
      slug: { type: String, required: true, unique: true },
      provider: { type: String, required: true },
      organization: String,
      type: { type: String, required: true },
      country: String,
      location: String,
      degree: [String],
      field: [String],
      fundingType: { type: String, required: true },
      funding: {
        tuition: { type: Boolean, default: false },
        stipend: { type: Boolean, default: false },
        accommodation: { type: Boolean, default: false },
        travel: { type: Boolean, default: false },
      },
      description: {
        en: { type: String, required: true },
        fr: String,
      },
      eligibility: {
        en: String,
        fr: String,
      },
      deadline: Date,
      officialUrl: { type: String, required: true },
      status: { type: String, default: 'draft' },
      isFeatured: { type: Boolean, default: false },
      isDemo: { type: Boolean, default: false },
      verification: {
        status: { type: String, default: 'unverified' },
        sourceUrl: String,
      }
    }, { timestamps: true });

    const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

    console.log('Clearing old demo opportunities...');
    await Opportunity.deleteMany({ isDemo: true });

    console.log(`Inserting ${demoOpportunities.length} demo opportunities...`);
    await Opportunity.insertMany(demoOpportunities);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
