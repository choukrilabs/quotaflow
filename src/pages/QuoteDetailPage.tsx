import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Quote, LineItem } from '../types';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        navigate('/dashboard');
        return;
      }

      setQuote(data);
      setLoading(false);
    }

    fetchQuote();
  }, [id, user, navigate]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function handleDownloadPDF() {
    window.print();
  }

  if (loading) {
    return (
      <Layout showNav>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
        </div>
      </Layout>
    );
  }

  if (!quote) {
    return null;
  }

  const lineItems: LineItem[] = quote.line_items || [];

  // Default content if no AI-generated content
  const defaultIncluded = [
    'Professional pressure washing service',
    'Pre-treatment of all surfaces',
    'Environmentally safe cleaning solutions',
    'Thorough rinse and cleanup',
    'Satisfaction guaranteed',
  ];

  const defaultPaymentTerms = '50% deposit required to schedule. Balance due upon completion.';
  const defaultNotes = 'This quote is valid for 30 days. Price may vary based on actual site conditions.';
  const defaultThankYou = 'Thank you for considering us for your pressure washing needs. We look forward to working with you!';

  let includedItems: string[] = defaultIncluded;
  let paymentTerms = defaultPaymentTerms;
  let additionalNotes = defaultNotes;
  let thankYouMessage = defaultThankYou;

  // Parse generated content if available
  if (quote.generated_content) {
    try {
      const content = JSON.parse(quote.generated_content);
      if (content.included) includedItems = content.included;
      if (content.paymentTerms) paymentTerms = content.paymentTerms;
      if (content.notes) additionalNotes = content.notes;
      if (content.thankYou) thankYouMessage = content.thankYou;
    } catch {
      // If not JSON, use as plain text
      additionalNotes = quote.generated_content;
    }
  }

  return (
    <Layout showNav>
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
        <div className="max-w-[850px] mx-auto">
          {/* Action Buttons - Hidden on Print */}
          <div className="mb-6 flex gap-4 no-print">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <Link
              to="/quote/new"
              className="inline-flex items-center bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Create Another Quote
            </Link>
          </div>

          {/* Quote Document */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 max-w-[800px] print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quote.customer_name ? 'QuoteFlow Services' : 'QuoteFlow Services'}</h1>
                <p className="text-sm text-gray-500 mt-1">{quote.customer_phone}</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light text-gray-400">QUOTE</h2>
                <p className="text-sm text-gray-500 mt-1">{quote.quote_number}</p>
                <p className="text-sm text-gray-500">{formatDate(quote.created_at)}</p>
              </div>
            </div>

            {/* Quote For / Quote Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-200">
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">QUOTE FOR</h3>
                <p className="font-semibold text-gray-900">{quote.customer_name}</p>
                <p className="text-sm text-gray-600">{quote.customer_address}</p>
                <p className="text-sm text-gray-600">{quote.customer_phone}</p>
                {quote.customer_email && <p className="text-sm text-gray-600">{quote.customer_email}</p>}
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">QUOTE DETAILS</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Valid Until:</span> {formatDate(quote.valid_until)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    quote.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Services and Pricing */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">SERVICES AND PRICING</h3>

              {lineItems.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="pb-2 font-medium">Service</th>
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-3 pr-4 text-sm text-gray-900">{item.service}</td>
                        <td className="py-3 pr-4 text-sm text-gray-600">{item.description}</td>
                        <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  {quote.services.map((service, index) => (
                    <div key={index} className="py-2 text-sm text-gray-600">
                      {service}
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-900">TOTAL</span>
                <span className="text-2xl font-bold text-[#2563EB]">{formatCurrency(quote.total_amount || 0)}</span>
              </div>
            </div>

            {/* What Is Included */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">WHAT IS INCLUDED</h3>
              <ul className="space-y-2">
                {includedItems.map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Terms */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">PAYMENT TERMS</h3>
              <p className="text-sm text-gray-600">{paymentTerms}</p>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">NOTES</h3>
              <p className="text-sm text-gray-600">{additionalNotes}</p>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Thank you for your business!</p>
              <p className="text-sm text-gray-600 mb-4">{thankYouMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
