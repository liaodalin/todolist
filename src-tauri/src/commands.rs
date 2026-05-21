use crate::models::AppData;

// Window dimensions
const MINI_WIDTH: f64 = 320.0;
const MINI_HEIGHT: f64 = 480.0;
const FULL_WIDTH: f64 = 800.0;
const FULL_HEIGHT: f64 = 600.0;

#[tauri::command]
pub fn load_data() -> AppData {
    crate::storage::load()
}

#[tauri::command]
pub fn save_data(data: AppData) -> Result<(), String> {
    crate::storage::save(&data)
}

#[tauri::command]
pub fn set_mini_mode(window: tauri::Window) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: MINI_WIDTH,
        height: MINI_HEIGHT,
    })).map_err(|e| e.to_string())?;
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    window.set_decorations(false).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_full_mode(window: tauri::Window) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: FULL_WIDTH,
        height: FULL_HEIGHT,
    })).map_err(|e| e.to_string())?;
    window.set_always_on_top(false).map_err(|e| e.to_string())?;
    window.set_decorations(true).map_err(|e| e.to_string())?;
    Ok(())
}
