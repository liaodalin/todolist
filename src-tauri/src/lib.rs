mod commands;
mod models;
mod storage;
mod tray;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            tray::create_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_data,
            commands::save_data,
            commands::set_mini_mode,
            commands::set_full_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
