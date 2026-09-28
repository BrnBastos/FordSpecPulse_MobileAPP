# Entrega — Ford SpecPulse 1.2.2

## Arquivos

- [APK Android](../artifacts/FordSpecPulse-1.2.2.apk), versão 1.2.2 / código Android 5.
- [Checksum SHA-256](../artifacts/FordSpecPulse-1.2.2.apk.sha256).
- [Pacote local de entrega](../artifacts/FordSpecPulse-Sprint3-1.2.2.zip): código, documentação, capturas, APK atual e prévia de consulta.
- [Roteiro e cobertura das telas](demonstracao-sprint-3.md).

O APK e o ZIP são arquivos locais ignorados pelo Git. Para a entrega, anexar o pacote ou o APK ao canal da disciplina junto do repositório e da demonstração. Esses links não representam uma publicação remota. O aceite Raptor continua pendente: a referência foi recebida e revelou lacunas na API.

SHA-256 do APK: `83e082799ae0393d957f2b9db33c09af6bffb5a171281ef8af3ac973d4a6285b`.

A versão 1.2.2 atualiza a API para `https://ford-spec-pulse-api-r64e.onrender.com/api`. Os 73 arquivos usados na compilação estão registrados no manifesto. [Manifesto](release-source-1.2.2.sha256), [metadados](apk-metadata-1.2.2.txt).

## Instalar e apresentar

```sh
adb install -r artifacts/FordSpecPulse-1.2.2.apk
adb shell monkey -p com.brnbastos.fordspecpulse -c android.intent.category.LAUNCHER 1
```

Também é possível copiar o APK para o Android e abri-lo pelo instalador do sistema. A aplicação usa a API HTTPS Render e inicia sem Metro/Expo Go. Use uma conta de avaliação com permissão para comparação, fornecida privadamente pela equipe; cadastro comum não garante esse acesso.

A build local equivalente ao EAS já foi instalada no Android 16. A página 13 permite dispositivo físico ou emulador e não exige publicação na Play Store nem hospedagem pública do APK.

O APK 1.2.1 e seus ZIPs são históricos e apontam para o servidor anterior. Para instalar ou compartilhar, use a versão 1.2.2.

## Aceite ainda aberto

- Correção das lacunas e divergências da API identificadas na [conferência do slide Ranger Raptor](validacao-ranger-raptor.md), seguida de nova validação.

Comparação mista/somente livre, histórico persistente e galeria das dez telas foram concluídos em 26/09 com a conta de avaliação autorizada.
