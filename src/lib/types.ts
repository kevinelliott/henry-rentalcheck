export type RequestStatus = 'submitted' | 'in_progress' | 'scheduled' | 'completed' | 'declined'
export type RequestUrgency = 'low' | 'medium' | 'high' | 'emergency'
export type RequestType = 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliance' | 'Structural' | 'Other'

export interface Property {
  id: string
  name: string
  address?: string
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  created_at: string
}

export interface MaintenanceRequest {
  id: string
  token: string
  property_id?: string
  unit_id?: string
  tenant_name: string
  tenant_phone?: string
  unit_number?: string
  request_type: string
  description: string
  urgency: RequestUrgency
  status: RequestStatus
  landlord_notes?: string
  submitted_at: string
  updated_at: string
  properties?: Property
  units?: Unit
}
