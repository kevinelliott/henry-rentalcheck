export interface Property {
  id: string
  user_id: string
  name: string
  address: string
  property_token: string
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  tenant_name: string | null
  tenant_email: string | null
  created_at: string
  property?: Property
}

export interface MaintenanceRequest {
  id: string
  property_id: string
  unit_number: string
  tenant_name: string
  category: string
  description: string
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency'
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved'
  request_token: string
  landlord_notes: string | null
  created_at: string
  updated_at: string
  property?: Property
}

export interface RequestStatusHistory {
  id: string
  request_id: string
  old_status: string | null
  new_status: string
  note: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'free' | 'starter' | 'growth'
  status: string
  created_at: string
  updated_at: string
}
