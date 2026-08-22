#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{
  CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
  window
    .set_always_on_top(always_on_top)
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn quit_app(app_handle: tauri::AppHandle) {
  app_handle.exit(0);
}

fn main() {
  // System Tray Menu Setup
  let show = CustomMenuItem::new("show".to_string(), "Show Companion");
  let hide = CustomMenuItem::new("hide".to_string(), "Hide Companion");
  let focus = CustomMenuItem::new("focus".to_string(), "Start 25m Focus");
  let open_web = CustomMenuItem::new("open_web".to_string(), "Open Web Workspace");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit Desktop Pet");

  let tray_menu = SystemTrayMenu::new()
    .add_item(show)
    .add_item(hide)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(focus)
    .add_item(open_web)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

  let system_tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        "show" => {
          if let Some(window) = app.get_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
          }
        }
        "hide" => {
          if let Some(window) = app.get_window("main") {
            let _ = window.hide();
          }
        }
        "focus" => {
          if let Some(window) = app.get_window("main") {
            let _ = window.show();
            let _ = window.emit("start-focus-session", ());
          }
        }
        "open_web" => {
          let _ = tauri::api::shell::open(&app.shell_scope(), "http://localhost:5173", None);
        }
        "quit" => {
          std::process::exit(0);
        }
        _ => {}
      },
      SystemTrayEvent::LeftClick { .. } => {
        if let Some(window) = app.get_window("main") {
          let _ = window.show();
          let _ = window.set_focus();
        }
      }
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![toggle_always_on_top, quit_app])
    .run(tauri::generate_context!())
    .expect("error while running productivity pet desktop application");
}
