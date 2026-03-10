export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'submitted': return 'bg-yellow-100 text-yellow-800'
    case 'acknowledged': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-indigo-100 text-indigo-800'
    case 'resolved': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function getUrgencyBadgeClass(urgency: string): string {
  switch (urgency) {
    case 'Emergency': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'submitted': return 'Submitted'
    case 'acknowledged': return 'Acknowledged'
    case 'in_progress': return 'In Progress'
    case 'resolved': return 'Resolved'
    default: return status
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'Emergency': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}
