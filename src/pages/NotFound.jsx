import { Link } from 'react-router-dom';
import gif404 from '/404.gif'; // Asegúrate de tener tu GIF en la carpeta assets

const NotFound = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-center text-orange-700">Página no Encontrada</h1>
      <img src={gif404} alt="404 animation" className="w-128 h-128 mt-1" />
      <p className="text-xl text-gray-600 mt-1">Parece que estás perdido</p>
      <p className="text-md text-gray-500">¡La página que estás buscando no está disponible!</p>
      <Link to="/" className="mt-5 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition duration-300">
        Ir al Inicio
      </Link>
    </div>
  );
};

export default NotFound;
