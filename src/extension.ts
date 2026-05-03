import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("Smart Theme Switcher ACTIVADO");

    function getThemeByHour(): string {
        const hour = new Date().getHours();

        console.log("Hora actual:", hour);

        if (hour >= 6 && hour < 12) {
            return 'Default Light+';
        } else if (hour >= 12 && hour < 18) {
            return 'Default Dark+';
        } else {
            return 'Abyss';
        }
    }

    async function applyTheme() {
        const theme = getThemeByHour();

        console.log("Tema seleccionado:", theme);

        try {
            await vscode.workspace.getConfiguration().update(
                "workbench.colorTheme",
                theme,
                vscode.ConfigurationTarget.Global
            );

            console.log("Tema aplicado correctamente ✅");

        } catch (error) {
            console.error("Error aplicando tema:", error);
        }
    }

    // Ejecutar al iniciar
    applyTheme();

    // Opcional: re-evaluar cada 5 minutos
    setInterval(() => {
        applyTheme();
    }, 5 * 60 * 1000);
}

export function deactivate() {}