import * as vscode from 'vscode';

type SunriseResponse = {
	results: {
		sunrise: string;
		sunset: string;
	};
};

export function activate(context: vscode.ExtensionContext) {

	console.log("Smart Theme Switcher ACTIVADO");

	let favoriteIndex = context.globalState.get<number>("favoriteIndex", 0);
	let autoInterval: ReturnType<typeof setInterval> | undefined;

	function getSettings() {
		return vscode.workspace.getConfiguration("smartTheme");
	}

	function getEnabledModes(): string[] {
		const s = getSettings();
		const modes = s.get<string[]>("enabledModes");
		if (modes && modes.length > 0) return modes;
		const oldMode = s.get<string>("mode");
		if (oldMode && oldMode !== "disabled") return [oldMode];
		return ["workspace"];
	}

	function getIntervalMs(): number {
		const s = getSettings();
		const unit = s.get<string>("favoritesIntervalUnit") || "hours";
		const value = s.get<number>("favoritesIntervalValue") || 1;

		switch (unit) {
			case "hours": return value * 60 * 60 * 1000;
			case "days": return value * 24 * 60 * 60 * 1000;
			case "weeks": return value * 7 * 24 * 60 * 60 * 1000;
			case "months": return value * 30 * 24 * 60 * 60 * 1000;
			default: return value * 60 * 60 * 1000;
		}
	}

	function restartAutoInterval() {
		if (autoInterval) clearInterval(autoInterval);

		const modes = getEnabledModes();
		const rotation = getSettings().get<string>("favoritesRotation") || "manual";

		if (modes.includes("favorites") && rotation === "auto") {
			autoInterval = setInterval(() => applyTheme(), getIntervalMs());
		}
	}

	async function getAllThemes(): Promise<string[]> {
		const themes: string[] = [];

		for (const ext of vscode.extensions.all) {
			const contributes = ext.packageJSON?.contributes;
			if (!contributes?.themes) continue;

			const isDoki = ext.id.toLowerCase().includes('doki');

			for (const t of contributes.themes) {
				if (t.label) themes.push(t.label);
				if (isDoki && t.id) themes.push(t.id);
			}
		}

		return themes;
	}

	async function getWorkspaceTheme(): Promise<string | null> {
		const s = getSettings();
		const map = s.get<Record<string, string>>("workspaceThemes") || {};
		const folderName = vscode.workspace.workspaceFolders?.[0]?.name;

		if (!folderName) return null;
		if (map[folderName]) return map[folderName];

		const favorites = s.get<string[]>("favorites") || [];
		if (favorites.length === 0) return null;

		const keys = Object.keys(map);
		const theme = favorites[keys.length % favorites.length];
		map[folderName] = theme;
		await s.update("workspaceThemes", map, vscode.ConfigurationTarget.Global);

		return theme;
	}

	async function getThemeByTime(): Promise<string | null> {
		const s = getSettings();
		const morning = s.get<string>("morningTheme") || "";
		const afternoon = s.get<string>("afternoonTheme") || "";
		const night = s.get<string>("nightTheme") || "";

		if (!morning && !afternoon && !night) return null;

		try {
			const response = await fetch(
				`https://api.sunrise-sunset.org/json?lat=14.0723&lng=-87.1921&formatted=0`
			);
			const data = await response.json() as SunriseResponse;
			const sunrise = new Date(data.results.sunrise);
			const sunset = new Date(data.results.sunset);
			const now = new Date();

			if (now >= sunrise && now < sunset) {
				if (morning) return morning;
				if (night) return night;
				return null;
			}
			return night || morning || null;
		} catch {
			const hour = new Date().getHours();
			if (hour >= 6 && hour < 12) return morning || "Default Light+";
			if (hour >= 12 && hour < 18) return afternoon || "Default Dark+";
			return night || "Abyss";
		}
	}

	function getLanguageTheme(): string | null {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return null;

		const langId = editor.document.languageId;
		const s = getSettings();
		const map = s.get<Record<string, string>>("languageThemes") || {};

		return map[langId] || null;
	}

	async function onLanguageChange(): Promise<void> {
		const modes = getEnabledModes();
		if (!modes.includes("language")) return;

		const theme = getLanguageTheme();
		if (theme) {
			await setThemeDirect(theme, true);
		}
	}

	async function setThemeDirect(name: string, silent = false) {
		const config = vscode.workspace.getConfiguration();
		const current = config.get<string>("workbench.colorTheme") || "";

		const candidates = resolveThemeId(name);
		
		for (const candidate of candidates) {
			if (candidate === current) {
				const s = getSettings();
				if (!silent && (s.get<boolean>("enableNotification") ?? true)) {
					vscode.window.showInformationMessage(`Theme is already: ${name}`);
				}
				return;
			}
		}

		const target = candidates[0];
		await config.update("workbench.colorTheme", target, vscode.ConfigurationTarget.Global);

		const s = getSettings();
		if (!silent && (s.get<boolean>("enableNotification") ?? true)) {
			vscode.window.showInformationMessage(`Theme changed to ${name}`);
		}
	}

	function resolveThemeId(name: string): string[] {
		const candidates: string[] = [name];

		for (const ext of vscode.extensions.all) {
			const contributes = ext.packageJSON?.contributes;
			if (!contributes?.themes) continue;

			const isDoki = ext.id.toLowerCase().includes('doki');

			for (const t of contributes.themes) {
				const label = t.label || '';
				const id = t.id || '';

				if (label === name || id === name) {
					candidates.push(label);
					if (isDoki && id) candidates.push(id);
					if (isDoki) candidates.push(`${ext.id}.${label.replace(/\s+/g, '-').toLowerCase()}`);
					if (isDoki && id) candidates.push(`${ext.id}.${id.replace(/\s+/g, '-').toLowerCase()}`);
				}
			}
		}

		return [...new Set(candidates.filter(Boolean))];
	}

	async function applyTheme(forceTheme?: string) {
		const s = getSettings();
		if (!(s.get<boolean>("enabled") ?? true)) return;

		const modes = getEnabledModes();
		if (modes.length === 0 || (modes.length === 1 && modes[0] === "disabled")) return;

		if (forceTheme) {
			await setThemeDirect(forceTheme);
			return;
		}

		if (modes.includes("favorites")) {
			const rotation = s.get<string>("favoritesRotation") || "manual";
			const favorites = s.get<string[]>("favorites") || [];

			if (favorites.length > 0) {
				if (rotation === "auto") {
					const lastChange = context.globalState.get<number>("favoriteLastChange") || 0;
					if (Date.now() - lastChange >= getIntervalMs()) {
						favoriteIndex = (favoriteIndex + 1) % favorites.length;
						context.globalState.update("favoriteIndex", favoriteIndex);
						context.globalState.update("favoriteLastChange", Date.now());
						await setThemeDirect(favorites[favoriteIndex]);
						return;
					}
				}
			}
		}

		if (modes.includes("workspace")) {
			const workspaceTheme = await getWorkspaceTheme();
			if (workspaceTheme) {
				await setThemeDirect(workspaceTheme);
				return;
			}
		}

		if (modes.includes("time")) {
			const timeTheme = await getThemeByTime();
			if (timeTheme) {
				await setThemeDirect(timeTheme);
				return;
			}
		}

		if (modes.includes("language")) {
			const langTheme = getLanguageTheme();
			if (langTheme) {
				await setThemeDirect(langTheme);
				return;
			}
		}
	}

	applyTheme();
	restartAutoInterval();

	vscode.workspace.onDidChangeWorkspaceFolders(() => applyTheme());

	vscode.window.onDidChangeActiveTextEditor(() => onLanguageChange());

	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration("smartTheme.enabledModes") ||
			e.affectsConfiguration("smartTheme.favoritesRotation") ||
			e.affectsConfiguration("smartTheme.favoritesIntervalUnit") ||
			e.affectsConfiguration("smartTheme.favoritesIntervalValue")) {
			restartAutoInterval();
		}
	});

	// -------------------------------
	// COMMAND: CHANGE NOW
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.changeNow", async () => {
			const s = getSettings();
			const enabled = s.get<boolean>("enabled") ?? true;

			if (!enabled) {
				vscode.window.showInformationMessage("Smart Theme is disabled");
				return;
			}

			const modes = getEnabledModes();

			if (modes.includes("favorites")) {
				const favorites = s.get<string[]>("favorites") || [];
				if (favorites.length === 0) {
					vscode.window.showWarningMessage("No favorites configured. Use Add Favorite first.");
					return;
				}
				favoriteIndex = (favoriteIndex + 1) % favorites.length;
				context.globalState.update("favoriteIndex", favoriteIndex);
				context.globalState.update("favoriteLastChange", Date.now());
				await setThemeDirect(favorites[favoriteIndex]);
				return;
			}

			if (modes.includes("workspace")) {
				const theme = await getWorkspaceTheme();
				if (theme) {
					await setThemeDirect(theme);
					return;
				}
			}

			if (modes.includes("time")) {
				const theme = await getThemeByTime();
				if (theme) {
					await setThemeDirect(theme);
					return;
				}
			}

			if (modes.includes("language")) {
				const theme = getLanguageTheme();
				if (theme) {
					await setThemeDirect(theme);
					return;
				}
			}

			vscode.window.showWarningMessage("No active mode could resolve a theme");
		})
	);

	// -------------------------------
	// COMMAND: TOGGLE
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.toggle", async () => {
			const s = getSettings();
			const current = s.get<boolean>("enabled") ?? true;
			await s.update("enabled", !current, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`Smart Theme ${!current ? "Enabled" : "Disabled"}`);
		})
	);

	// -------------------------------
	// COMMAND: SET MODE
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.setMode", async () => {
			const s = getSettings();
			const currentModes = s.get<string[]>("enabledModes") || [];

			const modePick = await vscode.window.showQuickPick(
				[
					{ label: "workspace", description: "Theme per project", detail: "Each project gets its own theme", picked: currentModes.includes("workspace") },
					{ label: "favorites", description: "Rotate favorite themes", detail: "Manual or automatic rotation", picked: currentModes.includes("favorites") },
					{ label: "time", description: "Theme by time of day", detail: "Uses sunrise/sunset or fixed hours", picked: currentModes.includes("time") },
					{ label: "language", description: "Theme by file language", detail: "JavaScript=dark, Python=light, etc.", picked: currentModes.includes("language") },
				],
				{
					placeHolder: "Select modes (you can pick multiple)",
					canPickMany: true,
				}
			);

			if (!modePick) return;
			if (modePick.length === 0) {
				vscode.window.showInformationMessage("No modes selected — extension disabled");
				await s.update("enabledModes", ["disabled"], vscode.ConfigurationTarget.Global);
				return;
			}

			const selected = modePick.map(m => m.label);
			await s.update("enabledModes", selected, vscode.ConfigurationTarget.Global);

			if (selected.includes("favorites")) {
				const rotationPick = await vscode.window.showQuickPick(
					[
						{ label: "manual", description: "Change only with command", detail: "Use 'Change Theme Now' to cycle" },
						{ label: "auto", description: "Auto-rotate on interval", detail: "Themes change automatically" },
					],
					{ placeHolder: "How should favorites rotate?" }
				);

				if (rotationPick) {
					await s.update("favoritesRotation", rotationPick.label, vscode.ConfigurationTarget.Global);

					if (rotationPick.label === "auto") {
						const unitPick = await vscode.window.showQuickPick(
							[
								{ label: "hours", description: "Every N hours" },
								{ label: "days", description: "Every N days" },
								{ label: "weeks", description: "Every N weeks" },
								{ label: "months", description: "Every N months" },
							],
							{ placeHolder: "Choose time unit" }
						);

						if (unitPick) {
							await s.update("favoritesIntervalUnit", unitPick.label, vscode.ConfigurationTarget.Global);

							const valueInput = await vscode.window.showInputBox({
								placeHolder: "Enter a number",
								prompt: `How many ${unitPick.label}?`,
								validateInput: (val) => {
									const n = parseInt(val);
									if (isNaN(n) || n < 1) return "Enter a positive number";
									return null;
								}
							});

							if (valueInput) {
								await s.update("favoritesIntervalValue", parseInt(valueInput), vscode.ConfigurationTarget.Global);
							}
						}

						restartAutoInterval();
					}
				}
			}

			if (selected.includes("time")) {
				await pickTimeThemes();
			}

			const modeDesc = selected.join(" + ");
			vscode.window.showInformationMessage(`Active modes: ${modeDesc}`);
			await applyTheme();
		})
	);

	// -------------------------------
	// PICK TIME THEMES
	// -------------------------------
	async function pickTimeThemes() {
		const s = getSettings();
		const allThemes = await getAllThemes();

		if (allThemes.length === 0) {
			vscode.window.showWarningMessage("No themes found");
			return;
		}

		const morning = await vscode.window.showQuickPick(allThemes, {
			placeHolder: "Select morning theme (6am - 12pm)",
		});
		if (morning) await s.update("morningTheme", morning, vscode.ConfigurationTarget.Global);

		const afternoon = await vscode.window.showQuickPick(allThemes, {
			placeHolder: "Select afternoon theme (12pm - 6pm)",
		});
		if (afternoon) await s.update("afternoonTheme", afternoon, vscode.ConfigurationTarget.Global);

		const night = await vscode.window.showQuickPick(allThemes, {
			placeHolder: "Select night theme (6pm - 6am)",
		});
		if (night) await s.update("nightTheme", night, vscode.ConfigurationTarget.Global);
	}

	// -------------------------------
	// COMMAND: ADD FAVORITES
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.addFavorite", async () => {
			const s = getSettings();
			const currentFavorites = s.get<string[]>("favorites") || [];
			const allThemes = await getAllThemes();

			if (allThemes.length === 0) {
				vscode.window.showWarningMessage("No themes found from installed extensions");
				return;
			}

			const items = allThemes.map(t => ({
				label: t,
				description: "",
				picked: currentFavorites.includes(t)
			}));

			items.unshift({
				label: "$(clear-all) Clear All Favorites",
				description: `${currentFavorites.length} currently saved`,
				picked: false
			});

			const selected = await vscode.window.showQuickPick(items, {
				canPickMany: true,
				placeHolder: "Select favorite themes (currently selected will be pre-checked)"
			});

			if (!selected || selected.length === 0) return;

			const hasClear = selected.some(s => s.label === "$(clear-all) Clear All Favorites");
			if (hasClear) {
				await s.update("favorites", [], vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage("All favorites cleared");
				return;
			}

			const labels = selected.map(s => s.label);
			await s.update("favorites", labels, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`Favorites updated: ${labels.length} themes`);
		})
	);

	// -------------------------------
	// COMMAND: SET WORKSPACE THEME
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.setWorkspaceTheme", async () => {
			const s = getSettings();
			const folderName = vscode.workspace.workspaceFolders?.[0]?.name;

			if (!folderName) {
				vscode.window.showWarningMessage("No workspace folder open");
				return;
			}

			const allThemes = await getAllThemes();

			const selected = await vscode.window.showQuickPick(allThemes, {
				placeHolder: `Select theme for "${folderName}"`
			});

			if (!selected) return;

			const map = s.get<Record<string, string>>("workspaceThemes") || {};
			map[folderName] = selected;
			await s.update("workspaceThemes", map, vscode.ConfigurationTarget.Global);
			await setThemeDirect(selected);
		})
	);

	// -------------------------------
	// COMMAND: MANAGE WORKSPACE THEMES
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.manageWorkspaceThemes", async () => {
			const s = getSettings();
			const map = s.get<Record<string, string>>("workspaceThemes") || {};
			const entries = Object.entries(map);
			const allThemes = await getAllThemes();

			const config = vscode.workspace.getConfiguration();
			const currentGlobalTheme = config.get<string>("workbench.colorTheme") || "";

			const items: { label: string; description: string; detail: string; project: string | null; theme: string | null }[] = entries.map(([project, theme]) => {
				const isCurrent = theme === currentGlobalTheme;
				return {
					label: `${isCurrent ? "$(check) " : ""}$(paintcan) ${project}`,
					description: theme,
					detail: isCurrent ? "Currently active" : "Click to change or remove",
					project,
					theme
				};
			});

			if (items.length === 0) {
				items.push({
					label: "$(plus) No workspace themes configured",
					description: "Click to add one",
					detail: "",
					project: null,
					theme: null
				});
			}

			const picked = await vscode.window.showQuickPick(items, {
				placeHolder: "Select a project to manage its theme",
			});

			if (!picked) return;

			if (!picked.project) {
				const projectPick = await vscode.window.showInputBox({
					placeHolder: "Project folder name",
					value: vscode.workspace.workspaceFolders?.[0]?.name || "",
					prompt: "Name of the project folder"
				});

				if (!projectPick) return;

				const themePick = await vscode.window.showQuickPick(allThemes, {
					placeHolder: `Select theme for "${projectPick}"`
				});

				if (!themePick) return;

				map[projectPick] = themePick;
				await s.update("workspaceThemes", map, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`"${projectPick}" → ${themePick}`);
				return;
			}

			const actions = await vscode.window.showQuickPick([
				{ label: "$(edit) Change theme", action: "change" as const },
				{ label: "$(trash) Remove project", action: "remove" as const },
			], {
				placeHolder: `Manage "${picked.project}" → ${picked.theme}`
			});

			if (!actions) return;

			if (actions.action === "change") {
				const newTheme = await vscode.window.showQuickPick(allThemes, {
					placeHolder: `New theme for "${picked.project}"`
				});

				if (!newTheme) return;

				map[picked.project] = newTheme;
				await s.update("workspaceThemes", map, vscode.ConfigurationTarget.Global);

				if (vscode.workspace.workspaceFolders?.[0]?.name === picked.project) {
					await setThemeDirect(newTheme);
				}

				vscode.window.showInformationMessage(`"${picked.project}" → ${newTheme}`);
			} else {
				delete map[picked.project];
				await s.update("workspaceThemes", map, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`Removed "${picked.project}"`);
			}
		})
	);

	// -------------------------------
	// COMMAND: SET LANGUAGE THEME
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.setLanguageTheme", async () => {
			const s = getSettings();
			const map = s.get<Record<string, string>>("languageThemes") || {};

			const editor = vscode.window.activeTextEditor;
			const currentLang = editor?.document.languageId;

			const langPick = await vscode.window.showInputBox({
				placeHolder: "Enter language ID (e.g. javascript, python, typescript, html)",
				value: currentLang || "",
				prompt: "VS Code language ID to map a theme to"
			});

			if (!langPick) return;

			const allThemes = await getAllThemes();

			const themePick = await vscode.window.showQuickPick(allThemes, {
				placeHolder: `Select theme for "${langPick}"`
			});

			if (!themePick) return;

			map[langPick] = themePick;
			await s.update("languageThemes", map, vscode.ConfigurationTarget.Global);

			const entries = Object.entries(map);
			vscode.window.showInformationMessage(`"${langPick}" → ${themePick} (${entries.length} languages mapped)`);

			if (vscode.window.activeTextEditor?.document.languageId === langPick) {
				await setThemeDirect(themePick);
			}
		})
	);

	// -------------------------------
	// COMMAND: MANAGE LANGUAGE THEMES
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.manageLanguageThemes", async () => {
			const s = getSettings();
			const map = s.get<Record<string, string>>("languageThemes") || {};
			const entries = Object.entries(map);

			const items: { label: string; description: string; detail: string; lang: string | null }[] = entries.map(([lang, theme]) => ({
				label: `$(code) ${lang}`,
				description: theme,
				detail: "Click to change or remove",
				lang
			}));

			if (items.length === 0) {
				items.push({
					label: "$(plus) No language themes configured",
					description: "Click to add one",
					detail: "",
					lang: null
				});
			}

			const picked = await vscode.window.showQuickPick(items, {
				placeHolder: "Select a language to manage its theme",
			});

			if (!picked) return;

			const allThemes = await getAllThemes();

			if (!picked.lang) {
				const langInput = await vscode.window.showInputBox({
					placeHolder: "Enter language ID",
					prompt: "VS Code language ID (javascript, python, typescript, etc.)"
				});

				if (!langInput) return;

				const themePick = await vscode.window.showQuickPick(allThemes, {
					placeHolder: `Select theme for "${langInput}"`
				});

				if (!themePick) return;

				map[langInput] = themePick;
				await s.update("languageThemes", map, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`"${langInput}" → ${themePick}`);
				return;
			}

			const actions = await vscode.window.showQuickPick([
				{ label: "$(edit) Change theme", action: "change" as const },
				{ label: "$(trash) Remove language", action: "remove" as const },
			], {
				placeHolder: `Manage "${picked.lang}" → ${picked.description}`
			});

			if (!actions) return;

			if (actions.action === "change") {
				const newTheme = await vscode.window.showQuickPick(allThemes, {
					placeHolder: `New theme for "${picked.lang}"`
				});

				if (!newTheme) return;

				map[picked.lang] = newTheme;
				await s.update("languageThemes", map, vscode.ConfigurationTarget.Global);

				if (vscode.window.activeTextEditor?.document.languageId === picked.lang) {
					await setThemeDirect(newTheme);
				}

				vscode.window.showInformationMessage(`"${picked.lang}" → ${newTheme}`);
			} else {
				delete map[picked.lang];
				await s.update("languageThemes", map, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`Removed "${picked.lang}"`);
			}
		})
	);

	// -------------------------------
	// COMMAND: LIST ALL THEMES
	// -------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand("smartTheme.listThemes", async () => {
			const themes = await getAllThemes();

			if (themes.length === 0) {
				vscode.window.showWarningMessage("No themes found from any installed extension");
				return;
			}

			const picked = await vscode.window.showQuickPick(themes, {
				placeHolder: `All detected themes (${themes.length})`,
			});

			if (picked) {
				await setThemeDirect(picked);
			}
		})
	);
}

export function deactivate() {}
