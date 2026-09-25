import { Car } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";
import { automotiveBanners, getBrandLogo } from "../constants/automotiveAssets";
import { colors } from "../constants/specpulseTheme";

export function BrandLogo({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const source = getBrandLogo(name);
  return (
    <View
      style={[styles.logoBox, compact && styles.compactLogoBox]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {source ? (
        <Image
          source={source}
          style={styles.logo}
          resizeMode="contain"
          accessible={false}
        />
      ) : (
        <Car size={compact ? 20 : 26} color={colors.gray} />
      )}
    </View>
  );
}

export function AutomotiveBanner({
  variant,
}: {
  variant: keyof typeof automotiveBanners;
}) {
  return (
    <View style={[styles.banner, variant === "login" && styles.loginBanner]}>
      <Image
        source={automotiveBanners[variant]}
        resizeMode="contain"
        style={styles.fittedImage}
        accessible={false}
        importantForAccessibility="no"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    width: 68,
    height: 48,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compactLogoBox: { width: 42, height: 32, padding: 2, borderRadius: 8 },
  logo: { width: "100%", height: "100%" },
  banner: {
    width: "100%",
    maxWidth: 432,
    maxHeight: 144,
    alignSelf: "center",
    aspectRatio: 3,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.navy,
  },
  loginBanner: { borderRadius: 0 },
  // Set both dimensions: React Native Image otherwise inherits the bitmap's
  // pixel height, even when its style supplies a width and aspectRatio.
  fittedImage: { width: "100%", height: "100%" },
});
