import { IdDesignConfig } from "./pdf-types";

// Converted from pixels: 380px × 240px (preview size)
export const CARD_WIDTH = 380;
export const CARD_HEIGHT = 240;
export const HEADER_HEIGHT = 42; // 35px * (242.65/380) ≈ 22.3pt


export const createStyles = (config: IdDesignConfig) => {
  const backBgColor = config.backBackgroundColor || config.backgroundColor;
  const backTextColor = config.backTextColor || config.textColor;


  return {
    page: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      padding: 0, // 0px                      
    },
    // Front card styles
    frontCard: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: config.backgroundColor,
      borderRadius: 4,
      overflow: 'hidden',
    },
    frontHeader: {
      width: CARD_WIDTH,
      height: HEADER_HEIGHT,
      backgroundColor: config.primaryColor,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 4,
      paddingBottom: 4,
    },
    frontHeaderText: {
      fontSize: 18,
      fontWeight: 600,
      color: '#ffffff',
      fontFamily: config.fontFamily,
      letterSpacing: 0.3,
    },
    frontLogo: {
      width: 18,
      height: 18,
      marginLeft: 8,
    },
    frontContent: {
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 10,
      paddingBottom: 10,
      marginTop: 4,
      flexDirection: 'row',
      gap: 10,
    },
    photoContainer: {
      width: 148,
      height: 164,
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#e5e7eb',
      borderRadius: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      marginLeft: 6,
      marginTop: 6
    },
    photo: {
      width: 148,
      height: 164,
      borderRadius: 3,
    },
    photoPlaceholder: {
      fontSize: 14,
      color: '#6b7280',
    },
    detailsContainer: {
      flex: 1,
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 2,
    },
    fieldLabel: {
      fontSize: 6,
      color: config.textColor,
      opacity: 0.75,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    fieldValue: {
      fontSize: 10,
      fontWeight: 600,
      color: config.textColor,
      marginBottom: 4,
    },
    // Back card styles
    backCard: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: config.backgroundColor,
      borderRadius: 4,
      overflow: 'hidden',
    },
    backHeader: {
      width: CARD_WIDTH,
      height: HEADER_HEIGHT,
      backgroundColor: config.secondaryColor,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 4,
      paddingBottom: 4,
    },
    backHeaderText: {
      fontSize: 18,
      fontWeight: 600,
      color: '#ffffff',
      fontFamily: config.fontFamily,
      letterSpacing: 0.3,
    },
    backContent: {
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 10,
      paddingBottom: 10,
      marginTop: 4,
      marginLeft: 4,
      flexDirection: 'row',
      gap: 10,
    },
    backInfoContainer: {
      flex: 1,
      paddingRight: 10,
    },
    backFieldLabel: {
      fontSize: 6,
      color: config.textColor,
      opacity: 0.75,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    backFieldValue: {
      fontSize: 10,
      fontWeight: 600,
      color: config.textColor,
      marginBottom: 4,
    },
    backFieldValueSecondary: {
      fontSize: 6.75,
      fontWeight: 600,
      color: config.secondaryColor,
      marginBottom: 9,
      lineHeight: 1.4,
    },
    backAddressValue: {
      fontSize: 6,
      fontWeight: 600,
      color: backTextColor,
      marginBottom: 8,
      lineHeight: 1.45,
    },
    qrContainer: {
      width: 164,
      height: 164,
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#e5e7eb',
      borderRadius: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      marginLeft: 6,
      marginTop: 6
    },
    qrCode: {
      width: 164,
      height: 164,
    },
    qrPlaceholder: {
      fontSize: 6,
      color: '#6b7280',
    },
  } satisfies Record<string, React.CSSProperties>;
};