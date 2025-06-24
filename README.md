# Pizarra Colaborativa Simple

**Descripción**  
Esta aplicación permite a múltiples usuarios añadir, editar y eliminar “notas” en una pizarra compartida en tiempo real. Está construida con React y Firebase (Realtime Database, Authentication y Hosting).

---

## 1. Integrantes

| Nombre                       | Rol / Contribución                  |
|------------------------------|-------------------------------------|
| Jaime Nina Vargas            | Desarrollo frontend, Firebase setup |
| Miguel Angel Odrillas        | Diseño de UX, validación de reglas  |


## 2. Tecnologías utilizadas

- **React** (JavaScript, Hooks)  
- **Firebase**  
  - Realtime Database  
  - Authentication (Email/Password)  
  - Hosting  
- **Herramientas**  
  - Node.js & npm  
  - Firebase CLI  
  - Visual Studio Code  

---

## 3. Requisitos previos

- Tener **Node.js** (versión LTS recomendada) y **npm** instalados.  
- Cuenta de **Google** para acceder a Firebase.  
- Firebase CLI instalado globalmente:  
  ```bash
  npm install -g firebase-tools

## 4. Configuración en Firebase Console
- Accede a Firebase Console.
- Crea un proyecto llamado pizarra-colaborativa (o tu nombre de proyecto).
- En Authentication > Método de inicio de sesión, habilita Correo/Contraseña.
- En Realtime Database, haz clic en Crear base de datos, elige modo Prueba y tu región.
- En Configuración del proyecto > Tus aplicaciones, agrega una app web y copia las credenciales.

## 5. Variables de entorno
En la raíz de frontend/, crea un archivo .env.local con:

REACT_APP_FIREBASE_API_KEY=tu_apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_authDomain
REACT_APP_FIREBASE_DATABASE_URL=tu_databaseURL
REACT_APP_FIREBASE_PROJECT_ID=tu_projectId
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messagingSenderId
REACT_APP_FIREBASE_APP_ID=tu_appId
Importante: Nunca subas .env.local a tu repositorio público.

## 6. Cómo ejecutar localmente

- Clona el repositorio:

git clone <tu_repo_URL>
cd pizarra-colaborativa/frontend

- Instala dependencias:

npm install

- Inicia la app en modo desarrollo:

npm start

- Abre http://localhost:3000 en tu navegador.

## 7. Estructura de carpetas

frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # NoteItem.jsx, Navbar.jsx, etc.
│   ├── pages/           # Login.jsx, Register.jsx, Board.jsx
│   ├── services/        # auth.js, database.js
│   ├── styles/          # archivos CSS
│   ├── firebaseConfig.js
│   ├── App.js
│   └── index.js
├── .env.local
├── firebase.json
├── database.rules.json
├── package.json
└── README.md

## 8. Reglas de seguridad de Realtime Database

### Archivo: database.rules.json

{
  "rules": {
    "notes": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$noteId": {
        ".write": "(
          !data.exists() && newData.child('authorId').val() === auth.uid
        ) || (
          data.exists() && data.child('authorId').val() === auth.uid
        )",
        "content": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500"
        },
        "timestamp": {
          ".validate": "newData.isNumber() && newData.val() > 0"
        },
        "authorId": {
          ".validate": "(!data.exists() && newData.val() === auth.uid) || (data.exists() && newData.val() === data.val())"
        },
        "authorEmail": {
          ".validate": "(!data.exists() && newData.val() === auth.token.email) || (data.exists() && newData.val() === data.val())"
        }
      }
    }
  }
}

### Cada regla:

- .read / .write: solo usuarios autenticados.
- Creación: authorId y authorEmail deben coincidir con el usuario.
- Edición/Borrado: solo el autor original.
- Validaciones: content no vacío, máximo 500 caracteres; timestamp número positivo.

## 9. Despliegue

- Construye tu app:

npm run build

- Despliega Hosting y Database:

firebase deploy --only hosting,database

- URL pública:
https://<PROJECT_ID>.web.app
(Reemplaza <PROJECT_ID> por tu ID de proyecto)

## 10. Mejoras y puntos extra

- Múltiples salas (/rooms/{roomId}/notes).
- Modo offline con IndexedDB.
- Notificaciones en tiempo real (toasts).
- Mejora UI con “post-its” y colores.

## 11. Checklist para entrega

- Variables de entorno configuradas (.env.local).
- Reglas de security publicadas y verificadas.
- Rutas de React protegidas con React Router.
- CRUD de notas funcionando en tiempo real.
- Deploy exitoso en Firebase Hosting.
- README completo con todas las secciones.

## 12. Recursos adicionales

- React: https://es.reactjs.org/
- Firebase Realtime Database: https://firebase.google.com/docs/database
- Firebase Auth: https://firebase.google.com/docs/auth
- Firebase Hosting: https://firebase.google.com/docs/hosting
