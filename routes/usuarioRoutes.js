import express from 'express';
import { 
    registrar, 
    perfil, 
    confirmar,
    auntenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    usuarioRegistrados,
    actualizarPerfil,
    actualizarPassword
} from '../controllers/usuarioController.js';

// middleware para validar el token
import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();  


// Rutas Publicas
router.post('/', registrar );
router.get('/confirmar/:token', confirmar);
router.post('/login', auntenticar);
router.post('/olvide-password', olvidePassword);
router.get('/olvide-password:token', comprobarToken);
router.get('/lista-usuarios', usuarioRegistrados);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);   



// Rutas Protegidas atraves del middleware checkAuth
// Identificamos el usuario y se identifica para mostrale los datos o funcionalidades que le corresponden.
router.get('/perfil', checkAuth , perfil);
router.put("/perfil/:id", checkAuth, actualizarPerfil);
router.put("/actualizar-password", checkAuth, actualizarPassword);


export default router;