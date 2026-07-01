import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos del Servicio · Atribuya",
  description:
    "Términos y condiciones del servicio Atribuya: SaaS multi-tenant para atribución automática de reseñas de Google Business Profile a comerciales individuales.",
};

export default function TerminosPage() {
  return (
    <>
      <h1 style={h1}>Términos del Servicio</h1>
      <p style={lede}>
        Última actualización: 24 de mayo de 2026.
      </p>

      <p style={p}>
        Estos Términos del Servicio (en adelante, &quot;los Términos&quot;) regulan
        el acceso y uso de Atribuya, un servicio software como servicio (SaaS)
        que permite a empresas con red comercial atribuir automáticamente las
        reseñas de Google Business Profile a cada uno de sus comerciales.
        Atribuya es prestado por el responsable identificado en el apartado 14.
      </p>
      <p style={p}>
        Al contratar el servicio o al acceder a la aplicación, el Cliente y
        sus usuarios autorizados aceptan estos Términos. Si no estás de acuerdo
        con alguna de las condiciones, no utilices el servicio.
      </p>

      <h2 style={h2}>1. Definiciones</h2>
      <ul style={ul}>
        <li>
          <strong>Servicio</strong> o <strong>Atribuya</strong>: la plataforma
          accesible en <code style={code}>atribuya.com</code>, incluida la aplicación web, las
          integraciones con Google Business Profile / Google Places API y las
          funciones de matching, notificación y exportación.
        </li>
        <li>
          <strong>Cliente</strong>: la organización (empresa, autónomo, entidad
          o profesional) que contrata el Servicio y para la que se crea una
          cuenta de tipo <em>organization</em> en Atribuya.
        </li>
        <li>
          <strong>Usuarios autorizados</strong>: las personas físicas a las
          que el Cliente invita a usar el Servicio (administradores,
          comerciales y gestores de reseñas).
        </li>
        <li>
          <strong>Responsable</strong>: Alejandro Castillo Cantón, identificado
          en el apartado 14, titular del Servicio.
        </li>
      </ul>

      <h2 style={h2}>2. Quién puede contratar Atribuya</h2>
      <p style={p}>
        Atribuya está dirigido exclusivamente a personas jurídicas, autónomos
        y profesionales que contraten el Servicio para gestionar la actividad
        comercial de su organización. No es un servicio dirigido a
        consumidores particulares ni a menores de edad.
      </p>
      <p style={p}>
        El alta de nuevas organizaciones se realiza manualmente por el
        Responsable. No existe registro libre (self-service): cada
        contratación pasa por una conversación previa y una propuesta
        económica individual.
      </p>

      <h2 style={h2}>3. Descripción del servicio</h2>
      <p style={p}>El Servicio permite al Cliente:</p>
      <ul style={ul}>
        <li>
          Dar de alta fichas de Google Business Profile y vincularlas a su
          organización dentro de Atribuya.
        </li>
        <li>
          Invitar a sus comerciales y gestores como usuarios autorizados, cada
          uno con un rol diferenciado y permisos limitados a su organización.
        </li>
        <li>
          Generar enlaces personalizados del tipo{" "}
          <code style={code}>/o/[organización]/c/[comercial]/[cliente]</code>{" "}
          que redirigen al formulario de reseña de Google.
        </li>
        <li>
          Sincronizar automáticamente las reseñas recibidas (vía Google Places
          API y/o Google Business Profile API) y atribuirlas al comercial
          correspondiente mediante un algoritmo de ventana temporal y
          similitud de nombre.
        </li>
        <li>
          Acceder a paneles de actividad, exportar informes y revisar
          manualmente las atribuciones propuestas por el sistema.
        </li>
      </ul>

      <h2 style={h2}>4. Cuentas, credenciales y responsabilidad del Cliente</h2>
      <p style={p}>
        El Cliente designa al menos una persona como administrador inicial al
        contratar el servicio. El administrador es responsable de invitar al
        resto de usuarios autorizados de su organización y de gestionar sus
        permisos.
      </p>
      <p style={p}>El Cliente y sus usuarios autorizados se comprometen a:</p>
      <ul style={ul}>
        <li>
          Mantener la confidencialidad de las credenciales de acceso y notificar
          al Responsable cualquier sospecha de uso no autorizado.
        </li>
        <li>
          Utilizar el Servicio únicamente para los fines previstos y conforme a
          la legislación aplicable.
        </li>
        <li>
          No compartir las credenciales ni dejar sesiones abiertas en
          dispositivos no controlados.
        </li>
        <li>
          No intentar acceder a datos de otras organizaciones del Servicio ni
          eludir los controles de aislamiento multi-tenant.
        </li>
        <li>
          Comunicar cualquier vulnerabilidad de seguridad detectada al email
          de contacto indicado en el apartado 14.
        </li>
      </ul>

      <h2 style={h2}>5. Datos del Cliente y sus contactos</h2>
      <p style={p}>
        Cada organización es <strong>titular y responsable</strong> de los
        datos que registra en su instancia de Atribuya: información de sus
        comerciales, clientes finales, fichas de Google Business Profile
        conectadas y reseñas atribuidas. El Responsable actúa como{" "}
        <strong>encargado del tratamiento</strong> respecto de esos datos,
        conforme al artículo 28 del Reglamento (UE) 2016/679 (RGPD). Los
        detalles del tratamiento se regulan en la{" "}
        <a href="/privacidad" style={a}>Política de Privacidad</a>.
      </p>
      <p style={p}>
        Cuando un comercial registra un cliente en su panel, asume haber
        obtenido sus datos identificativos (nombre y, opcionalmente, email y
        teléfono) de forma legítima en el marco de la relación comercial.
        Cualquier solicitud de derechos del cliente (acceso, supresión,
        oposición, etc.) debe ser atendida por la organización del Cliente
        en primera instancia; el Responsable colaborará en lo necesario.
      </p>

      <h2 style={h2}>6. Uso aceptable</h2>
      <p style={p}>El Cliente se compromete a no utilizar el Servicio para:</p>
      <ul style={ul}>
        <li>
          Generar reseñas falsas o tráfico artificial hacia las fichas de
          Google. Atribuya se ha diseñado para gestionar reseñas reales
          obtenidas de visitas comerciales reales; el incumplimiento expone al
          Cliente a las políticas de Google y a la suspensión del servicio.
        </li>
        <li>
          Almacenar categorías especiales de datos personales (origen étnico,
          salud, ideología, datos biométricos, etc.) ni datos de menores.
        </li>
        <li>
          Realizar ingeniería inversa, descompilar o intentar derivar el código
          fuente del Servicio.
        </li>
        <li>
          Sobrecargar la infraestructura mediante scripts automatizados que
          excedan el uso comercial razonable.
        </li>
      </ul>

      <h2 style={h2}>7. Disponibilidad del servicio</h2>
      <p style={p}>
        El Responsable hace un esfuerzo razonable para mantener el Servicio
        disponible, pero no garantiza disponibilidad continua. Pueden
        producirse interrupciones por mantenimiento programado, fallos de los
        proveedores subcontratados (Supabase, Vercel, Google, proveedor SMTP)
        o causas de fuerza mayor.
      </p>
      <p style={p}>
        La sincronización de reseñas depende de las APIs de Google y de sus
        cuotas y límites. No existe garantía de tiempo real: las reseñas se
        sincronizan en intervalos periódicos definidos por el sistema.
      </p>

      <h2 style={h2}>8. Precio y pago</h2>
      <p style={p}>
        Las condiciones económicas (cuota mensual, setup inicial, número de
        fichas y comerciales incluidos, etc.) se acuerdan individualmente con
        cada Cliente y se documentan en una propuesta o contrato específico
        fuera de este documento. La facturación es manual (servicios
        profesionales) hasta nuevo aviso.
      </p>
      <p style={p}>
        El impago de cualquier factura habilita al Responsable a suspender
        temporalmente el acceso al Servicio previa notificación al Cliente.
      </p>

      <h2 style={h2}>9. Confidencialidad</h2>
      <p style={p}>
        Cada parte se compromete a tratar como confidencial la información
        comercial, técnica y operativa de la otra parte que conozca en el
        marco del Servicio, salvo que sea pública, sea conocida con
        anterioridad o se obtenga de fuentes lícitas independientes. Esta
        obligación se mantiene durante la vigencia del contrato y dos años
        después de su finalización.
      </p>

      <h2 style={h2}>10. Propiedad intelectual</h2>
      <p style={p}>
        Atribuya, su código fuente, diseño, marca, dominios y documentación
        son propiedad del Responsable. Estos Términos no transfieren ningún
        derecho de propiedad intelectual al Cliente: el Cliente recibe una
        licencia de uso no exclusiva, intransferible y limitada a la
        vigencia del contrato.
      </p>
      <p style={p}>
        Las reseñas de Google y los datos públicos de las fichas son
        propiedad de sus respectivos autores o de Google según corresponda;
        Atribuya los procesa al amparo de los términos de las APIs de Google.
      </p>

      <h2 style={h2}>11. Duración, baja y portabilidad de datos</h2>
      <p style={p}>
        El contrato del Servicio tiene la duración pactada con cada Cliente.
        Cualquiera de las partes puede resolverlo mediante notificación
        escrita con un preaviso mínimo de treinta (30) días naturales, salvo
        incumplimiento grave de la otra parte (en cuyo caso la resolución es
        inmediata).
      </p>
      <p style={p}>
        Tras la baja, el Responsable conservará los datos del Cliente durante
        un periodo de hasta sesenta (60) días naturales por si hubiera una
        reactivación, transcurrido el cual serán eliminados de forma segura,
        salvo obligación legal de conservación. El Cliente puede solicitar
        antes de la baja un volcado de sus datos en formato Excel.
      </p>

      <h2 style={h2}>12. Limitación de responsabilidad</h2>
      <p style={p}>
        En la máxima medida permitida por la legislación aplicable, la
        responsabilidad total del Responsable frente al Cliente por
        cualquier reclamación derivada del Servicio se limita al importe
        total facturado al Cliente en los doce (12) meses anteriores al
        hecho generador de la reclamación.
      </p>
      <p style={p}>
        En ningún caso el Responsable será responsable de daños indirectos,
        consecuenciales, lucro cesante, pérdida de oportunidades comerciales,
        pérdida de reputación o pérdida de datos del Cliente cuando esa
        pérdida sea atribuible a los proveedores subcontratados o al propio
        Cliente.
      </p>
      <p style={p}>
        La atribución automática de reseñas es una propuesta del sistema; la
        decisión final de contabilizar o reasignar una reseña recae en el
        administrador del Cliente, que dispone de una bandeja de
        verificación manual.
      </p>

      <h2 style={h2}>13. Modificaciones y legislación aplicable</h2>
      <p style={p}>
        Estos Términos pueden actualizarse para reflejar cambios en el
        producto o en la legislación aplicable. La fecha de la última
        actualización aparece al principio del documento. Los cambios
        sustanciales se notificarán a los administradores del Cliente por
        correo electrónico con un preaviso de treinta (30) días.
      </p>
      <p style={p}>
        Estos Términos se rigen por la legislación española. Para la
        resolución de cualquier controversia, las partes se someten a los
        Juzgados y Tribunales de Castellón, con renuncia expresa a
        cualquier otro fuero, salvo que la ley imponga otro fuero
        imperativo por la condición de consumidor.
      </p>

      <h2 style={h2}>14. Responsable y contacto</h2>
      <p style={p}>
        <strong>Alejandro Castillo Cantón</strong>
        <br />
        NIF: 55418862V
        <br />
        Domicilio: Calle Leopoldo Querol 53, 3, 12560 Benicàssim, Castellón
        <br />
        Teléfono: +34 644 295 159
        <br />
        Correo de contacto:{" "}
        <a href="mailto:alejandro@atribuya.com" style={a}>
          alejandro@atribuya.com
        </a>
      </p>
    </>
  );
}

const h1: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 32,
  fontWeight: 700,
  letterSpacing: "-0.025em",
  margin: "0 0 12px",
};
const lede: React.CSSProperties = {
  margin: "0 0 28px",
  fontSize: 13.5,
  color: "var(--ink-4)",
};
const h2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 19,
  fontWeight: 600,
  letterSpacing: "-0.015em",
  margin: "32px 0 12px",
};
const p: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--ink-2)",
};
const ul: React.CSSProperties = {
  margin: "0 0 14px",
  paddingLeft: 22,
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--ink-2)",
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  padding: "1px 4px",
  background: "var(--surface-2)",
  border: "1px solid var(--line)",
  borderRadius: 4,
};
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
