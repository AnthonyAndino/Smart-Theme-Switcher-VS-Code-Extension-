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
		const currentTheme = config.get<string>("workbench.coloTheme");

		const newTheme = getThemeByHour();

		console.log("Tema actual:", currentTheme);
		console.log("Tema esperado:", newTheme);

		if (currentTheme === newTheme) {
			console.log("Tema ya aplicado, no se hace nada");
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
}

export function deactivate() {}