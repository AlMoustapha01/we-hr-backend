# WE-HR API

## 📋 Description

**WE-HR API** est une API REST moderne de gestion des ressources humaines (Human Resources Management System) développée pour QUANTECH. Cette solution backend permet de gérer efficacement les employés, les départements et leurs affectations au sein d'une organisation.

### Fonctionnalités principales

- **Gestion des employés** : Création, modification, suppression et consultation des profils employés avec gestion des statuts (actif, en congé, terminé)
- **Gestion des départements** : Organisation hiérarchique avec attribution de managers et gestion des équipes
- **Affectations** : Système d'affectation flexible des employés aux départements avec historique
- **Validation métier** : Règles métier strictes (unicité des managers, validation des affectations, etc.)
- **API RESTful** : Interface standardisée avec documentation Swagger/OpenAPI

## 🛠️ Stack Technique

### Backend Framework & Runtime

- **NestJS 11** - Framework Node.js progressif pour applications scalables
- **TypeScript 5.7** - Typage statique et fonctionnalités ES modernes
- **Node.js** - Runtime JavaScript côté serveur

### Base de données & ORM

- **PostgreSQL** - Base de données relationnelle robuste
- **TypeORM 0.3** - ORM TypeScript avec support des migrations
- **typeorm-transactional** - Gestion des transactions avec décorateurs

### Validation & Transformation

- **class-validator** - Validation déclarative des DTOs
- **class-transformer** - Transformation et sérialisation des objets
- **Zod** - Validation de schémas TypeScript-first

### Gestion des erreurs & Résultats

- **oxide.ts** - Pattern Result/Option pour gestion fonctionnelle des erreurs (Rust-like)

### Documentation & API

- **Swagger/OpenAPI** - Documentation interactive de l'API

### Outils de développement

- **ESLint** - Linting et analyse statique du code
- **Prettier** - Formatage automatique du code
- **Husky** - Git hooks pour qualité du code
- **Jest** - Framework de tests unitaires et e2e
- **pnpm** - Gestionnaire de paquets performant

### Utilitaires

- **uuid v7** - Génération d'identifiants uniques
- **helmet** - Sécurisation des headers HTTP
- **cookie-parser** - Parsing des cookies
- **nestjs-request-context** - Contexte de requête global

## 🏗️ Architecture

Le projet suit une **architecture hexagonale (ports & adapters)** combinée aux principes du **Domain-Driven Design (DDD)** et **Clean Architecture**.

### Structure des dossiers

```
src/
├── app/                          # Couche application
│   ├── domain/                   # Couche domaine (logique métier)
│   │   ├── employee.ts           # Entité Employee (Aggregate Root)
│   │   ├── department.ts         # Entité Department
│   │   ├── employee-assignment.ts # Entité d'affectation
│   │   ├── *.errors.ts           # Erreurs métier spécifiques
│   │   ├── *.repository.port.ts  # Interfaces des repositories (ports)
│   │   └── *.domain-service.ts   # Services domaine
│   │
│   ├── infrasctucture/           # Couche infrastructure (adapters)
│   │   ├── *.entity.db.ts        # Entités ORM TypeORM
│   │   └── *.repository.ts       # Implémentations des repositories
│   │
│   ├── mappers/                  # Mappers Domain ↔ Persistence
│   │   └── *.mapper.ts           # Conversion entités domaine/DB
│   │
│   ├── presentation/             # Couche présentation
│   │   ├── controllers/          # Contrôleurs REST
│   │   └── dtos/                 # Data Transfer Objects
│   │
│   └── use-cases/                # Cas d'usage (Application Services)
│       ├── create-*/             # Création d'entités
│       ├── update-*/             # Mise à jour
│       ├── delete-*/             # Suppression
│       └── */                    # Autres opérations métier
│
├── config/                       # Configuration de l'application
│   ├── app-config.ts             # Configuration générale
│   └── app-config.type.ts        # Types de configuration
│
├── database/                     # Configuration base de données
│   ├── config/                   # Config TypeORM
│   ├── migrations/               # Migrations SQL
│   └── *.ts                      # DataSource et factories
│
├── libs/                         # Bibliothèques réutilisables
│   ├── api/                      # Utilitaires API (pagination, filtres)
│   ├── application/              # Base pour use cases
│   ├── db/                       # Utilitaires base de données
│   ├── domain/                   # Classes de base domaine
│   │   ├── aggregate-root.ts     # Base pour aggregates
│   │   ├── base-entity.ts        # Entité de base
│   │   ├── repository.port.ts    # Interface repository générique
│   │   └── value-objects/        # Value Objects (Slug, etc.)
│   └── exceptions/               # Exceptions personnalisées
│
└── main.ts                       # Point d'entrée de l'application
```

### Principes architecturaux

#### 1. **Séparation des couches**

- **Domain Layer** : Logique métier pure, indépendante de toute infrastructure
  - Entités avec comportements métier
  - Value Objects immuables
  - Interfaces de repositories (ports)
  - Erreurs métier typées

- **Application Layer** : Orchestration des cas d'usage
  - Handlers de commandes/requêtes (CQRS-like)
  - Coordination entre domaine et infrastructure
  - Gestion des transactions

- **Infrastructure Layer** : Implémentation technique
  - Repositories concrets (TypeORM)
  - Entités de persistence
  - Mappers pour conversion

- **Presentation Layer** : Interface externe
  - Contrôleurs REST
  - DTOs de validation
  - Gestion des erreurs HTTP

#### 2. **Domain-Driven Design**

- **Aggregates** : `EmployeeEntity` est un Aggregate Root
- **Entities** : `DepartmentEntity`, `EmployeeAssignmentEntity`
- **Value Objects** : `Slug` pour les URLs SEO-friendly
- **Domain Services** : `DepartmentDomainService` pour logique multi-entités
- **Repository Pattern** : Abstraction de la persistence

#### 3. **Gestion fonctionnelle des erreurs**

Utilisation d'**oxide.ts** pour un style fonctionnel :

```typescript
// Retour de Result<T, Error> au lieu d'exceptions
const result: Result<Employee, EmployeeNotFoundError> =
  await repository.findById(id);

return match(result, {
  Ok: (employee) => /* succès */,
  Err: (error) => /* gestion erreur */
});
```

#### 4. **Dependency Injection**

- Injection via tokens (`EMPLOYEE_REPOSITORY`, `DEPARTMENT_REPOSITORY`)
- Inversion de dépendances (domaine ne dépend pas de l'infrastructure)
- Testabilité facilitée

#### 5. **CQRS-like Pattern**

- Séparation commandes (write) et requêtes (read)
- Handlers dédiés par cas d'usage
- Commands/Queries explicites

### Flux de données typique

```
HTTP Request
    ↓
Controller (Presentation)
    ↓
DTO Validation
    ↓
Use Case Handler (Application)
    ↓
Domain Service / Entity (Domain)
    ↓
Repository Port (Domain Interface)
    ↓
Repository Implementation (Infrastructure)
    ↓
TypeORM Entity (Infrastructure)
    ↓
PostgreSQL Database
```

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
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
