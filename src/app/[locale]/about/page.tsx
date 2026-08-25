import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { connectToDatabase } from '@/lib/db/mongoose';
import Page from '@/lib/db/models/Page';
import { Card } from '@/components/ui/Card';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('about');
  
  await connectToDatabase();
  const pageData = await Page.findOne({ slug: 'about' });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="heading-1 text-primary">{pageData ? pageData.title : t('title')}</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Connecting students with life-changing educational opportunities worldwide.
            </p>
          </div>

          {pageData ? (
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          ) : (
            <Card className="p-8">
              <h2 className="heading-2 mb-4 text-text">{t('mission')}</h2>
              <p className="text-text-secondary leading-relaxed">{t('missionText')}</p>
            </Card>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
