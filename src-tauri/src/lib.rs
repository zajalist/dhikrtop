mod commands;
mod idle;

#[cfg(test)]
mod tests;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // ── Ensure GTK initialization on Linux ──────────────────────────
            #[cfg(target_os = "linux")]
            {
                std::thread::sleep(std::time::Duration::from_millis(200));
            }

            // ── Check if first install and show setup ────────────────────────
            let store = tauri_plugin_store::StoreBuilder::new(app, "app-state.json")
                .build()?;
            
            let is_first_install = !store
                .get("setupCompleted")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            if is_first_install {
                // Show setup window on first install
                if let Some(setup_window) = app.get_webview_window("setup") {
                    let _ = setup_window.show();
                    let _ = setup_window.set_focus();
                }
            } else {
                // On subsequent launches, hide all windows initially
                // They will be shown from JS or user interaction
                if let Some(adhkar_window) = app.get_webview_window("adhkar") {
                    let _ = adhkar_window.hide();
                }
                if let Some(settings_window) = app.get_webview_window("settings") {
                    let _ = settings_window.hide();
                }
            }

            // ── System Tray ────────────────────────────────────────────────
            let show_settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Dhikrtop", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_settings, &sep, &quit])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .tooltip("Dhikrtop — Islamic Remembrances")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("adhkar") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                // Position at top-center
                                if let Ok(Some(monitor)) = window.primary_monitor() {
                                    let screen = monitor.size();
                                    let scale = monitor.scale_factor();
                                    let w = 440.0_f64;
                                    let x = ((screen.width as f64 / scale) - w) / 2.0;
                                    let _ = window.set_position(tauri::LogicalPosition { x, y: 0.0 });
                                }
                                let _ = window.show();
                                let _ = app.emit("trigger-adhkar", ());
                            }
                        }
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "settings" => {
                        if let Some(window) = app.get_webview_window("settings") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // ── Idle Monitor ───────────────────────────────────────────────
            idle::start(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::show_adhkar,
            commands::hide_adhkar,
            commands::open_settings,
            commands::get_preferences,
            commands::save_preferences,
            commands::is_first_install,
            commands::mark_setup_complete,
            commands::get_startup_status,
            commands::set_startup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running dhikrtop");
}
