import { connectToDatabase } from '../src/lib/db/mongoose';
import Page from '../src/lib/db/models/Page';

const ABOUT_HTML = `
          <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div class="p-6 text-center space-y-4 bg-white rounded-2xl border border-gray-200">
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3 class="font-bold text-gray-900">Global Reach</h3>
              <p class="text-sm text-gray-500">Opportunities across multiple continents and countries.</p>
            </div>
            <div class="p-6 text-center space-y-4 bg-white rounded-2xl border border-gray-200">
              <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 class="font-bold text-gray-900">Verified Quality</h3>
              <p class="text-sm text-gray-500">Every opportunity is manually reviewed and verified.</p>
            </div>
            <div class="p-6 text-center space-y-4 bg-white rounded-2xl border border-gray-200">
              <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 class="font-bold text-gray-900">Student First</h3>
              <p class="text-sm text-gray-500">Designed entirely around helping students succeed.</p>
            </div>
          </div>

          <div class="p-8 bg-blue-800 text-white rounded-2xl mb-12">
            <h2 class="text-3xl font-bold mb-4">Our Vision</h2>
            <p class="text-blue-100 leading-relaxed font-medium text-lg">
              A world where no talented student misses an educational opportunity due to lack of information or guidance.
            </p>
          </div>
          
          <div class="p-8 bg-white rounded-2xl border border-gray-200">
            <h2 class="text-2xl font-bold mb-4 text-gray-900">Our Mission</h2>
            <p class="text-gray-600 leading-relaxed">
              EduBridge Agency exists to bridge the gap between students and life-changing educational opportunities. We believe that every student, regardless of their background or location, deserves access to information about scholarships and educational pathways that can transform their future.
            </p>
          </div>
`;

const PRIVACY_HTML = `
          <div class="p-8 bg-white rounded-2xl border border-gray-200 prose-content max-w-none">
            <h2 class="text-2xl font-bold mb-4">1. Introduction</h2>
            <p class="text-gray-600 mb-6">
              Welcome to EduBridge Agency. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 class="text-2xl font-bold mb-4">2. The Data We Collect About You</h2>
            <p class="text-gray-600 mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul class="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
            </ul>

            <h2 class="text-2xl font-bold mb-4">3. How We Use Your Personal Data</h2>
            <p class="text-gray-600 mb-6">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services, manage our relationship with you, and improve our website.
            </p>

            <h2 class="text-2xl font-bold mb-4">4. Data Security</h2>
            <p class="text-gray-600 mb-6">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 class="text-2xl font-bold mb-4">5. Contact Us</h2>
            <p class="text-gray-600">
              If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@edubridge-agency.com.
            </p>
          </div>
`;

const TERMS_HTML = `
          <div class="p-8 bg-white rounded-2xl border border-gray-200 prose-content max-w-none">
            <h2 class="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p class="text-gray-600 mb-6">
              By accessing and using EduBridge Agency, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 class="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p class="text-gray-600 mb-6">
              EduBridge Agency provides an online platform that aggregates scholarship, fellowship, and educational opportunity information. We do not grant scholarships ourselves, nor are we affiliated with the scholarship providers unless explicitly stated.
            </p>

            <h2 class="text-2xl font-bold mb-4">3. User Conduct</h2>
            <p class="text-gray-600 mb-4">
              You agree to use our platform only for lawful purposes. You are prohibited from:
            </p>
            <ul class="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Using the site in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</li>
              <li>Using the site to copy, store, host, transmit, send, use, publish or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit or other malicious computer software.</li>
              <li>Conducting any systematic or automated data collection activities on or in relation to this website without our express written consent.</li>
            </ul>

            <h2 class="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
            <p class="text-gray-600 mb-6">
              EduBridge Agency shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the services and products offered on this site, or the performance of the services and products.
            </p>

            <h2 class="text-2xl font-bold mb-4">5. Changes to Terms</h2>
            <p class="text-gray-600">
              We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
            </p>
          </div>
`;

const DISCLAIMER_HTML = `
          <div class="p-8 bg-white rounded-2xl border border-gray-200 prose-content max-w-none">
            <div class="flex items-center gap-3 mb-6 p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
              <p class="font-medium m-0">EduBridge Agency is an informational platform. We do not award scholarships or handle applications directly.</p>
            </div>

            <h2 class="text-2xl font-bold mb-4">No Affiliation</h2>
            <p class="text-gray-600 mb-6">
              EduBridge Agency is an independent entity and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the universities, governments, or organizations providing the scholarships listed on our platform, unless expressly stated otherwise.
            </p>

            <h2 class="text-2xl font-bold mb-4">Accuracy of Information</h2>
            <p class="text-gray-600 mb-6">
              While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
            </p>

            <h2 class="text-2xl font-bold mb-4">External Links</h2>
            <p class="text-gray-600 mb-6">
              Through this website, you are able to link to other websites which are not under the control of EduBridge Agency. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
            </p>

            <h2 class="text-2xl font-bold mb-4">Application Success</h2>
            <p class="text-gray-600">
              We do not guarantee that using our platform will result in a successful scholarship application. The final decision rests entirely with the respective scholarship providers.
            </p>
          </div>
`;

const COOKIES_HTML = `
          <div class="p-8 bg-white rounded-2xl border border-gray-200 prose-content max-w-none">
            <h2 class="text-2xl font-bold mb-4">What are cookies?</h2>
            <p class="text-gray-600 mb-6">
              Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            </p>

            <h2 class="text-2xl font-bold mb-4">How do we use cookies?</h2>
            <p class="text-gray-600 mb-4">
              EduBridge Agency uses cookies for the following purposes:
            </p>
            <ul class="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
              <li><strong>Analytics and Performance Cookies:</strong> These are used to collect information about traffic to our website and how users use our website. The information gathered does not identify any individual visitor.</li>
              <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (e.g., your choice of language or region).</li>
            </ul>

            <h2 class="text-2xl font-bold mb-4">How to manage cookies</h2>
            <p class="text-gray-600 mb-6">
              You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
            </p>

            <h2 class="text-2xl font-bold mb-4">Contact</h2>
            <p class="text-gray-600">
              If you have any questions about our use of cookies, please contact us at privacy@edubridge-agency.com.
            </p>
          </div>
`;

const DEFAULT_PAGES = [
  { slug: 'about', title: 'About Us', content: ABOUT_HTML },
  { slug: 'privacy', title: 'Privacy Policy', content: PRIVACY_HTML },
  { slug: 'terms', title: 'Terms of Service', content: TERMS_HTML },
  { slug: 'disclaimer', title: 'Disclaimer', content: DISCLAIMER_HTML },
  { slug: 'cookies', title: 'Cookie Policy', content: COOKIES_HTML },
];

async function seed() {
  await connectToDatabase();
  console.log('Seeding pages...');
  
  for (const p of DEFAULT_PAGES) {
    const exists = await Page.findOne({ slug: p.slug });
    if (!exists) {
      await Page.create(p);
      console.log('Created ' + p.slug);
    } else {
      console.log(p.slug + ' already exists, skipping.');
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

seed();
