// Export types for ID card design and data
export interface IdDesignConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string;
  headerText?: string;
  layoutTemplate: 'standard' | 'compact' | 'detailed';
  // Back-side design settings
  backBackgroundColor?: string;
  backTextColor?: string;
  backHeaderText?: string;
  backContentText?: string;
  // Nationality configuration
  nationality?: string;
  // Expiry duration configuration
  expiryDurationYears?: number;
}


// Card dimensions in points (credit card size: 85.6mm x 53.98mm = 242.65pt x 153.19pt)
export interface IdCardData {
  name: string;
  idNumber: string;
  kabale: string;
  issueDate: string;
  expiryDate: string;
  dateOfBirth: string;
  sex?: string;
  phone?: string;
  nationality?: string;
  address?: string;
  photoUrl?: string;
  logoUrl?: string;
  qrCodeDataUrl?: string;
}


export interface DigitalIdWithRelations {
  id: string;
  status: string;
  issuedAt: Date;
  expiresAt: Date | null;
  citizen: {
    photoUrl?: string | null;
    dateOfBirth: Date;
    gender?: string | null;
    phone?: string | null;
    address?: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone?: string | null;
    };
  };
  application: {
    kabale: {
      name: string;
      address?: string | null;
    };
  };
}

