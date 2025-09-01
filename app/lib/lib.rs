use wasm_bindgen::prelude::*;

// Cette annotation expose la fonction à JavaScript/TypeScript via WASM
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! 👋", name)
}

// Tu pourras ajouter ici d'autres fonctions de cryptographie ou utilitaires