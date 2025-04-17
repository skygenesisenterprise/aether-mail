# Aether Mail Open-Source client

Aether Mail is an open-source email client developed by Sky Genesis Enterprise. It aims to provide a secure, efficient, and user-friendly email experience. This repository contains the source code for Aether Mail, allowing developers to contribute, customize, and deploy their own instances.

## Features

- **Secure Communication**: End-to-end encryption ensures your emails are secure.
- **User-Friendly Interface**: Intuitive design for easy navigation and usage.
- **Customizable**: Easily extend and customize the client to fit your needs.
- **Cross-Platform**: Available on multiple platforms including Windows, macOS, and Linux.

## Installation

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Git

### Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/Sky-Genesis-Enterprise/aether-mail-os.git
    cd aether-mail
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Build the Project**

    ```bash
    npm run build
    ```

4. **Run the Application**

    ```bash
    npm start
    ```

### Using the Installation Script

For a quick and easy installation, you can use the provided `install.sh` script. This script will handle the installation of dependencies, building the project, and setting up the service.

```bash
sudo bash install.sh
```

## Configuration

Configuration files are located in the `config` directory. You can customize the settings according to your needs.

- `config/default.json`: Default configuration settings.
- `config/production.json`: Production-specific configuration settings.

## Contributing

We welcome contributions from the community! If you'd like to contribute to Aether Mail, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -am 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

Aether Mail is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any questions or support, please contact us at support@skygenesisenterprise.com.
