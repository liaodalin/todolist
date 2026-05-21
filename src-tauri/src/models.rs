use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub category: String,
    #[serde(rename = "dueDate")]
    pub due_date: Option<String>,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "completedAt")]
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    #[serde(rename = "isDefault")]
    pub is_default: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Settings {
    pub theme: String,
    pub layout: String,
    pub mode: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppData {
    pub tasks: Vec<Task>,
    pub categories: Vec<Category>,
    pub settings: Settings,
}
