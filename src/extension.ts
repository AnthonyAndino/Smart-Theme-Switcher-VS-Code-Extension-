import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("Smart Theme Switcher ACTIVADO");

	const settings = vscode.workspace.getConfiguration("smartTheme");

	let autoEnabled = context.globalState.get<boolean>("autoEnabled", true);

    function getThemeByHour(): string {
		const config = vscode.workspace.getConfiguration("smartTheme");

		const morning = config.get<string>("morningTheme") || "Default Light+";
		const afternoon = config.get<string>('afternoonTheme') || "Default Dark+";
		const night = config.get<string>("nightTheme") || "Abyss";

        const hour = new Date().getHours();

        if (hour >= 6 && hour < 12) {
            return morning;
        } else if (hour >= 12 && hour < 18) {
            return afternoon;
        } else {
            return night;
        }
    }

    async function applyTheme() {

		//validar si esta desactivado desde settings
		const enabledFromSettings = settings.get<boolean>("enabled") ?? true;
		if (!enabledFromSettings || !autoEnabled) {
			console.log("Extension desactivada");
			return;
		}

		const config = vscode.workspace.getConfiguration();
		const currentTheme = config.get<string>("workbench.colorTheme") || "";
		const newTheme = getThemeByHour();

		console.log("Tema actual:", currentTheme);
		console.log("Tema esperado:", newTheme);

		if (currentTheme === newTheme) {
			console.log("Sin cambios necesarios");
			return;
		}

		try {
			await config.update(
				"workbench.colorTheme",
				newTheme,
				vscode.ConfigurationTarget.Global
			);

			console.log("Tema actualizado correctamente");

			//notificacion
			const showNotification = settings.get<boolean>("enableNotification") ?? true;

			if (showNotification) {
				vscode.window.showInformationMessage(`Theme changed to ${newTheme}`);
			}
		
		} catch (error) {
			console.log("Error aplicando tema:", error);
		}
	}

    // Ejecutar solo si esta habilitado
    if (settings.get<boolean>("enabled")) {
        applyTheme();
    }

	//intervarlo solo si esta activo
	let interval: NodeJS.Timeout | undefined;

	if (autoEnabled) {
		interval = setInterval(() => {
			applyTheme();
		}, 5 * 60 * 1000);

		context.subscriptions.push({
			dispose: () => interval && clearInterval(interval)
		});
	}

	//comando: cambiar tema manualmente
	const changeNowCommand = vscode.commands.registerCommand(
		"smartTheme.changeNow",
		async () => {
			console.log("Cambio manual ejecutado");
			await applyTheme();
		}
	);

	//comando toggle persistente
	const toggleAutoCommand = vscode.commands.registerCommand(
		"smartTheme.toggleAuto",
		async () => {
			autoEnabled = !autoEnabled;

			await context.globalState.update("autoEnabled", autoEnabled);

			vscode.window.showInformationMessage(
				`Auto Theme ${autoEnabled ? "Enabled" : "Disabled"}`
			);

			console.log("AutoTheme:", autoEnabled);
		}
	);

	context.subscriptions.push(changeNowCommand, toggleAutoCommand);
}

export function deactivate() {}