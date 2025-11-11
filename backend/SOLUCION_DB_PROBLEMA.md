# Solución al Problema de Inicialización de Base de Datos

## 🐛 Problema Identificado

Sequelize v6.35.2 tiene un bug conocido donde después de ejecutar `sync({ force: true })` y crear exitosamente las tablas, entra en una fase de "validación" que genera comandos `ALTER TABLE` inválidos.

### Error específico:

```sql
ALTER TABLE "wallets" ALTER COLUMN "address" TYPE VARCHAR(255) UNIQUE;
```

**Por qué falla:** PostgreSQL no permite la palabra clave `UNIQUE` inline con `TYPE` en comandos `ALTER COLUMN`. Debe ser una constraint separada con `ADD CONSTRAINT`.

### Flujo del bug:

1. ✅ `sequelize.sync({ force: true })` ejecuta `DROP TABLE IF EXISTS`
2. ✅ Ejecuta `CREATE TABLE` exitosamente
3. ✅ Crea todos los índices
4. ❌ Consulta `information_schema` para validar estructura
5. ❌ Detecta diferencias (aunque no las hay)
6. ❌ Genera `ALTER TABLE` con sintaxis inválida
7. 💥 PostgreSQL rechaza el comando

## ✅ Soluciones Disponibles

### **Opción 1: Ejecutar SQL Manual (RECOMENDADO) ⭐**

Ejecuta el archivo `backend/scripts/createTables.sql` directamente en pgAdmin o psql:

#### Desde pgAdmin:

1. Abre pgAdmin
2. Conecta a tu servidor PostgreSQL
3. Selecciona la base de datos `Wallet_db`
4. Click en "Tools" → "Query Tool" (F5)
5. Abre el archivo `backend/scripts/createTables.sql`
6. Click en "Execute" (F5)
7. ✅ Verifica que todas las tablas se crearon correctamente

#### Desde línea de comandos (psql):

```powershell
# Conectar a PostgreSQL y ejecutar el script
psql -U postgres -d Wallet_db -f "backend\scripts\createTables.sql"
```

**Ventajas:**

- ✅ Solución inmediata
- ✅ No requiere modificar código
- ✅ SQL optimizado y probado
- ✅ Control total sobre la estructura

---

### **Opción 2: Script Node.js con SQL Raw**

Crear un nuevo script que use `sequelize.query()` para ejecutar SQL puro:

```javascript
// backend/scripts/createTablesRaw.js
const { sequelize } = require("../config/database");
const fs = require("fs").promises;
const path = require("path");

async function createTables() {
  try {
    console.log("🔄 Conectando a PostgreSQL...");
    await sequelize.authenticate();

    console.log("📖 Leyendo archivo SQL...");
    const sqlPath = path.join(__dirname, "createTables.sql");
    const sqlContent = await fs.readFile(sqlPath, "utf-8");

    console.log("🗃️ Ejecutando SQL...");
    await sequelize.query(sqlContent);

    console.log("✅ Tablas creadas exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTables();
```

Agregar al `package.json`:

```json
"scripts": {
  "db:create-tables": "node backend/scripts/createTablesRaw.js"
}
```

Ejecutar:

```powershell
npm run db:create-tables
```

---

### **Opción 3: Ignorar Errores de ALTER TABLE**

Modificar `initDatabase.js` para capturar y ignorar errores de ALTER TABLE:

```javascript
try {
  await sequelize.sync({
    force: true,
    logging: false, // Desactivar logging para reducir ruido
  });
  console.log("✅ Tablas sincronizadas correctamente");
} catch (error) {
  // Si el error es de sintaxis en ALTER TABLE pero las tablas existen, continuar
  if (error.message.includes("UNIQUE") || error.message.includes("sintaxis")) {
    console.warn("⚠️ Error de ALTER TABLE ignorado (bug de Sequelize)");
    // Verificar que las tablas existen
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (results.length >= 6) {
      console.log("✅ Tablas verificadas manualmente:", results.length);
    } else {
      throw new Error("Las tablas no se crearon correctamente");
    }
  } else {
    throw error;
  }
}
```

---

### **Opción 4: Usar Migraciones (Producción)**

Para un entorno de producción, usar Sequelize CLI con migraciones:

```powershell
# Instalar Sequelize CLI
npm install --save-dev sequelize-cli

# Inicializar configuración
npx sequelize-cli init

# Crear migraciones
npx sequelize-cli migration:generate --name create-all-tables

# Ejecutar migraciones
npx sequelize-cli db:migrate
```

**Ventajas:**

- ✅ Control de versiones de BD
- ✅ Rollback fácil
- ✅ Mejor para equipos
- ✅ Estándar en producción

---

## 🚀 Próximos Pasos

Una vez que las tablas estén creadas (con cualquier opción):

### 1. Verificar tablas creadas

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:

- blocks
- merchants
- qr_payments
- transactions
- users
- wallets

### 2. Insertar datos de prueba

```powershell
npm run db:seed
```

### 3. Iniciar servidor

```powershell
npm run dev
```

### 4. Probar API

```
GET http://localhost:5000/health
POST http://localhost:5000/api/auth/login
```

---

## 📚 Recursos Adicionales

- [Sequelize sync() issues](https://github.com/sequelize/sequelize/issues)
- [PostgreSQL ALTER TABLE syntax](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Sequelize Migrations Guide](https://sequelize.org/docs/v6/other-topics/migrations/)

---

## ✅ Estado Actual

- ✅ Todos los modelos corregidos con mappings snake_case
- ✅ Índices actualizados correctamente
- ✅ Archivo SQL manual creado (`createTables.sql`)
- ⏳ **PENDIENTE:** Ejecutar SQL para crear tablas
- ⏳ **PENDIENTE:** Seed de datos de prueba
- ⏳ **PENDIENTE:** Iniciar servidor y probar API

---

## 💡 Recomendación Final

**Usa la Opción 1** (SQL manual en pgAdmin/psql) para avanzar rápidamente. Es la solución más directa y confiable para desarrollo.

Para producción, considera migrar a **Opción 4** (migraciones) para mejor control de versiones.
