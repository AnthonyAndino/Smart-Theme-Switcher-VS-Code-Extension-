import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("Smart Theme Switcher ACTIVADO");

	let autoEnabled = true;

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
			const settings = vscode.workspace.getConfiguration("smartTheme");
			const showNotification = settings.get<boolean>("enableNotification") ?? true;

			if (showNotification) {
				vscode.window.showInformationMessage(`Theme changed to ${newTheme}`);
			}
		
		} catch (error) {
			console.log("Error aplicando tema:", error);
		}
	}

    // Ejecutar al iniciar
    if (autoEnabled) {
		applyTheme();
	}

	//intervarlo inteligente (cada 5 minutos)
	const interval = setInterval(() => {
		if (!autoEnabled) return;

		console.log("Revisando cambio de tema");
		applyTheme();
	}, 10 * 1000);

	//limpieza al desactivar
	context.subscriptions.push({
		dispose: () => clearInterval(interval)
	});

	//comando: cambiar tema manualmente
	const changeNowCommand = vscode.commands.registerCommand(
		"smartTheme.changeNow",
		async () => {
			console.log("Cambio manual ejecutado");
			await applyTheme();
		}
	);

	//comando: activar / desactivar automatico
	const toggleAutoCommand = vscode.commands.registerCommand(
		"smartTheme.toggleAuto",
		() => {
			autoEnabled = !autoEnabled;

			vscode.window.showInformationMessage(
				`Auto Theme ${autoEnabled ? "Enabled" : "Disabled"}`
			);
		}
	);

	context.subscriptions.push(changeNowCommand, toggleAutoCommand);
}

export function deactivate() {}