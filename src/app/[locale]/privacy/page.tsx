import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { connectToDatabase } from '@/lib/db/mongoose';
import Page from '@/lib/db/models/Page';

export default async function PrivacyPage() {
  await connectToDatabase();
  const pageData = await Page.findOne({ slug: 'privacy' });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="heading-1 text-primary">{pageData?.title || 'Privacy Policy'}</h1>
            <p className="text-text-muted">Last updated: August 2026</p>
          </div>

          {pageData ? (
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-border prose-content max-w-none">
              <p>Content not found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
