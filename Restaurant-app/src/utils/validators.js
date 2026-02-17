// Validate food item data
export const validateFoodItem = (foodData) => {
  const errors = {};

  if (!foodData.name || foodData.name.trim() === '') {
    errors.name = 'Food name is required';
  }

  if (!foodData.description || foodData.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!foodData.price || foodData.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!foodData.category || foodData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate profile data
export const validateProfile = (profileData) => {
  const errors = {};

  if (!profileData.name || profileData.name.trim() === '') {
    errors.name = 'Restaurant name is required';
  }

  if (!profileData.phone || profileData.phone.trim() === '') {
    errors.phone = 'Phone number is required';
  } else if (!/^[+]?[\d\s-()]+$/.test(profileData.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (!profileData.address || profileData.address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (!profileData.cuisineType || profileData.cuisineType.trim() === '') {
    errors.cuisineType = 'Cuisine type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate price format
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
