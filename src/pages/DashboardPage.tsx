import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import { Quote } from '../types';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState({ totalQuotes: 0, totalRevenue: 0, acceptedQuotes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: quotesData, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        showToast('Failed to load quotes', 'error');
        setLoading(false);
        return;
      }

      setQuotes(quotesData || []);

      // Calculate stats - this month only
      const monthQuotes = (quotesData || []).filter(q => new Date(q.created_at) >= new Date(firstDayOfMonth));
      const totalQuotes = monthQuotes.length;
      const totalRevenue = monthQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);

      // All-time accepted quotes
      const acceptedQuotes = (quotesData || []).filter(q => q.status === 'accepted').length;

      setStats({ totalQuotes, totalRevenue, acceptedQuotes });
      setLoading(false);
    }

    fetchDashboardData();
  }, [showToast]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    return 'Good afternoon';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    };
    return styles[status] || styles.draft;
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

  const servicesDisplay = (services: string[]) => {
    if (!services || services.length === 0) return '-';
    if (typeof services === 'string') return services;
    if (services.length <= 2) return services.join(', ');
    return `${services.slice(0, 2).join(', ')} +${services.length - 2} more`;
  };

  return (
    <Layout showNav>
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {getGreeting()}, {profile?.company_name || 'Business Owner'}
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Quotes This Month</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalQuotes}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue Quoted</div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Quotes Accepted</div>
              <div className="text-3xl font-bold text-gray-900">{stats.acceptedQuotes}</div>
            </div>
          </div>

          {/* Create New Quote Button */}
          <div className="mb-8">
            <Link
              to="/quote/new"
              className="inline-flex items-center bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Quote
            </Link>
          </div>

          {/* Recent Quotes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
            </div>

            {quotes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">You haven't created any quotes yet.</p>
                <Link
                  to="/quote/new"
                  className="inline-block bg-[#2563EB] text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Quote
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quote_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quote.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{servicesDisplay(quote.services)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(quote.total_amount || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(quote.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(quote.status)}`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => navigate(`/quote/${quote.id}`)} className="text-[#2563EB] hover:text-blue-700 font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
