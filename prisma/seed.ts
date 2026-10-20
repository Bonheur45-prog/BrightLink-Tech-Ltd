/*
 * Fills the database with the starting content that must exist for the CMS to work:
 * the Site settings row (company details and SEO defaults from src/lib/content/defaults.ts).
 *
 *   npm run db:seed
 *
 * Safe to run again: it only creates what is missing and never overwrites edits made in the CMS.
 * Also creates the starter services, projects and clients, but only while each table is still empty.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { STARTER_CATEGORIES_RAW, STARTER_POSTS_RAW } from '../src/lib/content/blogDefaults';
import { markdownToBlocks } from '../src/lib/content/richtext';
import { blocksToDoc, renderDoc } from '../src/lib/blog/render';
import { DEFAULT_SETTINGS, STARTER_CLIENTS_RAW, STARTER_PROJECTS_RAW, STARTER_SERVICES_RAW } from '../src/lib/content/defaults';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on variables already set in the shell.
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  await seedSettings();
  await seedCollections();
  await seedBlog();
}

async function seedBlog() {
  if ((await prisma.blogCategory.count()) === 0) {
    for (const c of STARTER_CATEGORIES_RAW) {
      await prisma.blogCategory.create({ data: { slug: c.slug, icon: c.icon, color: c.color, sortOrder: c.order, translations: { create: { locale: 'en', name: c.name, description: c.description } } } });
    }
    console.log(`Created ${STARTER_CATEGORIES_RAW.length} blog categories.`);
  }
  if ((await prisma.post.count()) === 0) {
    const cats = await prisma.blogCategory.findMany({ select: { id: true, slug: true } });
    for (const p of STARTER_POSTS_RAW) {
      const category = cats.find((c) => c.slug === p.category) ?? cats[0];
      if (!category) continue;
      const doc = blocksToDoc(markdownToBlocks(p.body));
      const r = renderDoc(doc);
      await prisma.post.create({
        data: {
          slug: p.slug,
          status: 'PUBLISHED',
          categoryId: category.id,
          tags: p.tags,
          featured: !!p.featured,
          focusKeyword: p.focusKeyword,
          readingMinutes: r.readingMinutes,
          publishedAt: new Date(p.date),
          translations: {
            create: { locale: 'en', title: p.title, excerpt: p.excerpt, doc: doc as object, html: r.html, toc: r.toc, fonts: r.fonts, metaTitle: p.metaTitle, metaDescription: p.metaDescription },
          },
        },
      });
    }
    console.log(`Created ${STARTER_POSTS_RAW.length} starter articles.`);
  }
}

async function seedCollections() {
  if ((await prisma.service.count()) === 0) {
    for (const x of STARTER_SERVICES_RAW) {
      await prisma.service.create({
        data: {
          slug: x.slug,
          icon: x.icon,
          sortOrder: x.order,
          status: 'PUBLISHED',
          translations: { create: { locale: 'en', title: x.title, shortDescription: x.shortDescription, features: x.features } },
        },
      });
    }
    console.log(`Created ${STARTER_SERVICES_RAW.length} starter services.`);
  }
  if ((await prisma.project.count()) === 0) {
    const services = await prisma.service.findMany({ select: { id: true, slug: true } });
    for (const x of STARTER_PROJECTS_RAW) {
      const inProgress = x.status === 'in-progress';
      await prisma.project.create({
        data: {
          slug: x.slug,
          status: 'PUBLISHED',
          state: inProgress ? 'IN_PROGRESS' : 'COMPLETED',
          progress: inProgress ? Math.min(99, x.progress ?? 0) : 100,
          externalUrl: x.externalUrl,
          sortOrder: x.order,
          serviceId: services.find((s) => s.slug === x.service)?.id ?? null,
          translations: {
            create: { locale: 'en', title: x.title, category: x.category, shortDescription: x.shortDescription, paragraphs: x.description ? [x.description] : [] },
          },
        },
      });
    }
    console.log(`Created ${STARTER_PROJECTS_RAW.length} starter projects.`);
  }
  if ((await prisma.client.count()) === 0) {
    await prisma.client.createMany({ data: STARTER_CLIENTS_RAW.map((c) => ({ name: c.name, sortOrder: c.order, status: 'PUBLISHED' as const })) });
    console.log(`Created ${STARTER_CLIENTS_RAW.length} starter clients.`);
  }
}

async function seedSettings() {
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
