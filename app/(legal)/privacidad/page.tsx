import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad · Atribuya",
  description:
    "Política de Privacidad de Atribuya, SaaS multi-tenant para atribución de reseñas de Google Business Profile a comerciales.",
};

export default function PrivacidadPage() {
  return (
    <>
      <h1 style={h1}>Política de Privacidad</h1>
      <p style={lede}>
        Última actualización: 7 de junio de 2026.
      </p>

      <p style={p}>
        Esta Política de Privacidad describe cómo se tratan los datos
        personales dentro de <strong>Atribuya</strong>, un servicio SaaS
        multi-tenant que permite a empresas con red comercial atribuir las
        reseñas de Google Business Profile a sus comerciales. Se aplica a
        las personas usuarias autorizadas del Servicio, a los clientes
        finales registrados por los comerciales y a los autores de reseñas
        cuyos datos públicos se sincronizan desde Google.
      </p>

      <h2 style={h2}>1. Responsable y encargado del tratamiento</h2>
      <p style={p}>
        Atribuya tiene dos roles distintos en función del tipo de datos:
      </p>
      <ul style={ul}>
        <li>
          <strong>Responsable del tratamiento</strong> respecto de los datos
          de las personas que contratan el Servicio y de los administradores
          de las cuentas (datos identificativos, de facturación y de
          autenticación necesarios para prestar el Servicio).
        </li>
        <li>
          <strong>Encargado del tratamiento</strong> (art. 28 RGPD) respecto
          de los datos que cada organización cliente introduce en su
          instancia: comerciales, clientes finales, fichas de Google,
          reseñas y registros de actividad. En este caso es{" "}
          <strong>el Cliente</strong> (la organización contratante) quien
          actúa como Responsable del tratamiento de esos datos.
        </li>
      </ul>
      <p style={p}>
        Los datos identificativos del Responsable están en el apartado 11.
      </p>

      <h2 style={h2}>2. Datos que tratamos</h2>

      <h3 style={h3}>2.1 Datos del Cliente y sus administradores</h3>
      <ul style={ul}>
        <li>Razón social o nombre, NIF/CIF, dirección de facturación.</li>
        <li>Nombre, email, teléfono y cargo del administrador o contacto.</li>
        <li>Datos de uso del Servicio agregados a nivel de organización (número
          de fichas conectadas, comerciales activos, frecuencia de sync, etc.).</li>
      </ul>

      <h3 style={h3}>2.2 Datos de usuarios autorizados (comerciales y gestores)</h3>
      <ul style={ul}>
        <li>Nombre, email, teléfono (opcional), rol asignado y ficha de Google
          vinculada (en el caso de comerciales).</li>
        <li>
          Datos técnicos derivados de la autenticación: identificador único de
          usuario, fecha del último acceso, sesiones activas.
        </li>
        <li>
          Foto de perfil cuando la persona la sube voluntariamente.
        </li>
      </ul>

      <h3 style={h3}>2.3 Datos de los clientes finales registrados por los comerciales</h3>
      <ul style={ul}>
        <li>
          Nombre completo del cliente final y, opcionalmente, email y teléfono,
          tal como los introduce el comercial para generar el enlace
          personalizado.
        </li>
        <li>
          Registros de aperturas del enlace personalizado (
          <code style={code}>share_links</code>): fecha y hora, canal de
          procedencia (WhatsApp, email, SMS, QR, directo) y user-agent del
          navegador.
        </li>
      </ul>

      <h3 style={h3}>2.4 Datos sincronizados desde Google Business Profile</h3>
      <ul style={ul}>
        <li>
          Reseñas publicadas en las fichas de Google conectadas: nombre del
          autor mostrado por Google, valoración en estrellas, texto de la
          reseña, fecha y referencia interna de la reseña.
        </li>
        <li>
          Información administrativa de la ficha conectada: identificador de
          la cuenta de Google, identificador de la ficha y email de la cuenta
          que autorizó la conexión.
        </li>
        <li>
          Tokens OAuth de acceso a Google: se almacenan en una tabla aislada
          con acceso restringido a procesos servidor; nunca se exponen al
          navegador del usuario.
        </li>
      </ul>

      <h2 style={h2}>3. Finalidad y base legal</h2>
      <p style={p}>
        El tratamiento se realiza para las siguientes finalidades, con las
        bases legales que se indican:
      </p>
      <ul style={ul}>
        <li>
          <strong>Prestación del Servicio</strong> (autenticación, atribución
          automática de reseñas, paneles, sincronización con Google):
          ejecución del contrato (art. 6.1.b RGPD) con el Cliente.
        </li>
        <li>
          <strong>Facturación, soporte y cumplimiento legal</strong>:
          cumplimiento de obligaciones legales (art. 6.1.c) e interés
          legítimo del Responsable (art. 6.1.f).
        </li>
        <li>
          <strong>Mejora del Servicio</strong> mediante métricas agregadas y
          anonimizadas: interés legítimo del Responsable (art. 6.1.f).
        </li>
        <li>
          <strong>Datos de clientes finales registrados por comerciales</strong>:
          el Cliente actúa como Responsable y debe acreditar la base legal
          adecuada (normalmente interés legítimo en el marco de la relación
          comercial o consentimiento del cliente final). Atribuya solo trata
          esos datos siguiendo las instrucciones del Cliente.
        </li>
      </ul>

      <h2 style={h2}>4. Encargados del tratamiento (sub-procesadores)</h2>
      <p style={p}>
        Para prestar el Servicio, el Responsable utiliza los siguientes
        proveedores como encargados del tratamiento o sub-encargados:
      </p>
      <ul style={ul}>
        <li>
          <strong>Supabase</strong> (Singapur, con datacenters en la UE):
          alojamiento de base de datos PostgreSQL y servicio de autenticación.
        </li>
        <li>
          <strong>Vercel</strong> (EE. UU., con edge nodes en la UE): hosting
          de la aplicación y ejecución de los crons.
        </li>
        <li>
          <strong>Google LLC</strong>: proveedor de las APIs de Google Places
          y Google Business Profile a las que el Cliente conecta sus fichas.
        </li>
        <li>
          <strong>Proveedor SMTP</strong> (actualmente correo transaccional
          gestionado por Supabase Auth; en el futuro Brevo o equivalente,
          ambos con servidores en la UE): envío de magic-links y
          notificaciones.
        </li>
        <li>
          <strong>GitHub</strong> (EE. UU., titularidad de Microsoft): sólo
          para ejecutar el workflow horario que dispara el endpoint público
          de sincronización; no recibe datos personales del Cliente.
        </li>
      </ul>
      <p style={p}>
        Los proveedores establecidos fuera del Espacio Económico Europeo
        ofrecen garantías adecuadas: cláusulas contractuales tipo de la
        Comisión Europea, certificaciones EU-US Data Privacy Framework u
        otros mecanismos previstos en el Capítulo V del RGPD.
      </p>
      <p style={p}>
        El Cliente puede solicitar al Responsable el listado actualizado de
        sub-encargados y firmar un acuerdo específico de encargo del
        tratamiento (DPA) al contratar el Servicio.
      </p>

      <h2 style={h2}>5. Plazos de conservación</h2>
      <ul style={ul}>
        <li>
          <strong>Datos del Cliente y administradores</strong>: durante la
          vigencia del contrato y los plazos legales aplicables tras
          finalizarla (típicamente seis años para obligaciones mercantiles
          y fiscales).
        </li>
        <li>
          <strong>Datos de usuarios autorizados</strong>: mientras
          pertenezcan a una organización activa. Tras la eliminación de un
          usuario, los datos identificativos se eliminan; los registros de
          actividad asociados se mantienen anonimizados.
        </li>
        <li>
          <strong>Datos de clientes finales y share_links</strong>: mientras
          sean necesarios para la atribución de reseñas (orientativamente
          12 meses), salvo borrado manual por el comercial o el
          administrador antes.
        </li>
        <li>
          <strong>Reseñas sincronizadas</strong>: mientras existan en Google.
          Si el cliente final las elimina, el sistema lo refleja en el
          siguiente sync mediante el campo <code style={code}>removed_at</code>.
        </li>
        <li>
          <strong>Tokens OAuth</strong>: hasta que el Cliente revoque la
          conexión desde el panel de fichas o desde su cuenta de Google.
        </li>
        <li>
          <strong>Audit log</strong>: cinco años desde la fecha de cada
          entrada, salvo obligación legal de conservación superior.
        </li>
      </ul>

      <h2 style={h2}>6. Derechos de las personas</h2>
      <p style={p}>
        Cualquier persona cuyos datos consten en Atribuya puede ejercer los
        derechos reconocidos por el RGPD: acceso, rectificación, supresión,
        oposición, limitación del tratamiento y portabilidad. Para hacerlo,
        envía una solicitud por escrito a{" "}
        <a href="mailto:alejandro@castillocanton.com" style={a}>
          alejandro@castillocanton.com
        </a>{" "}
        identificándote y describiendo el derecho que quieres ejercer.
      </p>
      <p style={p}>
        Si los datos pertenecen a un cliente final registrado por un
        comercial de una organización contratante, la solicitud se traslada
        a esa organización (responsable real del tratamiento) y se atiende
        en conjunto.
      </p>
      <p style={p}>
        Si consideras que el tratamiento de tus datos no se ajusta a la
        normativa, puedes presentar una reclamación ante la Agencia Española
        de Protección de Datos (<a href="https://www.aepd.es" style={a}>aepd.es</a>).
      </p>

      <h2 style={h2}>7. Seguridad</h2>
      <p style={p}>
        El Servicio implementa medidas técnicas y organizativas para proteger
        los datos personales: aislamiento multi-tenant mediante Row Level
        Security de PostgreSQL, cifrado en tránsito (HTTPS/TLS) y en reposo,
        rotación de tokens OAuth, registro de auditoría de acciones críticas
        y separación de responsabilidades a nivel de roles dentro de cada
        organización.
      </p>

      <h2 style={h2}>8. Cookies y tecnologías similares</h2>
      <p style={p}>
        <strong>Cookies técnicas.</strong> En el área autenticada del Servicio,
        Atribuya utiliza cookies técnicas estrictamente necesarias para mantener
        la sesión del usuario y para el correcto funcionamiento de la
        plataforma. Estas cookies no requieren consentimiento conforme al art.
        22.2 LSSI.
      </p>
      <p style={p}>
        <strong>Cookies analíticas de terceros.</strong> En las páginas públicas
        de marketing (la web atribuya.com), Atribuya utiliza Google Analytics 4,
        un servicio de analítica web de Google Ireland Limited, para conocer de
        forma agregada cómo se usa el sitio y mejorarlo. Google Analytics instala
        cookies y puede transferir datos a Google LLC (EE. UU.), amparada en las
        cláusulas contractuales tipo de la Comisión Europea y en el marco de
        privacidad de datos UE-EE. UU.
      </p>
      <p style={p}>
        Estas cookies analíticas <strong>solo se cargan si prestas tu
        consentimiento previo</strong> mediante el banner que se muestra al
        entrar. Hasta que pulses «Aceptar» no se ejecuta ningún script de Google
        ni se instala ninguna cookie analítica. Puedes rechazarlas sin que ello
        afecte a la navegación, y revocar o cambiar tu elección en cualquier
        momento desde el enlace «Cookies» del pie de página, con el mismo grado
        de facilidad con el que la otorgaste.
      </p>
      <p style={p}>
        No se utilizan cookies publicitarias ni de perfilado comercial. Más
        información sobre el tratamiento de datos por parte de Google en{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
        >
          policies.google.com/privacy
        </a>
        .
      </p>

      <h2 style={h2}>9. Datos públicos de reseñas de Google</h2>
      <p style={p}>
        Las reseñas publicadas en Google Business Profile son contenido
        publicado voluntariamente por sus autores en una plataforma
        pública. Atribuya las sincroniza con la finalidad de identificar
        al comercial que originó la visita y de presentar al Cliente un
        panel agregado. Los autores de las reseñas conservan todos sus
        derechos sobre dicho contenido frente a Google y pueden ejercer
        los derechos enumerados en el apartado 6 también frente al
        Responsable de Atribuya.
      </p>

      <h2 style={h2}>10. Cambios en esta política</h2>
      <p style={p}>
        Esta política puede actualizarse para reflejar cambios en el
        producto, en la legislación aplicable o en los sub-encargados del
        tratamiento. La fecha de la última actualización aparece al
        principio del documento. Los cambios sustanciales se notificarán a
        los administradores de las organizaciones contratantes por correo
        electrónico con un preaviso razonable.
      </p>

      <h2 style={h2}>11. Datos de contacto del responsable</h2>
      <p style={p}>
        <strong>Alejandro Castillo Cantón</strong>
        <br />
        NIF: 55418862V
        <br />
        Domicilio: Calle Leopoldo Querol 53, 3, 12560 Benicàssim, Castellón
        <br />
        Teléfono: +34 644 295 159
        <br />
        Correo de contacto para temas de privacidad:{" "}
        <a href="mailto:alejandro@castillocanton.com" style={a}>
          alejandro@castillocanton.com
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
const h3: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 15,
  fontWeight: 600,
  margin: "22px 0 8px",
  color: "var(--ink-2)",
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
const a: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
const code: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  padding: "1px 4px",
  background: "var(--surface-2)",
  border: "1px solid var(--line)",
  borderRadius: 4,
};
