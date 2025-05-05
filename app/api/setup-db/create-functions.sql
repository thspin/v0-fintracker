-- Crear función para ejecutar SQL dinámico
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para crear extensión uuid-ossp
CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS VOID AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar errores si la extensión ya existe
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
