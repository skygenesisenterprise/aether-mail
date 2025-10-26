#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email() {
        assert!(crate::utils::validate_email("test@example.com"));
        assert!(!crate::utils::validate_email("invalid"));
    }
}