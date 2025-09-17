import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 12;

async function initSuperAdmin() {
  console.log('🚀 Inicializando usuario Super Admin...');

  // Obtener variables de entorno con valores por defecto
  const adminName = process.env.ADMIN_NAME || 'Super Admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/ecommerce_db';

  console.log('📋 Configuración:');
  console.log(`   Nombre: ${adminName}`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Contraseña: ${'*'.repeat(adminPassword.length)}`);

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si ya existe un usuario con ese email
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Ya existe un usuario con el email:', adminEmail);
      console.log('👤 ID del usuario existente:', existingUser.rows[0].id);
      await client.release();
      await pool.end();
      console.log('✅ Script completado - usuario ya existente');
      process.exit(0);
    }

    // Hashear la contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    // Separar el nombre completo en first_name y last_name
    const nameParts = adminName.split(' ');
    const firstName = nameParts[0] || 'Super';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    // Insertar el usuario superadmin
    console.log('👤 Creando usuario Super Admin...');
    const result = await client.query(
      `INSERT INTO users (
        email, 
        password, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        is_email_verified,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING id, email, role`,
      [
        adminEmail,
        hashedPassword,
        firstName,
        lastName,
        'superadmin',
        true,
        true
      ]
    );

    const newUser = result.rows[0];
    console.log('🎉 Usuario Super Admin creado exitosamente!');
    console.log('📊 Detalles del usuario:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Rol: ${newUser.role}`);
    console.log(`   Activo: Sí`);
    console.log(`   Email verificado: Sí`);

    await client.release();
  } catch (error) {
    console.error('❌ Error al crear el usuario Super Admin:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
initSuperAdmin()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en la ejecución del script:', error.message);
    process.exit(1);
  });
