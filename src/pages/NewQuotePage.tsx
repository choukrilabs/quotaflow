import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';

const SERVICES = [
  { id: 'house_washing', name: 'House Washing', priceRange: '$150 - $400' },
  { id: 'driveway_cleaning', name: 'Driv Cleaning', priceRange: '$80 - $200' },
  { id: 'roof_cleaning', name: 'Roof Cleaning', priceRange: '$300 - $600' },
  { id: 'deck_patio_cleaning', name: 'Deck and Patio Cleaning', priceRange: '$100 - $300' },
  { id: 'fence_cleaning', name: 'Fence Cleaning', priceRange: '$80 - $200' },
  { id: 'gutter_cleaning', name: 'Gutter Cleaning', priceRange: '$75 - $150' },
  { id: 'window_cleaning', name: 'Window Cleaning', priceRange: '$100 - $250' },
  { id: 'concrete_sealing', name: 'Concrete Sealing', priceRange: '$200 - $500' },
];

const PROPERTY_SIZES = [
  { id: 'small', label: 'Small (under 1,500 sq ft)' },
  { id: 'medium', label: 'Medium (1,500 - 2,500 sq ft)' },
  { id: 'large', label: 'Large (2,500 - 4,000 sq ft)' },
  { id: 'extra_large', label: 'Extra Large (over 4,000 sq ft)' },
];

const STORIES = [
  { id: 'single', label: 'Single Story' },
  { id: 'two', label: 'Two Story' },
  { id: 'three_plus', label: 'Three Story or More' },
];

const SURFACE_CONDITIONS = [
  { id: 'light', label: 'Light', description: 'Normal maintenance needed', color: 'bg-green-500' },
  { id: 'moderate', label: 'Moderate', description: 'Has not been cleaned in over 2 years', color: 'bg-yellow-500' },
  { id: 'heavy', label: 'Heavy', description: 'Severely stained or neglected', color: 'bg-red-500' },
];

const ACCESS_DIFFICULTY = [
  { id: 'easy', label: 'Easy Access', description: 'Clear access all around property' },
  { id: 'some_obstacles', label: 'Some Obstacles', description: 'Some furniture or obstacles present' },
  { id: 'difficult', label: 'Difficult Access', description: 'Limited access, gates, or obstacles throughout' },
];

interface FieldErrors {
  customerFirstName?: boolean;
  customerLastName?: boolean;
  customerAddress?: boolean;
  customerPhone?: boolean;
  services?: boolean;
  propertySize?: boolean;
  stories?: boolean;
  companyName?: boolean;
  ownerName?: boolean;
  companyPhone?: boolean;
  companyEmail?: boolean;
  validUntil?: boolean;
}

export default function NewQuotePage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const customerFirstNameRef = useRef<HTMLInputElement>(null);
  const customerLastNameRef = useRef<HTMLInputElement>(null);
  const customerAddressRef = useRef<HTMLInputElement>(null);
  const customerPhoneRef = useRef<HTMLInputElement>(null);
  const propertySizeRef = useRef<HTMLSelectElement>(null);
  const storiesRef = useRef<HTMLSelectElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const ownerNameRef = useRef<HTMLInputElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const companyEmailRef = useRef<HTMLInputElement>(null);
  const validUntilRef = useRef<HTMLInputElement>(null);

  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [propertySize, setPropertySize] = useState('');
  const [stories, setStories] = useState('');
  const [surfaceCondition, setSurfaceCondition] = useState('light');
  const [accessDifficulty, setAccessDifficulty] = useState('easy');
  const [specialNotes, setSpecialNotes] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setOwnerName(profile.owner_name || '');
      setCompanyPhone(profile.phone || '');
      setCompanyEmail(profile.email || '');
      setCompanyWebsite(profile.website || '');
      setLicenseNumber(profile.license_number || '');
    }
  }, [profile]);

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setValidUntil(date.toISOString().split('T')[0]);
  }, []);

  function toggleService(serviceId: string) {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
    if (fieldErrors.services) {
      setFieldErrors((prev) => ({ ...prev, services: false }));
    }
  }

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!customerFirstName) errors.customerFirstName = true;
    if (!customerLastName) errors.customerLastName = true;
    if (!customerAddress) errors.customerAddress = true;
    if (!customerPhone) errors.customerPhone = true;
    if (selectedServices.length === 0) errors.services = true;
    if (!propertySize) errors.propertySize = true;
    if (!stories) errors.stories = true;
    if (!companyName) errors.companyName = true;
    if (!ownerName) errors.ownerName = true;
    if (!companyPhone) errors.companyPhone = true;
    if (!companyEmail) errors.companyEmail = true;
    if (!validUntil) errors.validUntil = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const refs: Record<string, React.RefObject<HTMLElement>> = {
        customerFirstName: customerFirstNameRef,
        customerLastName: customerLastNameRef,
        customerAddress: customerAddressRef,
        customerPhone: customerPhoneRef,
        propertySize: propertySizeRef,
        stories: storiesRef,
        companyName: companyNameRef,
        ownerName: ownerNameRef,
        companyPhone: companyPhoneRef,
        companyEmail: companyEmailRef,
        validUntil: validUntilRef,
      };

      if (refs[firstError]?.current) {
        refs[firstError].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('You must be logged in', 'error');
        setLoading(false);
        return;
      }

      // Generate quote number
      const year = new Date().getFullYear();
      const { data: existingQuotes } = await supabase
        .from('quotes')
        .select('quote_number')
        .like('quote_number', `PW-${year}-%`)
        .order('quote_number', { ascending: false })
        .limit(1);

      let sequence = 1;
      if (existingQuotes && existingQuotes.length > 0) {
        const lastQuoteNumber = existingQuotes[0].quote_number;
        const lastSequence = parseInt(lastQuoteNumber.split('-')[2], 10);
        sequence = lastSequence + 1;
      }
      const quoteNumber = `PW-${year}-${sequence.toString().padStart(3, '0')}`;

      const serviceNames = selectedServices.map((id) => {
        const service = SERVICES.find((s) => s.id === id);
        return service?.name || id;
      });

      // Save quote to database
      const { data: quote, error: insertError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          quote_number: quoteNumber,
          customer_name: `${customerFirstName} ${customerLastName}`,
          customer_address: customerAddress,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          services: serviceNames,
          property_size: PROPERTY_SIZES.find((s) => s.id === propertySize)?.label || propertySize,
          stories: STORIES.find((s) => s.id === stories)?.label || stories,
          surface_condition: SURFACE_CONDITIONS.find((s) => s.id === surfaceCondition)?.label || surfaceCondition,
          access_difficulty: ACCESS_DIFFICULTY.find((a) => a.id === accessDifficulty)?.label || accessDifficulty,
          special_notes: specialNotes || null,
          valid_until: validUntil,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError || !quote) {
        showToast('Failed to create quote', 'error');
        setLoading(false);
        return;
      }

      // Send webhook to Make.com with 30 second timeout
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;

      if (webhookUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              quote_id: quote.id,
              quote_number: quoteNumber,
              customer_name: `${customerFirstName} ${customerLastName}`,
              customer_address: customerAddress,
              customer_phone: customerPhone,
              customer_email: customerEmail || '',
              services: serviceNames,
              property_size: PROPERTY_SIZES.find((s) => s.id === propertySize)?.label || propertySize,
              stories: STORIES.find((s) => s.id === stories)?.label || stories,
              surface_condition: SURFACE_CONDITIONS.find((s) => s.id === surfaceCondition)?.label || surfaceCondition,
              access_difficulty: ACCESS_DIFFICULTY.find((a) => a.id === accessDifficulty)?.label || accessDifficulty,
              special_notes: specialNotes || '',
              company_name: companyName,
              owner_name: ownerName,
              company_phone: companyPhone,
              company_email: companyEmail,
              company_website: companyWebsite || '',
              license_number: licenseNumber || '',
              valid_until: validUntil,
            }),
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();

            // Update quote with generated content
            await supabase
              .from('quotes')
              .update({
                generated_content: data.generated_content || '',
                total_amount: data.total_amount || 0,
                line_items: data.line_items || [],
                status: 'sent',
              })
              .eq('id', quote.id);

            showToast('Quote generated successfully!', 'success');
            navigate(`/quote/${quote.id}`);
          } else {
            throw new Error('Webhook response not OK');
          }
        } catch (webhookError) {
          clearTimeout(timeoutId);

          if (webhookError instanceof Error && webhookError.name === 'AbortError') {
            showToast('Quote generation failed. Please try again.', 'error');
          } else {
            showToast('Quote generation failed. Please try again.', 'error');
          }
          setLoading(false);
        }
      } else {
        // No webhook URL - just navigate to the quote
        showToast('Quote created successfully!', 'success');
        navigate(`/quote/${quote.id}`);
      }
    } catch (error) {
      showToast('Error generating quote. Please try again.', 'error');
      setLoading(false);
    }
  }

  function getInputClass(fieldName: keyof FieldErrors): string {
    const baseClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary';
    return fieldErrors[fieldName] ? `${baseClass} border-error` : `${baseClass} border-gray-300`;
  }

  function getSelectClass(fieldName: keyof FieldErrors): string {
    const baseClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary';
    return fieldErrors[fieldName] ? `${baseClass} border-error` : `${baseClass} border-gray-300`;
  }

  return (
    <Layout showNav>
      <div className="min-h-screen bg-bg-secondary py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Create New Quote</h1>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-xl font-semibold text-gray-900 mb-2">Creating your professional quote</p>
                <p className="text-gray-600">Please wait while AI generates your pricing and proposal.</p>
              </div>
            )}

            {/* Section 1: Customer and Job Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer and Job Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer First Name <span className="text-error">*</span></label>
                  <input
                    ref={customerFirstNameRef}
                    type="text"
                    value={customerFirstName}
                    onChange={(e) => {
                      setCustomerFirstName(e.target.value);
                      if (fieldErrors.customerFirstName) setFieldErrors((prev) => ({ ...prev, customerFirstName: false }));
                    }}
                    className={getInputClass('customerFirstName')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Last Name <span className="text-error">*</span></label>
                  <input
                    ref={customerLastNameRef}
                    type="text"
                    value={customerLastName}
                    onChange={(e) => {
                      setCustomerLastName(e.target.value);
                      if (fieldErrors.customerLastName) setFieldErrors((prev) => ({ ...prev, customerLastName: false }));
                    }}
                    className={getInputClass('customerLastName')}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address <span className="text-error">*</span></label>
                <input
                  ref={customerAddressRef}
                  type="text"
                  value={customerAddress}
                  onChange={(e) => {
                    setCustomerAddress(e.target.value);
                    if (fieldErrors.customerAddress) setFieldErrors((prev) => ({ ...prev, customerAddress: false }));
                  }}
                  placeholder="123 Main Street, City, State"
                  className={getInputClass('customerAddress')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone <span className="text-error">*</span></label>
                  <input
                    ref={customerPhoneRef}
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (fieldErrors.customerPhone) setFieldErrors((prev) => ({ ...prev, customerPhone: false }));
                    }}
                    className={getInputClass('customerPhone')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Services Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Services <span className="text-error">*</span></label>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-2 rounded-lg ${fieldErrors.services ? 'bg-red-50' : ''}`}>
                  {SERVICES.map((service) => (
                    <label
                      key={service.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedServices.includes(service.id) ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.priceRange}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {fieldErrors.services && (
                  <p className="text-sm text-error mt-1">Please select at least one service</p>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Size <span className="text-error">*</span></label>
                  <select
                    ref={propertySizeRef}
                    value={propertySize}
                    onChange={(e) => {
                      setPropertySize(e.target.value);
                      if (fieldErrors.propertySize) setFieldErrors((prev) => ({ ...prev, propertySize: false }));
                    }}
                    className={getSelectClass('propertySize')}
                    required
                  >
                    <option value="">Select property size</option>
                    {PROPERTY_SIZES.map((size) => (
                      <option key={size.id} value={size.id}>{size.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Stories <span className="text-error">*</span></label>
                  <select
                    ref={storiesRef}
                    value={stories}
                    onChange={(e) => {
                      setStories(e.target.value);
                      if (fieldErrors.stories) setFieldErrors((prev) => ({ ...prev, stories: false }));
                    }}
                    className={getSelectClass('stories')}
                    required
                  >
                    <option value="">Select number of stories</option>
                    {STORIES.map((story) => (
                      <option key={story.id} value={story.id}>{story.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Surface Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Surface Condition <span className="text-error">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SURFACE_CONDITIONS.map((condition) => (
                    <label
                      key={condition.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        surfaceCondition === condition.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="surface_condition"
                        value={condition.id}
                        checked={surfaceCondition === condition.id}
                        onChange={(e) => setSurfaceCondition(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full ${condition.color} mr-3`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{condition.label}</div>
                        <div className="text-sm text-gray-500">{condition.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Access Difficulty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Access Difficulty <span className="text-error">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ACCESS_DIFFICULTY.map((access) => (
                    <label
                      key={access.id}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        accessDifficulty === access.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="access_difficulty"
                        value={access.id}
                        checked={accessDifficulty === access.id}
                        onChange={(e) => setAccessDifficulty(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        accessDifficulty === access.id ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {accessDifficulty === access.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{access.label}</div>
                        <div className="text-sm text-gray-500">{access.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any details that will affect the quote such as pet gates, fragile surfaces, specific stains, or customer requests."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Section 2: Business Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Business Information</h2>
                <p className="text-sm text-gray-500">This is pre-filled from your profile</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-error">*</span></label>
                  <input
                    ref={companyNameRef}
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (fieldErrors.companyName) setFieldErrors((prev) => ({ ...prev, companyName: false }));
                    }}
                    className={getInputClass('companyName')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-error">*</span></label>
                  <input
                    ref={ownerNameRef}
                    type="text"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      if (fieldErrors.ownerName) setFieldErrors((prev) => ({ ...prev, ownerName: false }));
                    }}
                    className={getInputClass('ownerName')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone <span className="text-error">*</span></label>
                  <input
                    ref={companyPhoneRef}
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => {
                      setCompanyPhone(e.target.value);
                      if (fieldErrors.companyPhone) setFieldErrors((prev) => ({ ...prev, companyPhone: false }));
                    }}
                    className={getInputClass('companyPhone')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Email <span className="text-error">*</span></label>
                  <input
                    ref={companyEmailRef}
                    type="email"
                    value={companyEmail}
                    onChange={(e) => {
                      setCompanyEmail(e.target.value);
                      if (fieldErrors.companyEmail) setFieldErrors((prev) => ({ ...prev, companyEmail: false }));
                    }}
                    className={getInputClass('companyEmail')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License or Insurance Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Valid Until</label>
                <input
                  ref={validUntilRef}
                  type="date"
                  value={validUntil}
                  onChange={(e) => {
                    setValidUntil(e.target.value);
                    if (fieldErrors.validUntil) setFieldErrors((prev) => ({ ...prev, validUntil: false }));
                  }}
                  className={getInputClass('validUntil')}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Generate My Professional Quote
              </button>
              <p className="text-sm text-gray-500 mt-2">Powered by AI — takes about 10 seconds</p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
