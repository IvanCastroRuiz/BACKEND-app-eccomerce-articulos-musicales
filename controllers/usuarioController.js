import Usuario from "../models/Usuario.js";
import generarJWT from "../helper/generarJWT.js";
import generarId from "../helper/generarId.js";
import emailRegistro from "../helper/emailRegistro.js";
//import emailOlvidePassword from "../helper/emailOlvidePassword.js";

const registrar = async (req, res)=>{

    const { nombre, email, password, telefono, direccion, web } = req.body;

    // Validar usuario duplicado
    // findOne busca por los diferentes atributos de la coleccion
    const existeUsuario = await Usuario.findOne({email});

    if(existeUsuario){
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg: error.message});
    };

    try {

        const usuario = new Usuario(req.body);
        const usuarioGuardado = await  usuario.save();

        // Enviar el email
        emailRegistro({
            email,
            nombre, 
            token: usuarioGuardado.token
        });
        
        res.json(usuarioGuardado);
        
    } catch (error) {
        console.error(error.message);
    };
    
};

const perfil = (req, res)=>{

    //Extraemos los datos del usuario almacenado en el servidor de nodejs
    //console.log(req.usuario);

    const { usuario } = req;
    try{
        res.status(200).json({
            usuario
        });

    } catch (error) {
        return res.status(404).json({
            status: 'error',
            error: error.message
        });
    }
};

const confirmar = async (req, res)=>{

    // req.params para leer datos de la URL, en este caso token por que asi lo definimos en la ruta

    const { token } = req.params;
    const usuarioConfirmar = await Usuario.findOne({token});
    // console.log(usuarioConfirmar);
    // console.log(token);
    if(!usuarioConfirmar){
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message});
    };

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();
        res.json({
            msg: "Usuario confirmado correctamente"
        });
    } catch (error) {
        console.error(error.message);    
    }
};

const auntenticar = async (req, res)=>{

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({email});

    if(!usuario){
        const error = new Error("Usuario no existe");
        return res.status(403).json({msg: error.message});
    };

    // Comprobar si el usuario esta confirmado o no
    if(!usuario.confirmado){
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    // Aumtemticar el usuario
    // Revisar el password si es correcto
    if( await usuario.comprobarPassword(password)){

        // Auntenticar JWT 
        // https://jwt.io/

        res.json({ 
            token: generarJWT(usuario._id),
            msg: "Usuario auntenticado"    
        });

    }else{
        const error = new Error("el password es incorrecto");
        return res.status(403).json({msg: error.message});
    }
};

const olvidePassword = async (req, res) =>{
    const { email } = req.body; 

    const existeUsuario = await Usuario.findOne({email});

    if(!existeUsuario){
        const error = new Error('El usuario no existe');
        return res.status(400).json({
            status: 'error',
            msg: error.message
        });
    };

    try {
        existeUsuario.token = generarId()
        await existeUsuario.save();

        // Enviar email con Instrucciones
        // emailOlvidePassword({
        //     email,
        //     nombre: existeUsuario.nombre,
        //     token: existeUsuario.token
        // });

        res.json({msg: "Hemos enviado un email con las instrucciones"});    

    } catch (error) {
        return res.status(404).json({
            status: 'error',
            error: error.message
        });
    }
};

const comprobarToken = async (req, res) =>{
    const { token } = req.params;
    
    const tokenValido = await Usuario.findOne({token});

    if(tokenValido){
        res.json({msg: "Usuario valido"});
    }else{
        const error = new Error('Token no valido');
        return res.status(400).json({
            status: 'error',
            msg: error.message
        });
    }

};

const nuevoPassword = async (req, res) =>{
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({token});
    if(!usuario){
        const error = new Error('Hubo un error');
        return res.status(400).json({
            status: 'error',
            msg: error.message
        });
    };

    try {
        usuario.token = null;
        usuario.password = password;
        await usuario.save(); 
        res.json({msg: "Password modificado correctamente"});       
    } catch (error) {
        console.log("error: ", error.message);
        return res.status(404).json({
            status: 'error',
            error: error.message
        });
    };
};

export {
    registrar,
    perfil,
    confirmar,
    auntenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword
};