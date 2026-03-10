-- Enable pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- units table
CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- maintenance_requests table
CREATE TABLE maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  property_id uuid REFERENCES properties(id),
  unit_id uuid REFERENCES units(id),
  tenant_name text NOT NULL,
  tenant_phone text,
  unit_number text,
  request_type text NOT NULL,
  description text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'submitted',
  landlord_notes text,
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
