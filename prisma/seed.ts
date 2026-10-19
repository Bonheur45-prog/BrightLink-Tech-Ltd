/*
 * Fills the database with the starting content that must exist for the CMS to work:
 * the Site settings row (company details and SEO defaults from src/lib/content/defaults.ts).
 *
 *   npm run db:seed
 *
 * Safe to run again: it only creates what is missing and never overwrites edits made in the CMS.
 * Later phases extend it with pages, services, projects, clients and blog categories.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_SETTINGS } from '../src/lib/content/defaults';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on variables already set in the shell.
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const s = DEFAULT_SETTINGS;
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { id: true } });
  if (existing) {
    console.log('Site settings already exist: left untouched.');
    return;
  }
  await prisma.siteSettings.create({
    data: {
      id: 1,
      companyName: s.companyName,
      legalName: s.legalName,
      phone: s.phone,
      secondaryPhone: s.secondaryPhone,
      publicEmail: s.email,
      notificationEmail: s.email,
      addressStreet: s.address.street,
      addressCity: s.address.city,
      addressCountry: s.address.country,
      addressCountryCode: s.address.countryCode,
      openingHours: s.openingHours,
      titleTemplate: s.seo.titleTemplate,
      googleSiteVerification: s.seo.googleSiteVerification,
      translations: {
        create: {
          locale: 'en',
          tagline: s.tagline,
          footerDescription: s.footerDescription,
          seoTitle: s.seo.defaultTitle,
          seoDescription: s.seo.defaultDescription,
        },
      },
    },
  });
  console.log('Created the Site settings row from the starter content.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
