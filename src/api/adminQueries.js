export const LOGIN_MUTATION_VARIANTS = {
  variant1: `
    mutation Login($correo: String!, $password: String!) {
      login(correo: $correo, password: $password)
    }
  `,
  variant2: `
    mutation Login($correo: String!, $password: String!) {
      Login(correo: $correo, password: $password)
    }
  `,
  variant3: `
    mutation Login($input: LoginInput!) {
      login(input: $input)
    }
  `,
  variant4: `
    mutation Authenticate($correo: String!, $password: String!) {
      authenticate(correo: $correo, password: $password)
    }
  `,
  variant5: `
    mutation SignIn($correo: String!, $password: String!) {
      signIn(correo: $correo, password: $password)
    }
  `,
};

export const LOGIN_MUTATION = LOGIN_MUTATION_VARIANTS.variant1;

export const INTROSPECTION_QUERY = `
  query {
    __schema {
      mutationType {
        fields {
          name
          description
          args {
            name
            type {
              name
            }
          }
        }
      }
    }
  }
`;

export const GET_USUARIOS = `
  query {
    usuarios {
      id
      nombre
      apellido
      correo
      roles
      telefono
    }
  }
`;

export const GET_PRODUCTORES = `
  query {
    productores {
      id
      idUsuario
      nombreUsuario
      direccion
      nit
    }
  }
`;

export const GET_PRODUCTOS = `
  query {
    productos {
      id
      nombre
      descripcion
      precioActual
      unidadMedida
      atributos
      imagenes
      categoria
      stock
      productorId
    }
  }
`;

export const GET_VENTAS = `
  query {
    ventas {
      id
      usuarioId
      productorId
      fecha
      montoTotal
      comprobadorId
      estado
      numeroTransaccion
      detalles {
        productoId
        cantidad
        nombreProducto
        precioUnitario
        subtotal
      }
    }
  }
`;

export const GET_COMPROBADORES = `
  query {
    comprobador {
      id
      usuarioId
      nombreUsuario
      ci
      cuposDisponibles
      estaDisponible
    }
  }
`;

export const CREATE_PRODUCTO_MUTATION = `
  mutation CrearProducto($input: CrearProductoInput!) {
    crearProducto(input: $input) {
      id
      nombre
      descripcion
      precioActual
      unidadMedida
      atributos
      imagenes
      categoria
      stock
      productorId
    }
  }
`;

export const CREATE_USUARIO_MUTATION = `
  mutation CrearUsuario($input: CrearUsuarioInput!) {
    crearUsuario(input: $input) {
      id
      nombre
      apellido
      correo
      roles
      telefono
    }
  }
`;

export const ACTUALIZAR_USUARIO_MUTATION = `
  mutation ActualizarUsuario($input: ActualizarUsuarioInput!) {
    actualizarUsuario(input: $input) {
      id
      nombre
      apellido
      correo
      roles
      telefono
    }
  }
`;

export const CREATE_VENTA_MUTATION = `
  mutation CrearVenta($input: CrearVentaInput!) {
    crearVenta(input: $input) {
      id
      usuarioId
      productorId
      montoTotal
      estado
      numeroTransaccion
      comprobadorId
      detalles {
        productoId
        cantidad
        nombreProducto
        precioUnitario
        subtotal
      }
    }
  }
`;

export const CREATE_COMPROBADOR_MUTATION = `
  mutation CrearComprobador($input: CrearComprobadorInput!) {
    crearComprobador(input: $input) {
      id
      usuarioId
      nombreUsuario
      ci
      estaDisponible
    }
  }
`;

export const ELIMINAR_PRODUCTO_ADMIN_MUTATION = `
  mutation EliminarProductoAdmin($nombreProducto: String!) {
    eliminarProductoAdmin(nombreProducto: $nombreProducto)
  }
`;

export const ELIMINAR_USUARIO_ADMIN_MUTATION = `
  mutation EliminarUsuarioAdmin($usuarioId: String!) {
    eliminarUsuarioAdmin(usuarioId: $usuarioId)
  }
`;

export const ELIMINAR_VENTA_ADMIN_MUTATION = `
  mutation EliminarVentaAdmin($ventaId: String!) {
    eliminarVentaAdmin(ventaId: $ventaId)
  }
`;

export const ELIMINAR_COMPROBADOR_ADMIN_MUTATION = `
  mutation EliminarComprobadorAdmin($comprobadorId: String!) {
    eliminarComprobadorAdmin(comprobadorId: $comprobadorId)
  }
`;

export const EDITAR_USUARIO_ADMIN_MUTATION = `
  mutation EditarUsuarioAdmin($usuarioId: String!, $nombre: String, $apellido: String, $correo: String, $telefono: String, $roles: [String!]) {
    editarUsuarioAdmin(usuarioId: $usuarioId, nombre: $nombre, apellido: $apellido, correo: $correo, telefono: $telefono, roles: $roles) {
      id
      nombre
      apellido
      correo
      roles
      telefono
    }
  }
`;

export const EDITAR_PRODUCTO_ADMIN_MUTATION = `
  mutation EditarProductoAdmin($productoId: String!, $nombre: String, $descripcion: String, $precioActual: Decimal, $precioMayorista: Decimal, $cantidadMinimaMayorista: Int, $unidadMedida: String, $categoria: String, $stock: Decimal, $atributos: [String!], $imagenes: [String!], $productorId: String) {
    editarProductoAdmin(productoId: $productoId, nombre: $nombre, descripcion: $descripcion, precioActual: $precioActual, precioMayorista: $precioMayorista, cantidadMinimaMayorista: $cantidadMinimaMayorista, unidadMedida: $unidadMedida, categoria: $categoria, stock: $stock, atributos: $atributos, imagenes: $imagenes, productorId: $productorId) {
      id
      nombre
    }
  }
`;

export const EDITAR_VENTA_ADMIN_MUTATION = `
  mutation EditarVentaAdmin($ventaId: String!, $estado: String, $numeroTransaccion: String) {
    editarVentaAdmin(ventaId: $ventaId, estado: $estado, numeroTransaccion: $numeroTransaccion) {
      id
      estado
      numeroTransaccion
    }
  }
`;

export const EDITAR_COMPROBADOR_ADMIN_MUTATION = `
  mutation EditarComprobadorAdmin($comprobadorId: String!, $nombreUsuario: String, $ci: String, $cuposDisponibles: Int, $usuarioId: String) {
    editarComprobadorAdmin(comprobadorId: $comprobadorId, nombreUsuario: $nombreUsuario, ci: $ci, cuposDisponibles: $cuposDisponibles, usuarioId: $usuarioId) {
      id
      usuarioId
      nombreUsuario
      ci
      estaDisponible
    }
  }
`;

export const CREAR_COMPROBADOR_ADMIN_MUTATION = `
  mutation CrearComprobadorAdmin($usuarioId: String!, $ci: String!, $nombreUsuario: String, $cuposDisponibles: Int) {
    crearComprobadorAdmin(usuarioId: $usuarioId, ci: $ci, nombreUsuario: $nombreUsuario, cuposDisponibles: $cuposDisponibles) {
      id
      usuarioId
      nombreUsuario
      ci
      estaDisponible
    }
  }
`;

// Consulta para crear un productor
export const CREAR_PRODUCTOR_ADMIN_MUTATION = `
  mutation CrearProductorAdmin($usuarioId: String!, $nombreUsuario: String!, $direccion: String, $nit: String, $telefono: String) {
    crearProductorAdmin(
      usuarioId: $usuarioId
      nombreUsuario: $nombreUsuario
      direccion: $direccion
      nit: $nit
      telefono: $telefono
    ) {
      id
      usuarioId
      nombreUsuario
      direccion
      nit
      telefono
    }
  }
`;

// Consulta para editar un productor
export const EDITAR_PRODUCTOR_ADMIN_MUTATION = `
  mutation EditarProductorAdmin(
    $productorId: String!
    $nombreUsuario: String
    $direccion: String
    $nit: String
    $telefono: String
  ) {
    editarProductorAdmin(
      productorId: $productorId
      nombreUsuario: $nombreUsuario
      direccion: $direccion
      nit: $nit
      telefono: $telefono
    ) {
      id
      usuarioId
      nombreUsuario
      direccion
      nit
      telefono
    }
  }
`;

// Consulta para eliminar un productor
export const ELIMINAR_PRODUCTOR_ADMIN_MUTATION = `
  mutation EliminarProductorAdmin($productorId: String!) {
    eliminarProductorAdmin(productorId: $productorId)
  }
`;
