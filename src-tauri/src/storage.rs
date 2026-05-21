use crate::models::AppData;
use std::fs;
use std::path::PathBuf;

fn get_data_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("todolist-widget");
    fs::create_dir_all(&path).ok();
    path.push("data.json");
    path
}

pub fn load() -> AppData {
    let path = get_data_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppData::default()
    }
}

pub fn save(data: &AppData) -> Result<(), String> {
    let path = get_data_path();
    let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}
