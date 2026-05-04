# Smart Theme Switcher

> Automáticamente cambia el tema de VS Code según tu proyecto, hora del día, lenguaje de programación o tus favoritos.

> Automatically changes your VS Code theme based on your project, time of day, programming language, or favorites.

---

## Español 🇪🇸

### ¿Qué hace?

Smart Theme Switcher te permite cambiar el tema de Visual Studio Code de forma automática usando diferentes modos que puedes combinar entre sí:

| Modo | Qué hace |
|---|---|
| **Workspace** | Cada proyecto tiene su propio tema. Cuando abres un proyecto, el tema se aplica automáticamente |
| **Time** | Cambia el tema según la hora del día (mañana, tarde, noche) usando datos reales de amanecer/atardecer |
| **Favorites** | Rota entre tus temas favoritos de forma manual (con comando) o automática (cada cierto tiempo) |
| **Language** | Cambia el tema según el lenguaje del archivo que estás editando (JavaScript = oscuro, Python = claro, etc.) |

### Comandos

Abre la paleta de comandos (`Ctrl+Shift+P` / `Cmd+Shift+P`) y escribe `Smart Theme`:

| Comando | Descripción |
|---|---|
| `Smart Theme: Change Theme Now` | Cambia al siguiente tema disponible según el modo activo. En modo favoritos, pasa al siguiente favorito |
| `Smart Theme: Enable/Disable` | Activa o desactiva la extensión |
| `Smart Theme: Set Mode` | Configura qué modos quieres usar (puedes seleccionar varios al mismo tiempo) |
| `Smart Theme: Add Favorite` | Agrega temas a tu lista de favoritos para rotar. Los que ya tienes aparecen pre-seleccionados |
| `Smart Theme: Set Workspace Theme` | Asigna un tema al proyecto que tienes abierto |
| `Smart Theme: Manage Workspace Themes` | Gestiona todos los temas asignados a tus proyectos: cambiar, eliminar o agregar nuevos |
| `Smart Theme: Set Language Theme` | Asigna un tema a un lenguaje específico (escribe el ID del lenguaje, ej: `javascript`, `python`) |
| `Smart Theme: Manage Language Themes` | Gestiona todos los mapeos de lenguaje a tema: cambiar, eliminar o agregar nuevos |
| `Smart Theme: List All Themes` | Muestra todos los temas detectados de todas las extensiones instaladas |

### Configuración de Modos

Cuando ejecutas **Set Mode**, puedes elegir múltiples modos:

1. **Selecciona uno o varios** modos (workspace, favorites, time, language)
2. Si elegiste **favorites**, te preguntará:
   - `manual` → cambia solo con el comando "Change Theme Now"
   - `auto` → rota automáticamente cada cierto tiempo
   - Luego eliges la unidad: horas, días, semanas o meses
   - Y escribes el número (ej: cada 2 horas, cada 3 días)
3. Si elegiste **time**, te pedirá que elijas 3 temas: mañana, tarde y noche

### Configuración (Settings)

| Setting | Tipo | Default | Descripción |
|---|---|---|---|
| `smartTheme.enabled` | boolean | `true` | Activa o desactiva la extensión |
| `smartTheme.enabledModes` | array | `["workspace"]` | Modos activos: workspace, favorites, time, language |
| `smartTheme.favorites` | array | `["Default Dark+", "Default Light+", "Abyss"]` | Lista de temas favoritos |
| `smartTheme.favoritesRotation` | string | `"manual"` | Rotación manual o automática |
| `smartTheme.favoritesIntervalUnit` | string | `"hours"` | Unidad de tiempo para auto-rotación |
| `smartTheme.favoritesIntervalValue` | number | `1` | Cada cuántas unidades cambia |
| `smartTheme.workspaceThemes` | object | `{}` | Mapa de proyectos a temas |
| `smartTheme.languageThemes` | object | `{}` | Mapa de lenguajes a temas |
| `smartTheme.morningTheme` | string | `"Default Light+"` | Tema de la mañana |
| `smartTheme.afternoonTheme` | string | `"Default Dark+"` | Tema de la tarde |
| `smartTheme.nightTheme` | string | `"Abyss"` | Tema de la noche |
| `smartTheme.enableNotification` | boolean | `true` | Mostrar notificación al cambiar tema |

### Ejemplos de uso

**Tema diferente por proyecto:**
1. Ejecuta `Smart Theme: Set Mode` → selecciona `workspace`
2. Abre tu proyecto de React → ejecuta `Smart Theme: Set Workspace Theme` → elige un tema oscuro
3. Abre tu proyecto de Python → ejecuta `Smart Theme: Set Workspace Theme` → elige un tema claro

**Temas por lenguaje:**
1. Ejecuta `Smart Theme: Set Mode` → selecciona `language`
2. Abre un archivo `.js` → ejecuta `Smart Theme: Set Language Theme` → escribe `javascript` → elige un tema oscuro
3. Abre un archivo `.py` → ejecuta `Smart Theme: Set Language Theme` → escribe `python` → elige un tema claro
4. Ahora cada vez que cambies entre archivos, el tema cambiará automáticamente

**Rotación automática de favoritos cada 2 horas:**
1. Ejecuta `Smart Theme: Add Favorite` → selecciona tus temas favoritos
2. Ejecuta `Smart Theme: Set Mode` → selecciona `favorites`
3. Elige `auto` → selecciona `hours` → escribe `2`

---

## English 🇬🇧

### What does it do?

Smart Theme Switcher lets you automatically change the Visual Studio Code theme using different modes that you can combine:

| Mode | What it does |
|---|---|
| **Workspace** | Each project gets its own theme. When you open a project, the theme applies automatically |
| **Time** | Changes the theme based on time of day (morning, afternoon, night) using real sunrise/sunset data |
| **Favorites** | Rotates through your favorite themes manually (with command) or automatically (on a time interval) |
| **Language** | Changes the theme based on the language of the file you're editing (JavaScript = dark, Python = light, etc.) |

### Commands

Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `Smart Theme`:

| Command | Description |
|---|---|
| `Smart Theme: Change Theme Now` | Switch to the next available theme based on the active mode. In favorites mode, cycles to the next favorite |
| `Smart Theme: Enable/Disable` | Enable or disable the extension |
| `Smart Theme: Set Mode` | Configure which modes you want to use (you can select multiple at the same time) |
| `Smart Theme: Add Favorite` | Add themes to your favorites list for rotation. Currently saved favorites appear pre-checked |
| `Smart Theme: Set Workspace Theme` | Assign a theme to your currently open project |
| `Smart Theme: Manage Workspace Themes` | Manage all project-theme mappings: change, remove, or add new ones |
| `Smart Theme: Set Language Theme` | Assign a theme to a specific language (enter the language ID, e.g. `javascript`, `python`) |
| `Smart Theme: Manage Language Themes` | Manage all language-to-theme mappings: change, remove, or add new ones |
| `Smart Theme: List All Themes` | Shows all detected themes from all installed extensions |

### Mode Configuration

When you run **Set Mode**, you can choose multiple modes:

1. **Select one or more** modes (workspace, favorites, time, language)
2. If you chose **favorites**, you'll be asked:
   - `manual` → change only with the "Change Theme Now" command
   - `auto` → rotate automatically on a time interval
   - Then pick the unit: hours, days, weeks, or months
   - And enter the number (e.g. every 2 hours, every 3 days)
3. If you chose **time**, you'll pick 3 themes: morning, afternoon, and night

### Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `smartTheme.enabled` | boolean | `true` | Enable or disable the extension |
| `smartTheme.enabledModes` | array | `["workspace"]` | Active modes: workspace, favorites, time, language |
| `smartTheme.favorites` | array | `["Default Dark+", "Default Light+", "Abyss"]` | List of favorite themes |
| `smartTheme.favoritesRotation` | string | `"manual"` | Manual or automatic rotation |
| `smartTheme.favoritesIntervalUnit` | string | `"hours"` | Time unit for auto-rotation |
| `smartTheme.favoritesIntervalValue` | number | `1` | How many units between changes |
| `smartTheme.workspaceThemes` | object | `{}` | Map of projects to themes |
| `smartTheme.languageThemes` | object | `{}` | Map of language IDs to themes |
| `smartTheme.morningTheme` | string | `"Default Light+"` | Morning theme |
| `smartTheme.afternoonTheme` | string | `"Default Dark+"` | Afternoon theme |
| `smartTheme.nightTheme` | string | `"Abyss"` | Night theme |
| `smartTheme.enableNotification` | boolean | `true` | Show notification when theme changes |

### Usage Examples

**Different theme per project:**
1. Run `Smart Theme: Set Mode` → select `workspace`
2. Open your React project → run `Smart Theme: Set Workspace Theme` → pick a dark theme
3. Open your Python project → run `Smart Theme: Set Workspace Theme` → pick a light theme

**Themes by language:**
1. Run `Smart Theme: Set Mode` → select `language`
2. Open a `.js` file → run `Smart Theme: Set Language Theme` → type `javascript` → pick a dark theme
3. Open a `.py` file → run `Smart Theme: Set Language Theme` → type `python` → pick a light theme
4. Now every time you switch between files, the theme changes automatically

**Auto-rotate favorites every 2 hours:**
1. Run `Smart Theme: Add Favorite` → select your favorite themes
2. Run `Smart Theme: Set Mode` → select `favorites`
3. Choose `auto` → select `hours` → enter `2`

### Language IDs

Common VS Code language IDs you can use:

| Lenguaje | Language ID |
|---|---|
| JavaScript | `javascript` |
| TypeScript | `typescript` |
| Python | `python` |
| HTML | `html` |
| CSS | `css` |
| JSON | `json` |
| Markdown | `markdown` |
| Java | `java` |
| C++ | `cpp` |
| Rust | `rust` |
| Go | `go` |
| PHP | `php` |

> Tip: You can find the language ID of any file by clicking the language indicator in the bottom-right status bar of VS Code.

---

## Requirements / Requerimientos

- Visual Studio Code 1.118.0 or higher

## Known Issues / Problemas Conocidos

- Some theme extensions (like Doki Theme) use internal IDs that may not match their display names. The extension attempts to resolve these automatically, but if a theme doesn't apply, try selecting the version with the alphanumeric ID in the favorites picker.

- Alguna extensión de temas (como Doki Theme) usa IDs internos que pueden no coincidir con sus nombres visibles. La extensión intenta resolverlos automáticamente, pero si un tema no se aplica, prueba seleccionando la versión con el ID alfanumérico en el selector de favoritos.

## Release Notes / Notas de Versión

### 0.0.1

- Initial release / Lanzamiento inicial
- Workspace, Time, Favorites, and Language modes / Modos Workspace, Time, Favorites y Language
- Multi-mode support (combine modes) / Soporte multi-modo (combina modos)
- Favorites rotation with custom intervals / Rotación de favoritos con intervalos personalizados
- Language-based theme switching / Cambio de tema por lenguaje



---

**Enjoy! / ¡Disfruta!**
