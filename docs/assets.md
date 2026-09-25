# Imagens geradas — Sprint 3

Criadas em 25/09/2026 com o recurso integrado `imagegen` (sem CLI/API alternativa). São ilustrações decorativas: não representam uma versão real nem comprovam especificações.

| Arquivo                                           | Uso                         | Dimensões |
| ------------------------------------------------- | --------------------------- | --------- |
| `assets/images/login-automotive-generated-v1.jpg` | Cabeçalho compacto do login | 960 × 320 |
| `assets/images/history-empty-generated-v1.jpg`    | Histórico sem análises      | 540 × 360 |

Os dois arquivos são locais, não exigem rede e não participam da leitura por tecnologias assistivas. Exportados em JPEG com qualidade 84 e dimensões reduzidas; nenhum ativo anterior foi substituído. Imagens originais preservadas em `~/.codex/generated_images/01a0d915-dcd1-7310-8649-3dd777ec812b/`.

## Prompt — login

```text
Use case: stylized-concept.
Asset type: a compact decorative banner for a vehicle specification mobile app login.
Primary request: understated automotive editorial artwork, landscape 3:1 composition. One generic unbranded midnight blue contemporary pickup in a quiet studio, viewed from rear three-quarter angle, sculptural smooth body, subtle electric blue rim light. Restrained sophisticated semi-realistic 3D illustration, carefully shaped lighting, clean surfaces, soft reflections.
Scene/backdrop: seamless dark navy (#001F54) studio with a barely visible floor and generous empty navy space. No scenery or drama. Vehicle occupies the center-right half with breathing space all around; much of the image remains clean navy.
Color palette: navy, cobalt blue, cool silver accents.
Constraints: this is decorative fiction, not a specific model. No logos, no badges, no recognizable grille branding, no people, no text, no letters, no numbers, no watermarks, no UI. Clean and beautiful, not busy. Wide composition suitable at 312 by 104 points in a mobile app.
```

## Prompt — histórico

```text
Use case: stylized-concept.
Asset type: small decorative empty-history illustration for a professional vehicle specification comparison mobile app.
Primary request: two pristine overlapping porcelain white data sheets, sculpted as simple smooth paper slabs with a few short cobalt-blue recessed horizontal bars suggesting specifications, sitting over a faint oval shadow. One small cobalt rounded tab is tucked behind them. Gentle isometric perspective, refined semi-realistic 3D editorial style matching a clean navy and blue automotive app.
Scene/backdrop: pure white seamless backdrop, generous empty white space, centered modest subject.
Composition: landscape 3:2. Whole subject has large margins; keep the shape clear at 180 pixels wide.
Lighting: soft studio daylight, very subtle contact shadows, quiet elegant mood.
Palette: white, navy #001F54, cobalt #0057B8, faint cool grey. Matte ceramic and paper textures, no metallic shine.
Constraints: decorative artwork, no actual charts or factual data, no cars, no checkmarks, no people, no magnifying glass, no extra floating objects, no text, no letters, no numbers, no logos, no watermarks, no UI. Minimal and clean.
```

## Logos e fotografias — atualização 1.2.1

Sete logos locais cobrem todas as marcas do catálogo verificado: Chevrolet, Fiat, Ford, Mitsubishi, Nissan, Toyota e Volkswagen. Arquivos em `assets/images/brands/`, obtidos do [Car Logos Dataset](https://github.com/filippofilip95/car-logos-dataset), com a origem individual registrada em [image-sources.json](image-sources.json). Os nomes continuam em texto e marcas futuras sem arquivo usam um ícone neutro. Os logos permanecem propriedade dos respectivos titulares; a licença do dataset não transfere os direitos sobre marcas.

Fotografias locais em `assets/images/vehicles/`:

- `ford-ranger-2024.jpg`: Ranger Limited, obtida na [matéria do Encontracarros](https://www.encontracarros.com.br/ford-ranger-2024/). Crédito exibido: Encontracarros. A matéria reúne fotos de múltiplas origens; não se atribui esta foto à Ford sem confirmação.
- `ford-ranger-raptor-2024.jpg`: Ranger Raptor, [AutoPapo, lançamento no Brasil](https://autopapo.com.br/noticia/lancamento-ford-ranger-raptor/), com crédito expresso Ford / Divulgação.

As fotos são ilustrativas da família de modelo e só aparecem no detalhe dos modelos Ford correspondentes de 2024/BR. Não confirmam cor, opcionais ou equipamento de uma versão. Crédito curto fica junto à foto; fonte completa neste documento. Os arquivos foram redimensionados/comprimidos, sem alterar veículos ou conteúdo. São recursos de terceiros, não obras geradas nem ativos com licença transferida ao projeto.

## Novos banners gerados — 1.2.1

Criados com o recurso integrado `imagegen`; originais em `~/.codex/generated_images/01a0c634-02ba-7c83-9e57-1cb72011defc/`. Cópias JPEG locais de 1080 × 360; sem dependência de URL remota. São veículos de conceito decorativos, separados das fotos reais e das especificações.

| Arquivo | Tela | Uso |
|---|---|---|
| `assets/images/home-automotive-generated-v1.jpg` | Início | Picape azul em paisagem ao amanhecer, acima das ações principais. |
| `assets/images/compare-automotive-generated-v1.jpg` | Comparar | Duas picapes em estúdio, no cabeçalho anterior à seleção. |

### Prompt — home

```text
Use case: stylized-concept. Asset type: compact 3:1 decorative banner for the Home screen of Ford SpecPulse, a clean navy and blue vehicle specification app. Create refined semi-realistic automotive editorial artwork matching a midnight-blue studio pickup login banner. Subject: one unbranded metallic deep-blue modern crew-cab pickup, rear three-quarter view, parked on a smooth pale stone overlook; distant layered blue mountains and a soft dawn sky. Sophisticated realistic 3D photography, precise sculpted body, restrained cool reflections, tranquil and premium. Wide 3:1 composition, whole truck centered slightly right and fully inside the frame with generous margins; vehicle takes about one third of width, strong silhouette readable at 350 by 116 points. Navy #001F54, cobalt #0057B8 and misty blue-grey palette. Quiet, minimal scenery with empty space and a subtle horizon. No text, no letters, no logos, no badges, no watermarks, no people, no UI, no charts, no dramatic dust. This is decorative concept artwork, not a claimed photograph of any exact Ford version.
```

### Prompt — compare

```text
Use case: stylized-concept. Asset type: compact 3:1 decorative banner for the Compare screen of a clean professional automotive specification app. Create sophisticated semi-realistic 3D automotive editorial artwork consistent with a premium midnight-blue pickup studio photograph. Subject: two generic modern crew-cab pickups of different designs, one metallic midnight blue and one satin silver, parked side by side on a seamless deep navy studio floor, both seen from front three-quarter angle, facing slightly inward without touching. Both entire vehicles visible, equal visual weight and equal size, separated by clear breathing space. Thin cool cobalt rim lighting, precise body geometry, clean surfaces and subtle floor reflections, no excessive glow. Wide landscape 3:1; trucks occupy the central two thirds, generous dark navy border area, readable in a shallow mobile banner. Background #001F54, cobalt #0057B8 accents, cool silver. No text, no logos, no letters, no numbers, no badges, no arrows, no comparison labels, no charts, no people, no UI, no watermark. Decorative concept vehicles, not factual representations of selected models.
```

## Escala no aplicativo

Banners de login, início e comparação usam um contêiner 3:1 com largura máxima de 432 dp. A imagem preenche esse contêiner com `contain` e ambas as dimensões explícitas, impedindo que o React Native use a altura original do bitmap. Fotos de veículos respeitam sua proporção real e altura máxima de 240 dp; logos mantêm slots de 68 × 48 dp (42 × 32 dp nos seletores) com `contain`. Nenhum veículo ou logo é esticado ou recortado.
