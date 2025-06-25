# Pizarra Colaborativa

**Descripción**  
Esta aplicación permite a múltiples usuarios añadir, editar y eliminar “notas” en una pizarra compartida en tiempo real. Está construida con React y Firebase (Realtime Database, Authentication y Hosting).

---

## 1. Integrantes

| Nombre                       | Rol / Contribución                  |
|------------------------------|-------------------------------------|
| Jaime Nina Vargas            | Desarrollo frontend, Firebase setup |
| Miguel Angel Odrillas        | Diseño de UX, validación de reglas  |


## 2. Tecnologías utilizadas
### - FONTEND
- **React:** Una librería de JavaScript para construir interfaces de usuario
- **JavaScript (ES6+) y Hooks:** Para la lógica del componente y la gestión de estado
- **Tailwind CSS:** Un framework CSS de utilidad para un diseño rápido y responsivo
- **Lucide React:** Para iconos ligeros y personalizables
- **React Router DOM:** Para el enrutamiento en la aplicación de una sola página
- **React Toastify:** Para notificaciones toast elegantes
### - BACKEND
- **Firebase Realtime Database:** Base de datos NoSQL en tiempo real para la sincronización de datos
- **Firebase Authentication:** Para la gestión de usuarios (Email/Contraseña)
- **Firebase Hosting:** Para desplegar la aplicación web de forma segura y rápida
### - HERRAMIENTAS DE DESARROLLO
- **Node.js & npm (Node Package Manager):** Entorno de ejecución y gestor de paquetes
- **Firebase CLI:** Herramienta de línea de comandos para interactuar con Firebase
- **Visual Studio Code:** Editor de código

---

## 3. Requisitos previos

- Antes de comenzar, asegúrate de tener instalados los siguientes elementos:
- **Node.js** (versión LTS recomendada) y npm
- Una cuenta de Google para acceder a la **Consola de Firebase**
- **Firebase CLI** instalado globalmente:
  ```bash
  npm install -g firebase-tools
- Instala las dependencias de React y Tailwind CSS para el proyecto:
  ```bash
  npm install lucide-react
  npm install -D tailwindcss@3
  npx tailwindcss init -p
- (Asegúrate de configurar tailwind.config.js y postcss.config.js para incluir tus archivos React y las directivas de Tailwind si aún no lo has hecho.)
- archivo tailwind.config.js
```bash
content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
```
## 4. Configuración en Firebase Console
- Accede a Firebase Console.
- Crea un proyecto llamado pizarra-colaborativa (o tu nombre de proyecto).
- En Authentication > Método de inicio de sesión, habilita Correo/Contraseña.
- En Realtime Database, haz clic en Crear base de datos, elige modo Prueba y tu región.
- En Configuración del proyecto > Tus aplicaciones, agrega una app web y copia las credenciales.

## 5. Variables de entorno
En la raíz de frontend/, crea un archivo .env.local con:
```bash
REACT_APP_FIREBASE_API_KEY=tu_apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_authDomain
REACT_APP_FIREBASE_DATABASE_URL=tu_databaseURL
REACT_APP_FIREBASE_PROJECT_ID=tu_projectId
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messagingSenderId
REACT_APP_FIREBASE_APP_ID=tu_appId
```
- **Importante:** Nunca subas .env.local a tu repositorio público.

## 6. Cómo ejecutar localmente

- Clona el repositorio:
```bash
git clone <tu_repo_URL>
cd pizarra-colaborativa/frontend
```
- Instala dependencias del proyecto:
```bash
npm install
```
- Inicia la app en modo desarrollo:
```bash
npm start
```
- Abre **http://localhost:3000** en tu navegador.


## 7. Reglas de seguridad de Realtime Database
- Este documento describe las reglas de seguridad de Firebase Realtime Database configuradas para la aplicación. Estas reglas controlan el acceso (quién puede leer y escribir) y la estructura (qué datos son válidos) de los datos en tu base de datos.
### Ubicacion de las reglas
- Archivo: database.rules.json
### Explicacion de las reglas
- auth != null: Esta condición base significa que solo los usuarios que han iniciado sesión (autenticados) tienen permiso para realizar la operación. Es la primera línea de defensa para toda tu base de datos.
- data.exists(): Referencia a los datos existentes en la ubicación actual. Es útil para diferenciar entre una nueva creación (cuando !data.exists() es true) y una actualización/eliminación (cuando data.exists() es true)
- newData.exists(): Referencia a los datos que se intentan escribir en la ubicación actual
- newData.child('nombreCampo').val(): Permite acceder al valor de un campo específico (nombreCampo) dentro de los nuevos datos que se están intentando escribir en la base de datos
- auth.uid: Representa el ID único del usuario que está autenticado actualmente
- auth.token.email: Representa el correo electrónico del usuario autenticado, obtenido de su token de autenticación de Firebase
- $roomId / $noteId: Son variables de ruta (comodines). Indican que la regla se aplica a cualquier ID de sala o nota en esa ubicación, permitiendo reglas dinámicas que se ajustan a cada elemento.

## 8. Despliegue

- Construye tu app:
```bash
npm run build
```
- Despliega Hosting y Database:
```bash
firebase deploy --only hosting,database
```
- URL pública:
```bash
https://pizarra-colaborativa-jamez.web.app
```
## 9. Recursos adicionales

- **React:** documentacion oficial **https://es.reactjs.org/**
- **Firebase Realtime Database:** Guía oficial para Realtime Database **https://firebase.google.com/docs/database**
- **Firebase Auth:** Guía oficial para Firebase Authentication **https://firebase.google.com/docs/auth**
- **Firebase Hosting:** Guía oficial para Firebase Hosting **https://firebase.google.com/docs/hosting**
- **Tailwind CSS:** Documentación oficial de Tailwind CSS **https://tailwindcss.com/**
