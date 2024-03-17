require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(mongoUri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("panaderia");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

const dbPromise = connectDB();

//clientes connection

app.get('/api/cliente', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("clientes");
    const usuarios = await collection.find({}).toArray();
    res.json(usuarios);
});

app.delete('/api/clientedelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("clientes");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error.");
    }
});
app.put('/api/clienteactualizar/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("clientes");

        // Obtener datos actuales del cliente
        const clienteActual = await collection.findOne({ "_id": new ObjectId(id) });

        if (!clienteActual) {
            return res.status(404).send("Cliente no encontrado.");
        }

        // Combinar datos actuales con los datos proporcionados en la solicitud PUT
        const nuevosDatos = {
            cli_nombre: req.body.cli_nombre || clienteActual.cli_nombre,
            cli_apaterno: req.body.cli_apaterno || clienteActual.cli_apaterno,
            cli_amaterno: req.body.cli_amaterno || clienteActual.cli_amaterno,
            cli_direccion: req.body.cli_direccion || clienteActual.cli_direccion,
            cli_usuario: req.body.cli_usuario || clienteActual.cli_usuario,
            cli_contra: req.body.cli_contra || clienteActual.cli_contra,
            cli_correo: req.body.cli_correo || clienteActual.cli_correo,
            cli_telefono: req.body.cli_telefono || clienteActual.cli_telefono,
            cli_pregunta_secreta: req.body.cli_pregunta_secreta || clienteActual.cli_pregunta_secreta,
            cli_respuesta_secreta: req.body.cli_respuesta_secreta || clienteActual.cli_respuesta_secreta,
            fotoPerfil: req.body.fotoPerfil || clienteActual.fotoPerfil
        };

        // Actualizar cliente con los nuevos datos
        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: nuevosDatos }
        );
        
        if (result.matchedCount === 1) {
            res.status(200).send("Cliente actualizado correctamente.");
        } else {
            res.status(404).send("Cliente no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando cliente:", error);
        res.status(500).send("Error interno del servidor.");
    }
});



//Obtener un Cliente para el form login
    app.post('/api/clientes/login', async (req, res) => {
        try {
            const db = await dbPromise;
            const collection = db.collection("clientes");
    
            // Extraer usuario y contraseña del cuerpo de la solicitud
            const { cli_usuario, cli_contra } = req.body;
    
            // Consulta para encontrar un cliente con el usuario y la contraseña proporcionados
            const cliente = await collection.findOne({ cli_usuario: cli_usuario, cli_contra: cli_contra });
    
            if (cliente) {
                // Si se encuentra el cliente, responder con los detalles del cliente
                res.json(cliente);
            } else {
                // Si no se encuentra el cliente, responder con un mensaje de credenciales incorrectas
                res.status(401).json({ mensaje: 'Credenciales incorrectas' });
            }
        } catch (error) {
            console.error('Error al intentar buscar cliente:', error);
            res.status(500).json({ mensaje: 'Error en el servidor' });
        }
    });


 // Agregar nuevo cliente
app.post('/api/clientespost', async (req, res) => {
    try {
        const { cli_nombre, cli_apaterno, cli_amaterno, cli_direccion, cli_usuario, cli_contra, cli_correo, cli_telefono, cli_pregunta_secreta, cli_respuesta_secreta, fotoPerfil } = req.body;

        // Verificar que los campos requeridos estén presentes y en el formato correcto
        if (!cli_nombre || !cli_apaterno || !cli_amaterno || !cli_direccion || !cli_usuario || !cli_contra || !cli_correo || !cli_telefono || !cli_pregunta_secreta || !cli_respuesta_secreta) {
            return res.status(400).send("Todos los campos son requeridos y deben tener un valor válido.");
        }

        // Aquí podrías agregar más validaciones según tus necesidades, como verificar el formato del correo electrónico, el número de teléfono, etc.

        const db = await dbPromise;
        const collection = db.collection("clientes");

        // Crear un objeto con los campos obligatorios
        const clienteData = {
            cli_nombre,
            cli_apaterno,
            cli_amaterno,
            cli_direccion,
            cli_usuario,
            cli_contra,
            cli_correo,
            cli_telefono,
            cli_pregunta_secreta,
            cli_respuesta_secreta
        };

        // Agregar campos opcionales si están presentes en la solicitud
        if (fotoPerfil !== undefined) {
            clienteData.fotoPerfil = fotoPerfil;
        }

        const result = await collection.insertOne(clienteData);

        if (result.insertedCount === 1) {
            res.status(201).send("Cliente agregado correctamente.");
        } else {
            res.status(500).send("Error al agregar cliente.");
        }
    } catch (error) {
        console.error("Error agregando cliente:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


//empleados connectión

app.get('/api/empleados', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("empleados");
    const empleados = await collection.find({}).toArray();
    res.json(empleados);
});

app.delete('/api/empleadodelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("empleados");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("empleado not found.");
        }
    } catch (error) {
        console.error("Error deleting empleado:", error);
        res.status(500).send("Internal server error.");
    }
});

//Actualizar empleados
app.put('/api/empleadoactualizar/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    const { E_nombre, E_apaterno, E_amaterno, E_telefono, E_puesto, E_usuario, E_contra, E_usuarioTipo, E_correo, E_pregunta_secreta, E_respuesta_secreta, E_direccion } = req.body;
    
// Verificar que al menos un campo requerido esté presente
if (!E_nombre && !E_apaterno && !E_amaterno && !E_telefono && !E_puesto && !E_usuario && !E_contra && !E_usuarioTipo && !E_correo && !E_pregunta_secreta && !E_respuesta_secreta && !E_direccion) {
    return res.status(400).send("Se requiere al menos un campo para actualizar.");
}

    
    try {
        const db = await dbPromise;
        const collection = db.collection("empleados");
        
        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { 
                E_nombre, 
                E_apaterno, 
                E_amaterno, 
                E_telefono, 
                E_puesto, 
                E_usuario, 
                E_contra, 
                E_usuarioTipo, 
                E_correo, 
                E_pregunta_secreta, 
                E_respuesta_secreta, 
                E_direccion 
            }}
        );
        
        if (result.matchedCount === 1) {
            res.status(200).send("Empleado actualizado correctamente.");
        } else {
            res.status(404).send("Empleado no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando empleado:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

// Agregar nuevo empleado
app.post('/api/empleadospost', async (req, res) => {
    const { E_nombre, E_apaterno, E_amaterno, E_telefono, E_puesto, E_usuario, E_contra, E_usuarioTipo, E_correo, E_pregunta_secreta, E_respuesta_secreta, E_direccion } = req.body;

    // Verificar que los campos requeridos estén presentes
    if (!E_nombre || !E_apaterno || !E_amaterno || !E_telefono || !E_puesto || !E_usuario || !E_contra || !E_usuarioTipo || !E_correo || !E_pregunta_secreta || !E_respuesta_secreta || !E_direccion) {
        return res.status(400).send("Todos los campos son requeridos.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("empleados");

        const result = await collection.insertOne({
            E_nombre,
            E_apaterno,
            E_amaterno,
            E_telefono,
            E_puesto,
            E_usuario,
            E_contra,
            E_usuarioTipo,
            E_correo,
            E_pregunta_secreta,
            E_respuesta_secreta,
            E_direccion
        });

        if (result.insertedCount === 1) {
            res.status(201).send("Empleado agregado correctamente.");
        } else {
            res.status(500).send("Error al agregar empleado.");
        }
    } catch (error) {
        console.error("Error agregando empleado:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


app.post('/api/empleados/login', async (req, res) => {
    const { E_usuario, E_contra } = req.body;
    
    // Verificar que se proporcionen usuario y contraseña
    if (!E_usuario || !E_contra) {
        return res.status(400).send("El usuario y la contraseña son requeridos.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("empleados");
        
        const empleado = await collection.findOne({ E_usuario, E_contra });
        
        if (empleado) {
            // Empleado encontrado, enviar respuesta exitosa
            res.status(200).send("Inicio de sesión exitoso.");
        } else {
            // No se encontró el empleado, enviar respuesta de error
            res.status(404).send("Credenciales incorrectas.");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

//catalogo_productos connection

app.get('/api/catalogo', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("catalogo_productos");
        const catalogo = await collection.find({}).toArray();
        res.json(catalogo);
    } catch (error) {
        console.error("Error al obtener categoría productos:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


app.delete('/api/catalogodelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("catalogo_productos");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("Categoría no encontrada.");
        }
    } catch (error) {
        console.error("Error eliminando categoría:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


// Actualizar un producto del catálogo

app.put('/api/catalogoactualizar/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    const { nombre, categoria, tipo, precio, stock, costo, detalles, imgCortina } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("catalogo_productos");
        
        // Construir el objeto de actualización con los campos proporcionados
        let updateFields = {};
        if (nombre !== undefined) {
            updateFields.nombre = nombre;
        }
        if (categoria !== undefined) {
            updateFields.categoria = categoria;
        }
        if (tipo !== undefined) {
            updateFields.tipo = tipo;
        }
        if (precio !== undefined) {
            updateFields.precio = precio;
        }
        if (stock !== undefined) {
            updateFields.stock = stock;
        }
        if (costo !== undefined) {
            updateFields.costo = costo;
        }
        if (detalles !== undefined) {
            updateFields.detalles = detalles;
        }
        if (imgCortina !== undefined) {
            updateFields.imgCortina = imgCortina;
        }

        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: updateFields }
        );
        
        if (result.matchedCount === 1) {
            res.status(200).send("producto actualizado correctamente.");
        } else {
            res.status(404).send("producto no encontrada.");
        }
    } catch (error) {
        console.error("Error actualizando producto:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

//agregar catalogo_producto
app.post('/api/catalogopost', async (req, res) => {
    const { nombre, categoria, tipo, precio, stock, costo, detalles, imgCortina } = req.body;

    try {
        const db = await dbPromise;
        const collection = db.collection("catalogo_productos");

        const result = await collection.insertOne({
            nombre,
            categoria,
            tipo,
            precio,
            stock,
            costo,
            detalles,
            imgCortina
        });

        if (result.insertedCount === 1) {
            res.status(201).send("producto agregado correctamente.");
        } else {
            res.status(500).send("Error al agregar el producto.");
        }
    } catch (error) {
        console.error("Error agregando producto:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

//dispositivo IoT
app.get('/api/dispositivoiot', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("dispositivoiot");
    const dispositivo = await collection.find({}).toArray();
    res.json(dispositivo);
});

app.delete('/api/dispositivoiotdelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("dispositivoiot");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("dispositivo IoT not found.");
        }
    } catch (error) {
        console.error("Error deleting dispositivo IoT:", error);
        res.status(500).send("Internal server error.");
    }
});

// Actualizar un dispositivo IoT
app.put('/api/dispositivoiotactua/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }

    const { nombre_tarjeta, estado_cortinero, fecha_modificacion } = req.body;

    if (!nombre_tarjeta || !estado_cortinero || !fecha_modificacion) {
        return res.status(400).send("nombre_tarjeta, estado_cortinero y fecha_modificacion son campos requeridos.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("dispositivoiot");

        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { nombre_tarjeta, estado_cortinero, fecha_modificacion } }
        );

        if (result.matchedCount === 1) {
            res.status(200).send("Dispositivo IoT actualizado correctamente.");
        } else {
            res.status(404).send("Dispositivo IoT no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando dispositivo IoT:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

// Agregar un nuevo dispositivo IoT
app.post('/api/dispositivoiotpost', async (req, res) => {
    const { nombre_tarjeta, estado_cortinero, fecha_modificacion } = req.body;

    // Verificar que los campos requeridos estén presentes
    if (!nombre_tarjeta || !estado_cortinero || !fecha_modificacion) {
        return res.status(400).send("nombre_tarjeta, estado_cortinero y fecha_modificacion son campos requeridos.");
    }

    try {
        const db = await dbPromise;
        const collection = db.collection("dispositivoiot");

        const result = await collection.insertOne({
            nombre_tarjeta,
            estado_cortinero,
            fecha_modificacion
        });

        if (result.insertedCount === 1) {
            res.status(201).send("Dispositivo IoT agregado correctamente.");
        } else {
            res.status(500).send("Error al agregar dispositivo IoT.");
        }
    } catch (error) {
        console.error("Error agregando dispositivo IoT:", error);
        res.status(500).send("Error interno del servidor.");
    }
});
//preguntas connection

app.get('/api/preguntas', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("preguntas");
    const preguntas = await collection.find({}).toArray();
    res.json(preguntas);
});

app.delete('/api/preguntasdelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("preguntas");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("pregunta not found.");
        }
    } catch (error) {
        console.error("Error deleting preguntas:", error);
        res.status(500).send("Internal server error.");
    }
});

app.put('/api/preguntasactualizar/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    const { pregunta } = req.body;
    
    // Verificar que los campos requeridos estén presentes
    if (!pregunta) {
        return res.status(400).send("La pregunta es requerida.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("preguntas");
        
        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { pregunta } }
        );
        
        if (result.matchedCount === 1) {
            res.status(200).send("Pregunta actualizada correctamente.");
        } else {
            res.status(404).send("Pregunta no encontrada.");
        }
    } catch (error) {
        console.error("Error actualizando pregunta:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

app.post('/api/preguntas', async (req, res) => {
    const { pregunta } = req.body;
    
    // Verificar que la pregunta esté presente
    if (!pregunta) {
        return res.status(400).send("La pregunta es requerida.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("preguntas");
        
        const result = await collection.insertOne({ pregunta });
        
        if (result.insertedCount === 1) {
            res.status(201).send("Pregunta agregada correctamente.");
        } else {
            res.status(500).send("Error al agregar la pregunta.");
        }
    } catch (error) {
        console.error("Error agregando pregunta:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


app.get('/api/puestos', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("puestos");
    const puestos = await collection.find({}).toArray();
    res.json(puestos);
});

app.delete('/api/puestosdelet/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("puestos");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("puestos not found.");
        }
    } catch (error) {
        console.error("Error deleting puesto:", error);
        res.status(500).send("Internal server error.");
    }
});

app.put('/api/puestosactualizar/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Formato de ID inválido.");
    }
    
    const { nombre_del_puesto } = req.body;
    
    // Verificar que los campos requeridos estén presentes
    if (!nombre_del_puesto) {
        return res.status(400).send("El nombre del puesto es requerido.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("puestos");
        
        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { nombre_del_puesto } }
        );
        
        if (result.matchedCount === 1) {
            res.status(200).send("Puesto actualizado correctamente.");
        } else {
            res.status(404).send("Puesto no encontrado.");
        }
    } catch (error) {
        console.error("Error actualizando puesto:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

app.post('/api/puestospost', async (req, res) => {
    const { nombre_del_puesto } = req.body;
    
    // Verificar que el nombre del puesto esté presente
    if (!nombre_del_puesto) {
        return res.status(400).send("El nombre del puesto es requerido.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("puestos");
        
        const result = await collection.insertOne({ nombre_del_puesto });
        
        if (result.insertedCount === 1) {
            res.status(201).send("Puesto agregado correctamente.");
        } else {
            res.status(500).send("Error al agregar el puesto.");
        }
    } catch (error) {
        console.error("Error agregando puesto:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

// categoria coleccion
app.get('/api/categorias', async (req, res) => {
    try {
        const db = await dbPromise;
        const collection = db.collection("categoria");
        const categorias = await collection.find({}).toArray();
        res.json(categorias);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).send("Error interno del servidor.");
    }
});
//eliminar 1 categoria
app.delete('/api/categoriadelet/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await dbPromise;
        const collection = db.collection("categoria");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("Categoría no encontrada.");
        }
    } catch (error) {
        console.error("Error eliminando categoría:", error);
        res.status(500).send("Error interno del servidor.");
    }
});
//actualizar categoria
app.put('/api/categoriaupdate/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const db = await dbPromise;
        const collection = db.collection("categoria");
        const result = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { nombre } }
        );
        if (result.matchedCount === 1) {
            res.status(200).send("Categoría actualizada correctamente.");
        } else {
            res.status(404).send("Categoría no encontrada.");
        }
    } catch (error) {
        console.error("Error actualizando categoría:", error);
        res.status(500).send("Error interno del servidor.");
    }
});
//agregar categoria
app.post('/api/categoriaspost', async (req, res) => {
    const { nombre } = req.body;
    try {
        const db = await dbPromise;
        const collection = db.collection("categoria");
        const result = await collection.insertOne({ nombre });
        if (result.insertedCount === 1) {
            res.status(201).send("Categoría agregada correctamente.");
        } else {
            res.status(500).send("Error al agregar categoría.");
        }
    } catch (error) {
        console.error("Error agregando categoría:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
