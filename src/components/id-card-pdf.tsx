import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { IdDesignConfig } from '@/lib/pdf-types';
import type { IdCardData } from '@/lib/pdf-types';
import { CARD_HEIGHT, CARD_WIDTH, createStyles } from '@/lib/id-card-helper';

export interface IdCardPdfProps {
  config: IdDesignConfig;
  data: IdCardData;
}

function FrontCard({ config, data, styles }: { config: IdDesignConfig; data: IdCardData; styles: ReturnType<typeof createStyles> }) {
 
  return (
    <View style={styles.frontCard}>
      {/* Header */}
      <View style={styles.frontHeader}>
        {config.headerText && (
          <Text style={styles.frontHeaderText}>{config.headerText}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.frontContent}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {data.photoUrl ? (
            <Image src={data.photoUrl} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>Photo</Text>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Full Name */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <Text style={styles.fieldValue}>{data.name}</Text>
          </View>

          {/* Date of Birth */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.fieldValue}>{data.dateOfBirth}</Text>
          </View>

          {/* Phone Number */}
          {data.phone && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>{data.phone}</Text>
            </View>
          )}

          {/* Sex */}
          {data.sex && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.fieldLabel}>Sex</Text>
              <Text style={styles.fieldValue}>{data.sex}</Text>
            </View>
          )}

          {/* ID Number */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.fieldLabel}>ID Number</Text>
            <Text style={styles.fieldValue}>{data.idNumber}</Text>
          </View>

          {/* Kabale */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.fieldLabel}>Kabale</Text>
            <Text style={styles.fieldValue}>{data.kabale}</Text>
          </View>

        </View>
      </View>
    </View>
  );
}

function BackCard({ config, data, styles }: { config: IdDesignConfig; data: IdCardData; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.backCard}>
      {/* Header */}
      <View style={styles.backHeader}>
        {config.backHeaderText && (
          <Text style={styles.backHeaderText}>{config.backHeaderText}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.backContent}>
        {/* Left side - Information */}
        <View style={styles.backInfoContainer}>
          {/* Nationality */}
          {data.nationality && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.backFieldLabel}>Nationality</Text>
              <Text style={styles.backFieldValue}>{data.nationality}</Text>
            </View>
          )}

          {/* Address */}
          {data.address && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.backFieldLabel}>Address</Text>
              <Text style={styles.backAddressValue}>{data.address}</Text>
            </View>
          )}

          {/* Id Number */}
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.backFieldLabel}>Id Number</Text>
            <Text style={styles.backFieldValueSecondary}>{data.idNumber}</Text>
          </View>


          {/* Date of Issue */}
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.backFieldLabel}>Date of Issue</Text>
            <Text style={styles.backFieldValue}>{data.issueDate}</Text>
          </View>

          {/* Date of Expiry */}
          {data.expiryDate && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.backFieldLabel}>Date of Expiry</Text>
              <Text style={styles.backFieldValue}>{data.expiryDate}</Text>
            </View>
          )}
        </View>

        {/* Right side - QR Code */}
        <View style={styles.qrContainer}>
          {data.qrCodeDataUrl ? (
            <Image src={data.qrCodeDataUrl} style={styles.qrCode} />
          ) : (
            <Text style={styles.qrPlaceholder}>QR Code</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function IdCardPdfDocument({ config, data }: IdCardPdfProps) {
  const styles = StyleSheet.create(createStyles(config));

  return (
    <Document>
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <FrontCard config={config} data={data} styles={styles} />
      </Page>
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <BackCard config={config} data={data} styles={styles} />
      </Page>
    </Document>
  );
}
