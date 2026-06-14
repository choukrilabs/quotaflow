export interface Profile {
  id: string;
  company_name: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  license_number: string | null;
  payment_terms: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  quote_number: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_email: string | null;
  services: string[];
  property_size: string;
  stories: string;
  surface_condition: string;
  access_difficulty: string;
  special_notes: string | null;
  generated_content: string | null;
  total_amount: number;
  line_items: LineItem[] | null;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  valid_until: string;
  created_at: string;
}

export interface LineItem {
  service: string;
  description: string;
  price: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}
