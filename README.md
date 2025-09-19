<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://img.shields.io/nestjs/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Ecommerce API Template** es una API RESTful construida con [NestJS](https://github.com/nestjs/nest) que sigue una arquitectura Domain-Driven Design (DDD) para aplicaciones de comercio electrónico. Proporciona una base sólida y escalable para gestionar usuarios, autenticación, productos y categorías.

### 🏗️ Arquitectura

Este proyecto implementa una arquitectura DDD flexible con las siguientes características:

- **Domain-Driven Design**: Separación clara entre dominio, aplicación e infraestructura
- **Módulos Desacoplados**: Cada módulo (auth, users, products) es independiente y reutilizable
- **Value Objects**: Validaciones robustas y lógica de negocio encapsulada
- **Repositories**: Abstracción de la capa de datos para mejor testabilidad
- **Services**: Servicios de dominio y aplicación para coordinar la lógica de negocio
- **JWT Authentication**: Sistema de autenticación robusto con refresh tokens
- **Role-Based Access Control**: Gestión de permisos por roles (SUPERADMIN, ADMIN, CLIENTE)

### 📦 Módulos Principales

#### 🔐 Módulo de Autenticación
Gestiona la autenticación de usuarios con JWT, incluyendo:
- Registro y login de usuarios
- Refresh tokens para sesiones prolongadas
- Logout y gestión de sesiones
- Validación de credenciales y seguridad

**Documentación detallada**: [docs/auth.md](docs/auth.md)

#### 👥 Módulo de Usuarios
Gestiona la información y perfiles de usuarios:
- Gestión de perfiles de usuario
- CRUD de usuarios con control de acceso
- Búsqueda y filtrado de usuarios
- Gestión de roles y permisos

**Documentación detallada**: [docs/users.md](docs/users.md)

#### 🛒 Módulo de Productos
Gestiona el catálogo de productos e inventario:
- Gestión completa de productos (CRUD)
- Control de inventario y stock
- Categorías y organización de productos
- Búsqueda y filtrado avanzado
- SEO optimizado con slugs y metadatos

**Documentación detallada**: [docs/products.md](docs/products.md)

### 🚀 Características Clave

- **TypeScript**: Tipado estático para mejor desarrollo y mantenimiento
- **PostgreSQL**: Base de datos robusta y escalable
- **Drizzle ORM**: ORM moderno y type-safe
- **Swagger/OpenAPI**: Documentación automática de la API
- **Class Validator**: Validaciones robustas de datos de entrada
- **Environment Configuration**: Gestión segura de variables de entorno
- **Error Handling**: Manejo centralizado de errores
- **Logging**: Sistema de logging estructurado

### 📚 Documentación

Para obtener información detallada sobre los endpoints y su uso, consulta la documentación completa en la carpeta `docs/`:

- [Documentación General](docs/README.md)
- [Módulo de Autenticación](docs/auth.md)
- [Módulo de Usuarios](docs/users.md)
- [Módulo de Productos](docs/products.md)

### 🎯 Tecnologías Utilizadas

- **Backend**: NestJS, TypeScript, Node.js
- **Database**: PostgreSQL con Drizzle ORM
- **Authentication**: JWT con Passport.js
- **Validation**: Class Validator, Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Domain-Driven Design (DDD)
- **Testing**: Jest, Supertest

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
