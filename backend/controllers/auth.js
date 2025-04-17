//logic login

export const login = async (email, password) => {
    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [result] = await db.query(sql, [email]);
    
        if (result.length === 0) {
        return { status: 401, message: "Email atau password salah." };
        }
    
        const user = result[0];
    
        // Verifikasi password dengan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        return { status: 401, message: "Email atau password salah." };
        }
    
        return {
        status: 200,
        message: "Login berhasil",
        user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
        },
        };
    } catch (err) {
        console.error("❌ Error login:", err);
        return { status: 500, message: "Gagal login." };
    }
}