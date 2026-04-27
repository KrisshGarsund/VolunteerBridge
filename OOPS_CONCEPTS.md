# Object-Oriented Programming (OOP) Concepts in VolunteerBridge

VolunteerBridge's backend is heavily structured around Object-Oriented Programming principles. This architectural choice makes the codebase modular, scalable, and easy to maintain. Below is a breakdown of the core OOP concepts utilized throughout the project, along with the specific files and classes where they are implemented.

## 1. Classes and Objects
At the heart of the platform, the data entities and business logic are represented as classes and instantiated as objects.
- **Models:** Entities are defined as classes. When a user registers, an object of the corresponding class is instantiated in memory before being serialized and saved to the MongoDB database.
  - `User` class defined in `backend/models/user.py`
  - `Volunteer` class defined in `backend/models/volunteer.py`
  - `NGO` class defined in `backend/models/ngo.py`
  - `Admin` class defined in `backend/models/admin.py`
  - `HelpRequest` class defined in `backend/models/help_request.py`
- **Controllers & Services:** Classes are instantiated as objects to process HTTP requests and execute business logic.
  - `AuthController` in `backend/controllers/auth_controller.py`
  - `NGOService` in `backend/services/ngo_service.py`
  - `AdminService` in `backend/services/admin_service.py`

## 2. Inheritance
Inheritance is used to avoid code duplication by extracting shared attributes into a base class.
- **The `User` Base Class (`backend/models/user.py`):** The parent `User` class defines common properties shared by everyone on the platform (e.g., `name`, `email`, `password_hash`, `created_at`, `is_active`) and common methods (e.g., `set_password`, `check_password`).
- **Subclasses:** The portal-specific user roles inherit from the `User` class to add their own specialized fields.
  - `Volunteer(User)` in `backend/models/volunteer.py` adds specific fields like `skills` and `bio`.
  - `NGO(User)` in `backend/models/ngo.py` adds fields like `organization_name`, `description`, and `is_verified`.
  - `Admin(User)` in `backend/models/admin.py` acts as a specialized administrator account.

## 3. Polymorphism
Polymorphism allows objects of different classes to be treated as objects of a common superclass, often executing overridden methods.
- **Dynamic Object Reconstruction (`backend/services/auth_service.py`):** In the `AuthService._reconstruct_user(doc, role)` method, the system reads a generic user document from the database and uses polymorphism to instantiate the correct specific subclass (`Volunteer`, `NGO`, or `Admin`) at runtime based on the `role` field.
- **Method Overriding (`backend/models/ngo.py`, `backend/models/volunteer.py`):** Subclasses override the `to_dict()` and `to_safe_dict()` methods of the parent `User` class to ensure that their specific attributes (like an NGO's `is_verified` status or a Volunteer's `skills`) are correctly serialized alongside the base attributes.

## 4. Encapsulation
Encapsulation involves bundling data and methods that operate on that data within a single unit, restricting direct access to some of the object's components.
- **Data Hiding (`backend/models/user.py`):** Sensitive data, such as a user's password, is hidden. The `User` class stores a `password_hash` rather than the plain-text password. The plain-text password can only be verified externally using the `check_password` method.
- **Private Variables (`backend/db_admin.py`):** The singleton database classes (e.g., `AdminDatabase`) use private instance variables like `_client_admin` and `_db_admin` to prevent external modules from accidentally overriding or corrupting the database connections. These are accessed safely via `@property` decorators.
- **Separation of Concerns:** The application encapsulates HTTP request handling inside **Controllers** (e.g., `backend/controllers/ngo_controller.py`), and complex business logic inside **Services** (e.g., `backend/services/ngo_service.py`).

## 5. Abstraction
Abstraction means hiding complex implementation details and showing only the essential features of the object.
- **Service Layer Abstraction (`backend/controllers/ngo_controller.py`):** The Controllers don't need to know *how* a help request is saved to MongoDB. They simply call `self._service.create_request()`. The complex database queries, schema enforcement, and error handling are abstracted away inside the `NGOService` class (`backend/services/ngo_service.py`).
- **Database Abstraction (`backend/db_volunteer.py`):** The backend logic rarely interacts with PyMongo directly. Instead, it interacts with the Singleton Database classes (like `VolunteerDatabase` or `NGODatabase`) which abstract the complexity of establishing multi-database URIs, resolving environment variables, and returning correct collections.

## 6. Common OOP Design Patterns Used
- **Singleton Pattern (`backend/db_admin.py`, `backend/db_ngo.py`, `backend/db_volunteer.py`):** Used heavily for the database connections. The `__new__` method is overridden in classes like `AdminDatabase` to ensure that only *one* instance of the database connection class is ever created per server process, preventing memory leaks and connection exhaustion.
- **Factory Pattern (`backend/volunteer_server.py`, `backend/routes/ngo_routes.py`):** Used in Flask application and Blueprint creation. Functions like `create_volunteer_app()` and `create_ngo_blueprint(db)` dynamically construct and configure application objects with the necessary dependencies (like the specific database instance) before returning them to the server.
