/**
 * Config Adapter: Pure transformation layer between backend config schemas
 * (HotelProfile and HotelPolicies) and frontend UI representations.
 */

export const configAdapter = {
  /**
   * Adapts backend HotelProfile document to UI form state.
   */
  toFrontendProfile: (backendProfile = {}, defaultValues = {}) => {
    return {
      hotelName: backendProfile.property_name || defaultValues.hotelName || 'Luxuria Resort & Spa',
      shayan: backendProfile.legal_name || defaultValues.shayan || 'Hotel Owner',
      tagline: defaultValues.tagline || 'Elegance in every stay',
      email: backendProfile.email || defaultValues.email || 'info@hotel.com',
      phone: backendProfile.phone || defaultValues.phone || '+92 300 0000000',
      website: defaultValues.website || 'www.hotel.com',
      streetAddress: backendProfile.address || defaultValues.streetAddress || '123 Main Street',
      city: backendProfile.city || defaultValues.city || 'Karachi',
      country: backendProfile.country || defaultValues.country || 'Pakistan',
      description: defaultValues.description || 'A premium resort providing world-class hospitality.',
      accentColor: defaultValues.accentColor || '#3b82f6',
      currency: backendProfile.currency || 'PKR',
      timezone: backendProfile.timezone || 'Asia/Karachi',
      logoUrl: backendProfile.logo_url || null,
    };
  },

  /**
   * Adapts UI form state to backend PUT /hotel/profile payload.
   * Enforces backend Joi validation boundaries.
   */
  toBackendProfilePayload: (formData = {}, logoUrl = null) => {
    const payload = {};

    if (formData.hotelName && formData.hotelName.trim().length >= 2) {
      payload.property_name = formData.hotelName.trim();
    }

    if (formData.shayan && formData.shayan.trim()) {
      payload.legal_name = formData.shayan.trim();
    }

    if (formData.email && formData.email.trim()) {
      payload.email = formData.email.trim().toLowerCase();
    }

    if (formData.phone && formData.phone.trim().length >= 5) {
      payload.phone = formData.phone.trim();
    }

    if (formData.streetAddress && formData.streetAddress.trim()) {
      payload.address = formData.streetAddress.trim();
    }

    if (formData.city && formData.city.trim()) {
      payload.city = formData.city.trim();
    }

    if (formData.country && formData.country.trim()) {
      payload.country = formData.country.trim();
    }

    if (formData.currency && formData.currency.trim().length === 3) {
      payload.currency = formData.currency.trim().toUpperCase();
    }

    if (formData.timezone && formData.timezone.trim()) {
      payload.timezone = formData.timezone.trim();
    }

    // Only send logo_url if it's a valid URI string <= 500 chars (per Joi schema)
    if (logoUrl && typeof logoUrl === 'string' && logoUrl.length <= 500 && /^https?:\/\//i.test(logoUrl)) {
      payload.logo_url = logoUrl;
    }

    return payload;
  },

  /**
   * Adapts backend HotelPolicies document to UI policies state.
   */
  toFrontendPolicies: (backendPolicies = {}, currentRules = {}) => {
    const cancellationRules = Array.isArray(currentRules.cancellationRules) ? currentRules.cancellationRules : [];
    const propertyRules = Array.isArray(currentRules.propertyRules) ? currentRules.propertyRules : [];
    const guestIdRules = Array.isArray(currentRules.guestIdRules) ? currentRules.guestIdRules : [];

    // Sync pet policy toggle with backend pets_allowed
    const updatedPropertyRules = propertyRules.map((rule) => {
      if (rule.id === 'pet' && typeof backendPolicies.pets_allowed === 'boolean') {
        return { ...rule, active: backendPolicies.pets_allowed };
      }
      return rule;
    });

    // Sync id-required toggle with backend id_verification_required
    const updatedGuestIdRules = guestIdRules.map((rule) => {
      if (rule.id === 'id-required' && typeof backendPolicies.id_verification_required === 'boolean') {
        return { ...rule, active: backendPolicies.id_verification_required };
      }
      return rule;
    });

    return {
      checkInTime: backendPolicies.check_in_time || '14:00',
      checkOutTime: backendPolicies.check_out_time || '11:00',
      cancellationPolicyText: backendPolicies.cancellation_policy || '',
      cancellationRules,
      propertyRules: updatedPropertyRules,
      guestIdRules: updatedGuestIdRules,
      paymentMethods: Array.isArray(backendPolicies.payment_methods_accepted) ? backendPolicies.payment_methods_accepted : ['Credit Card', 'Cash'],
      petsAllowed: Boolean(backendPolicies.pets_allowed),
      idVerificationRequired: backendPolicies.id_verification_required !== false,
    };
  },

  /**
   * Adapts UI policies state to backend PUT /hotel/policies payload.
   */
  toBackendPoliciesPayload: (policiesState = {}) => {
    const payload = {};

    if (policiesState.checkInTime) {
      payload.check_in_time = policiesState.checkInTime;
    }
    if (policiesState.checkOutTime) {
      payload.check_out_time = policiesState.checkOutTime;
    }

    if (typeof policiesState.petsAllowed === 'boolean') {
      payload.pets_allowed = policiesState.petsAllowed;
      payload.pet_policy = policiesState.petsAllowed
        ? 'Pets allowed in specific room types with surcharge.'
        : 'Strictly no pets allowed on property.';
    }

    if (typeof policiesState.idVerificationRequired === 'boolean') {
      payload.id_verification_required = policiesState.idVerificationRequired;
    }

    if (policiesState.cancellationPolicyText) {
      payload.cancellation_policy = policiesState.cancellationPolicyText;
    }

    if (Array.isArray(policiesState.paymentMethods) && policiesState.paymentMethods.length > 0) {
      payload.payment_methods_accepted = policiesState.paymentMethods;
    }

    return payload;
  },
};

export default configAdapter;
