import { getTranslations } from 'next-intl/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Resource from '@/lib/db/models/Resource';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Resources - EduBridge Agency',
  description: 'Educational resources, guides, and tips for your academic journey.',
};

export default async function ResourcesPage() {
  const t = await getTranslations('common');
  await connectToDatabase();

  const resourcesDocs = await Resource.find({ published: true })
    .sort({ createdAt: -1 })
    .lean();
    
  const resources = JSON.parse(JSON.stringify(resourcesDocs));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="heading-2 text-text mb-4">Educational Resources</h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              Guides, articles, and tips to help you succeed in your scholarship and job applications.
            </p>
          </div>

          {resources.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
              <BookOpen className="w-12 h-12 text-border-strong mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text mb-2">No Resources Yet</h3>
              <p className="text-text-secondary">
                We are working on putting together some great resources. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource: any) => (
                <div key={resource._id.toString()} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:border-primary transition-all flex flex-col">
                  {resource.coverImage && (
                    <div className="h-48 overflow-hidden bg-surface-alt relative">
                      <img src={resource.coverImage} alt={resource.title.en} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-50 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {resource.category}
                      </span>
                      <span className="flex items-center text-xs text-text-muted gap-1">
                        <Clock className="w-3 h-3" /> {resource.readingTime} min read
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2 line-clamp-2">
                      {resource.title.en}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-1">
                      {resource.excerpt.en}
                    </p>
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center text-xs text-text-muted gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
