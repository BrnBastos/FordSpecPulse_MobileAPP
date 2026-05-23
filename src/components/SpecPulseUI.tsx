import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../constants/specpulseTheme";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};


export function ScreenContainer({ children }: CardProps) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.screen}>{children}</View>
    </SafeAreaView>
  );
}

export function AppCard({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "blue" | "green" | "yellow" | "red" | "neutral";
}) {
  const toneStyle = {
    blue: { backgroundColor: colors.lightBlue, color: colors.fordBlue },
    green: { backgroundColor: "#E8F7EF", color: colors.success },
    yellow: { backgroundColor: "#FFF7E6", color: colors.warning },
    red: { backgroundColor: "#FEECEC", color: colors.danger },
    neutral: { backgroundColor: colors.lightGray, color: colors.graphite },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: toneStyle.color }]}>
        {label}
      </Text>
    </View>
  );
}

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={colors.fordBlue} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <AppCard>
      <Image
        source={require("../../assets/images/empty-data.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />

      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
    </AppCard>
  );
}

export function ErrorState({
  message = "Não foi possível carregar os dados.",
}: {
  message?: string;
}) {
  return (
    <AppCard>
      <Text style={styles.errorTitle}>Erro</Text>
      <Text style={styles.stateText}>{message}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  emptyImage: {
  width: "100%",
  height: 120,
  marginBottom: spacing.sm,
},
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E7ECF3",
    shadowColor: "#001F54",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  titleBlock: {
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.fordBlue,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    color: colors.navy,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.gray,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.fordBlue,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#A8B5C7",
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: colors.lightBlue,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.fordBlue,
    fontWeight: "800",
    fontSize: 15,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  centerState: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    color: colors.gray,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    color: colors.navy,
    fontWeight: "800",
    fontSize: 16,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: "900",
    fontSize: 16,
  },
});