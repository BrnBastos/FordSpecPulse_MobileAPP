import { useMutation } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useSyncExternalStore } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  AppCard,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
} from "../../components/SpecPulseUI";
import { logout, sessionSnapshot, subscribeSession } from "../../services/auth";
export default function ProfileScreen() {
  const session = useSyncExternalStore(subscribeSession, sessionSnapshot);
  const mutation = useMutation({ mutationFn: logout });
  const roles: Record<string, string> = {
    admin: "Administrador",
    analyst: "Analista",
    analista: "Analista",
    gerente: "Gerente",
    read_only: "Consulta",
    somente_leitura: "Somente leitura",
    administrador: "Administrador",
    validador_dados: "Validador de dados",
  };
  return (
    <ScreenContainer bottomSafeArea={false}>
      <ScrollView>
        <PageTitle title="Perfil" />
        <AppCard>
          <Text style={{ fontSize: 22, fontWeight: "600" }}>
            {session?.user.name}
          </Text>
          <Text>{session?.user.email}</Text>
          <Text style={{ marginTop: 16 }}>
            Acesso:{" "}
            {session?.user.roles
              .map((role) => roles[role.toLowerCase()] ?? role)
              .join(", ")}
          </Text>
          <Text style={{ marginTop: 16 }}>
            Ford SpecPulse • {Constants.expoConfig?.version}
          </Text>
        </AppCard>
        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label="Sair da conta"
            disabled={mutation.isPending}
            onPress={() => mutation.mutate()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
