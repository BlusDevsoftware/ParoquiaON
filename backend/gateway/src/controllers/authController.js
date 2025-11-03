// Autenticação desativada neste gateway. Utilize o serviço api-paroquiaon.
function disabledResponse(res) {
    return res.status(410).json({
        error: 'Autenticação desativada neste serviço',
        details: 'Use api-paroquiaon (/api/auth/*)',
        service: 'gateway-auth-disabled'
    });
}

async function login(req, res) {
    return disabledResponse(res);
}

async function changePassword(req, res) {
    return disabledResponse(res);
}

async function verifyToken(req, res) {
    return disabledResponse(res);
}

module.exports = {
    login,
    changePassword,
    verifyToken
};
