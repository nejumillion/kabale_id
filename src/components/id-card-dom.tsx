import { createStyles } from '@/lib/id-card-helper';
import type { IdCardData, IdDesignConfig } from '@/lib/pdf-types';



interface IdCardProps {
  config: IdDesignConfig;
  data: IdCardData;
  side: 'front' | 'back';
}

export function IdCard({ config, data, side }: IdCardProps) {
  const styles = createStyles(config);

  if (side === 'front') {
    return (
      <div style={styles.frontCard}>
        {/* Header */}
        <div style={styles.frontHeader}>
          {config.headerText && (
            <div style={styles.frontHeaderText}>
              {config.headerText}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={styles.frontContent} className="flex flex-row">
          {/* Photo */}
          <div style={styles.photoContainer}>
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Photo"
                style={styles.photo}
              />
            ) : (
              <span style={styles.photoPlaceholder}>
                Photo
              </span>
            )}
          </div>

          {/* Details */}
          <div style={styles.detailsContainer}>
            {/* Full Name */}
            <div style={{ marginBottom: 4 }}>
              <div style={styles.fieldLabel}>
                Full Name
              </div>
              <div style={styles.fieldValue}>
                {data.name}
              </div>
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: 4 }}>
              <div style={styles.fieldLabel}>
                Date of Birth
              </div>
              <div style={styles.fieldValue}>
                {data.dateOfBirth}
              </div>
            </div>

            {/* Phone Number */}
            {data.phone && (
              <div style={{ marginBottom: 4 }}>
                <div style={styles.fieldLabel}>
                  Phone Number
                </div>
                <div style={styles.fieldValue}>
                  {data.phone}
                </div>
              </div>
            )}

            {/* Sex */}
            {data.sex && (
              <div style={{ marginBottom: 4 }}>
                <div style={styles.fieldLabel}>
                  Sex
                </div>
                <div style={styles.fieldValue}>
                  {data.sex}
                </div>
              </div>
            )}

            {/* ID Number */}
            <div style={{ marginBottom: 4 }}>
              <div style={styles.fieldLabel}>
                ID Number
              </div>
              <div style={styles.fieldValue}>
                {data.idNumber}
              </div>
            </div>

            {/* Kabale */}
            <div style={{ marginBottom: 4 }}>
              <div style={styles.fieldLabel}>
                Kabale
              </div>
              <div style={styles.fieldValue}>
                {data.kabale}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Back side
  return (
    <div style={styles.backCard}>
      {/* Header */}
      <div style={styles.backHeader}>
        {config.backHeaderText && (
          <div style={styles.backHeaderText}>
            {config.backHeaderText}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.backContent} className="flex flex-row">
        {/* Left side - Information */}
        <div style={styles.backInfoContainer}>
          {/* Nationality */}
          {data.nationality && (
            <div style={{ marginBottom: 8 }}>
              <div style={styles.backFieldLabel}>
                Nationality
              </div>
              <div style={styles.backFieldValue}>
                {data.nationality}
              </div>
            </div>
          )}

          {/* Address */}
          {data.address && (
            <div style={{ marginBottom: 8 }}>
              <div style={styles.backFieldLabel}>
                Address
              </div>
              <div style={styles.backAddressValue}>
                {data.address}
              </div>
            </div>
          )}

          {/* Id Number */}
          <div style={{ marginBottom: 8 }}>
            <div style={styles.backFieldLabel}>
              Id Number
            </div>
            <div style={styles.backFieldValueSecondary}>
              {data.idNumber}
            </div>
          </div>

          {/* Date of Issue */}
          <div style={{ marginBottom: 8 }}>
            <div style={styles.backFieldLabel}>
              Date of Issue
            </div>
            <div style={styles.backFieldValue}>
              {data.issueDate}
            </div>
          </div>

          {/* Date of Expiry */}
          {data.expiryDate && (
            <div style={{ marginBottom: 8 }}>
              <div style={styles.backFieldLabel}>
                Date of Expiry
              </div>
              <div style={styles.backFieldValue}>
                {data.expiryDate}
              </div>
            </div>
          )}
        </div>

        {/* Right side - QR Code */}
        <div style={styles.qrContainer}>
          {data.qrCodeDataUrl ? (
            <img
              src={data.qrCodeDataUrl}
              alt="QR Code"
              style={styles.qrCode}
            />
          ) : (
            <span style={styles.qrPlaceholder}>
              QR Code
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

