// Format currency in INR
export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

// Format date and time
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-IN', options);
};

// Format time only
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const options = {
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleTimeString('en-IN', options);
};

// Format relative time (e.g., "5 mins ago")
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// Format order number
export const formatOrderNumber = (orderNumber) => {
  return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
