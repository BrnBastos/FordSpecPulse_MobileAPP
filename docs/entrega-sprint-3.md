# Entrega — Ford SpecPulse 1.2.1

## Arquivos

- [APK Android](../artifacts/FordSpecPulse-1.2.1.apk), versão 1.2.1 / código Android 4.
- [Checksum SHA-256](../artifacts/FordSpecPulse-1.2.1.apk.sha256).
- [Pacote local de entrega](../artifacts/FordSpecPulse-Sprint3-1.2.1.zip): código, documentação, capturas, APK atual e prévia de consulta.
- [Roteiro e cobertura das telas](demonstracao-sprint-3.md).

O APK e o ZIP são arquivos locais ignorados pelo Git. Para a entrega, anexar o pacote ou o APK ao canal da disciplina junto do repositório e da demonstração. Esses links não representam uma publicação remota. O pacote registra a referência Raptor como aceite ainda pendente.

SHA-256 do APK: `83cfa9d02fcfcce47fc7b74cdc337e40303090055d87365ff3b6012c51444af0`.

Código do aplicativo: commit `0aaf14e`. A documentação posterior esclarece os critérios e organiza a entrega; não altera os 73 arquivos do manifesto de runtime. [Manifesto](release-source-1.2.1.sha256), [metadados](apk-metadata-1.2.1.txt).

## Instalar e apresentar

```sh
adb install -r artifacts/FordSpecPulse-1.2.1.apk
adb shell monkey -p com.brnbastos.fordspecpulse -c android.intent.category.LAUNCHER 1
```

Também é possível copiar o APK para o Android e abri-lo pelo instalador do sistema. A aplicação usa a API HTTPS Render e inicia sem Metro/Expo Go. Use uma conta de avaliação com permissão para comparação, fornecida privadamente pela equipe; cadastro comum não garante esse acesso.

A build local equivalente ao EAS já foi instalada no Android 16. A página 13 permite dispositivo físico ou emulador e não exige publicação na Play Store nem hospedagem pública do APK.

## Aceite ainda aberto

- Referência técnica Ranger Raptor para conferência integral dos atributos.

Comparação mista/somente livre, histórico persistente e galeria das dez telas foram concluídos em 26/09 com a conta de avaliação autorizada.
