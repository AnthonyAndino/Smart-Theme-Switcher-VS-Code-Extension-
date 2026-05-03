import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("Smart Theme Switcher ACTIVADO");

    function getThemeByHour(): string {
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 12) {
            return 'Default Light+';
        } else if (hour >= 12 && hour < 18) {
            return 'Default Dark+';
        } else {
            return 'Abyss';
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
		
		} catch (error) {
			console.log("Error aplicando tema:", error);
		}
	}

    // Ejecutar al iniciar
    applyTheme();

	//intervarlo inteligente (cada 5 minutos)
	const interval = setInterval(() => {
		console.log("Revisando cambio de tema");
		applyTheme();
	}, 5 * 60 * 1000);

	//limpieza al desactivar
	context.subscriptions.push({
		dispose: () => clearInterval(interval)
	});
}

export function deactivate() {}