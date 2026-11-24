
const supabase = require('../config/supabase');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token autentikasi tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesi tidak valid. Silakan login kembali.',
      });
    }

    req.user = data.user;
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memeriksa autentikasi.',
    });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('Role Check Error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Gagal memverifikasi role pengguna.',
      });
    }

    if (data?.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Fitur ini khusus administrator.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memeriksa hak akses.',
    });
  }
};

module.exports = {
  authenticateUser,
  requireAdmin,
};
