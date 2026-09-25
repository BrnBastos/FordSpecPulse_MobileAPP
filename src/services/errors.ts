import { isAxiosError } from "axios";
export function errorMessage(error: unknown): string {
  if (!isAxiosError(error))
    return error instanceof Error
      ? error.message
      : "Não foi possível concluir. Tente novamente.";
  const status = error.response?.status;
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Seu perfil não tem permissão para esta ação.";
  if (status === 404) return "O item solicitado não foi encontrado.";
  if (status === 409)
    return "Os dados foram alterados. Atualize e tente novamente.";
  if (status === 400 || status === 422)
    return "Confira os dados informados e tente novamente.";
  if (error.code === "ECONNABORTED")
    return "O serviço demorou para responder. Tente novamente.";
  if (!error.response)
    return "Não foi possível conectar. Confira sua conexão e tente novamente.";
  return "O serviço está indisponível no momento. Tente novamente.";
}
