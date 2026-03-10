-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  landlord_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  tenant_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  submitted_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  notes text
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_tenant_token ON units(tenant_token);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit_id ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_subscriptions_landlord_id ON subscriptions(landlord_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Demo property
INSERT INTO properties (id, name, address, landlord_id, created_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Sunset Apartments',
  '123 Main St, Springfield, IL 62701',
  '00000000-0000-0000-0000-000000000001',
  now() - interval '60 days'
) ON CONFLICT (id) DO NOTHING;

-- Second demo property
INSERT INTO properties (id, name, address, landlord_id, created_at)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Riverside Commons',
  '456 Oak Ave, Springfield, IL 62702',
  '00000000-0000-0000-0000-000000000001',
  now() - interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo units
INSERT INTO units (id, property_id, unit_number, tenant_token, created_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '1A',
  '11111111-1111-1111-1111-111111111111',
  now() - interval '60 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO units (id, property_id, unit_number, tenant_token, created_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2B',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '60 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO units (id, property_id, unit_number, tenant_token, created_at)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '101',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo maintenance requests
INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Leaking kitchen faucet',
  'The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink.',
  'high',
  'open',
  now() - interval '5 days',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f2222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Broken window latch in bedroom',
  'The latch on the bedroom window is broken and the window will not close properly. Security concern.',
  'urgent',
  'in-progress',
  now() - interval '2 days',
  NULL,
  'Ordered replacement latch - arriving Thursday. Will schedule repair.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f3333333-3333-3333-3333-333333333333',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'HVAC not cooling properly',
  'The air conditioning unit is running but not cooling the apartment below 80 degrees even when set to 68.',
  'high',
  'open',
  now() - interval '3 days',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f4444444-4444-4444-4444-444444444444',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Bathroom caulking needs replacement',
  'The caulking around the bathtub has become moldy and is starting to peel away. Needs to be replaced.',
  'medium',
  'resolved',
  now() - interval '14 days',
  now() - interval '7 days',
  'Recaulked on 3/3. Tenant confirmed resolved.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f5555555-5555-5555-5555-555555555555',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Hallway light bulb out',
  'The light in the main hallway is out. It is very dark at night and poses a safety hazard.',
  'low',
  'resolved',
  now() - interval '10 days',
  now() - interval '9 days',
  'Replaced bulb with LED. Completed same day.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f6666666-6666-6666-6666-666666666666',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Dishwasher not draining',
  'The dishwasher fills with water but does not drain after the cycle completes. Water sits in the bottom.',
  'medium',
  'in-progress',
  now() - interval '1 day',
  NULL,
  'Plumber scheduled for Friday afternoon.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f7777777-7777-7777-7777-777777777777',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Pest sighting in kitchen',
  'Spotted two cockroaches near the sink area. Very concerning. Need extermination ASAP.',
  'urgent',
  'open',
  now() - interval '1 day',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, unit_id, title, description, priority, status, submitted_at, resolved_at, notes)
VALUES (
  'f8888888-8888-8888-8888-888888888888',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Front door lock sticking',
  'The front door deadbolt is very stiff and sometimes does not turn on the first try. Getting worse.',
  'medium',
  'closed',
  now() - interval '21 days',
  now() - interval '18 days',
  'Lubricated and adjusted lock mechanism. Working smoothly now.'
) ON CONFLICT (id) DO NOTHING;

-- Demo subscription (free tier)
INSERT INTO subscriptions (id, landlord_id, plan, stripe_customer_id, stripe_subscription_id, status, created_at)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  '00000000-0000-0000-0000-000000000001',
  'free',
  NULL,
  NULL,
  'active',
  now() - interval '60 days'
) ON CONFLICT (id) DO NOTHING;
