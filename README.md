# Aether Mail Open-Source client

Aether Mail is an open-source email client developed by [Sky Genesis Enterprise](https://skygenesisenterprise.com). It aims to provide a secure, efficient, and user-friendly email experience. This repository contains the source code for Aether Mail, allowing developers to contribute, customize, and deploy their own instances.

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
    git clone https://github.com/Sky-Genesis-Enterprise/aether-mail.git
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
chmod +x install.sh
./install.sh

```

## Deployment with Docker

You can deploy Aether Mail using Docker for a containerized and consistent environment.

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, for multi-container setups)

### Steps

1. **Build the Docker Image**

    Clone the repository if you haven't already:

    ```bash
    git clone https://github.com/Sky-Genesis-Enterprise/aether-mail.git
    cd aether-mail
    ```

    Build the Docker image:

    ```bash
    docker build -t aether-mail .
    ```

2. **Run the Docker Container**

    Start the container using the built image:

    ```bash
    docker run -d -p 3000:3000 --name aether-mail aether-mail
    ```

    This will run the application and expose it on port `3000`. You can adjust the port mapping as needed.

3. **Using Docker Compose (Optional)**

    If you prefer using Docker Compose, a sample `docker-compose.yml` file is provided in the repository. To start the application, run:

    ```bash
    docker-compose up -d
    ```

    This will handle building the image and running the container.

### Configuration with Docker

You can pass custom configuration files or environment variables to the Docker container. For example:

```bash
docker run -d -p 3000:3000 -v $(pwd)/config:/app/config --name aether-mail aether-mail
```

This mounts your local `config` directory to the container's `/app/config` directory, allowing you to use custom configuration files.

For more advanced setups, refer to the Docker documentation or the `docker-compose.yml` file in the repository.

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

## Contact

For any questions or support, please contact us at support@skygenesisenterprise.com.

## License

Aether Mail is licensed under the AGPL-3.0 license. See the [LICENSE](LICENSE) file for more details.

