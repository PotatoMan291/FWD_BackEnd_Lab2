
const servicio = require('../services/pedidos.service');

function validarId(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function manejarError(error, res) {
    if (error.status) {
        return res.status(error.status).json({ error: error.message });
    }

    console.error('Error en pedidos:', error.message);

    if (error.code === '23503') {
        return res.status(409).json({
            error: 'El producto o insumo indicado no existe'
        });
    }

    if (
        error.code === '23514' ||
        error.code === '22P02' ||
        error.code === '23502'
    ) {
        return res.status(400).json({
            error: 'Los datos enviados no son validos'
        });
    }

    return res.status(500).json({
        error: 'Error interno al procesar el pedido'
    });
}

async function listar(req, res) {
    try {
        return res.status(200).json(await servicio.obtenerTodos());
    } catch (error) {
        return manejarError(error, res);
    }
}

async function obtener(req, res) {
    if (!validarId(req.params.id)) {
        return res.status(400).json({
            error: 'El ID debe ser un entero positivo'
        });
    }

    try {
        const pedido = await servicio.obtenerPorId(Number(req.params.id));

        if (!pedido) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        return res.status(200).json(pedido);
    } catch (error) {
        return manejarError(error, res);
    }
}

async function crear(req, res) {
    const { metodo_pago, items } = req.body || {};

    const metodosValidos = ['efectivo', 'tarjeta', 'sinpe'];

    if (!metodosValidos.includes(metodo_pago)) {
        return res.status(400).json({
            error: 'El metodo_pago debe ser efectivo, tarjeta o sinpe'
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: 'El pedido debe incluir al menos un producto'
        });
    }

    for (const item of items) {
        if (
            !item ||
            !Number.isInteger(item.producto_id) ||
            item.producto_id <= 0 ||
            !Number.isInteger(item.cantidad) ||
            item.cantidad <= 0
        ) {
            return res.status(400).json({
                error: 'Cada item requiere producto_id y cantidad como enteros positivos'
            });
        }
    }

    try {
        const pedido = await servicio.crear({ metodo_pago, items });
        return res.status(201).json(pedido);
    } catch (error) {
        return manejarError(error, res);
    }
}

async function anular(req, res) {
    if (!validarId(req.params.id)) {
        return res.status(400).json({
            error: 'El ID debe ser un entero positivo'
        });
    }

    try {
        const pedido = await servicio.anular(Number(req.params.id));
        return res.status(200).json({
            mensaje: 'Pedido anulado y existencias devueltas',
            pedido
        });
    } catch (error) {
        return manejarError(error, res);
    }
}

async function resumen(req, res) {
    try {
        const datos = await servicio.obtenerResumen();
        return res.status(200).json(datos);
    } catch (error) {
        return manejarError(error, res);
    }
}

module.exports = {
    listar,
    obtener,
    crear,
    anular,
    resumen
};
