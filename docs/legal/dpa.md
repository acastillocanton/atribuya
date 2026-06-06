# Acuerdo de Encargado del Tratamiento (DPA)

> **⚠️ Borrador para revisión.** Documento técnico-jurídico preparado para Atribuya. **Debe ser revisado y validado por un profesional legal** antes de firmarse con un cliente. No constituye asesoramiento jurídico. Los campos entre `[corchetes]` se completan con los datos del cliente al cerrar el contrato.

Acuerdo de Tratamiento de Datos Personales (en adelante, el **«Acuerdo»** o **«DPA»**) que regula el tratamiento de datos personales por cuenta del Responsable, en el marco del Reglamento (UE) 2016/679 (**RGPD**) y la Ley Orgánica 3/2018 (**LOPDGDD**), como anexo y parte inseparable del contrato de prestación del servicio **Atribuya** (en adelante, el **«Contrato Principal»**).

---

## 1. Partes

**Responsable del tratamiento** (el **«Responsable»** o el **«Cliente»**):
- Razón social: `[RAZÓN SOCIAL DEL CLIENTE]`
- NIF/CIF: `[NIF/CIF]`
- Domicilio: `[DOMICILIO]`
- Persona de contacto / DPO (si aplica): `[CONTACTO]` · `[EMAIL]`

**Encargado del tratamiento** (el **«Encargado»** o **«Atribuya»**):
- Titular: **Alejandro Castillo Cantón**
- NIF: **55418862V**
- Domicilio: Benicàssim (Castellón), España
- Contacto a efectos de protección de datos: **a.castillo.esv@gmail.com**
- Nombre comercial del servicio: **Atribuya** (atribuya.com), desarrollado por Castillo Cantón.

Ambas partes se reconocen capacidad suficiente para suscribir el presente Acuerdo.

---

## 2. Objeto

El Encargado presta al Responsable el servicio **Atribuya**, una plataforma SaaS multi-tenant que atribuye reseñas de Google Business Profile a los comerciales de la organización del Responsable. En la prestación de dicho servicio, el Encargado trata datos personales **por cuenta y bajo las instrucciones documentadas del Responsable**, en los términos del artículo 28 del RGPD.

El Responsable es quien determina la finalidad, el contenido y el uso de los datos personales tratados. El Encargado actúa exclusivamente conforme a las instrucciones del Responsable recogidas en el Contrato Principal, en este Acuerdo y en la configuración del servicio.

---

## 3. Duración

Este Acuerdo entra en vigor en la fecha de firma del Contrato Principal y permanece vigente mientras dure la prestación del servicio. A su finalización se aplica lo dispuesto en la **cláusula 11 (Devolución y supresión)**.

---

## 4. Naturaleza y finalidad del tratamiento (Anexo I)

- **Naturaleza de las operaciones**: recogida, registro, estructuración, conservación, consulta, organización y supresión de datos, mediante sistemas automatizados.
- **Finalidad**: permitir la atribución de reseñas públicas de Google a los comerciales del Responsable, la gestión de enlaces de captación, el cálculo de métricas de producción y el envío de notificaciones transaccionales al personal del Responsable.
- **Categorías de interesados**:
  - Personal comercial y gestor del Responsable (usuarios de la plataforma).
  - Clientes/contactos del Responsable dados de alta por sus comerciales para generar enlaces de reseña.
  - Autores de reseñas públicas de Google (datos hechos públicos por los propios autores en Google).
- **Categorías de datos personales**:
  - Datos identificativos y de contacto del personal del Responsable (nombre, email, teléfono, foto de perfil opcional).
  - Datos identificativos de los clientes/contactos del Responsable (nombre y, opcionalmente, email/teléfono).
  - Datos contenidos en las reseñas públicas de Google (nombre del autor mostrado, valoración, texto y fecha de la reseña).
- **No se tratan categorías especiales de datos** (art. 9 RGPD) de forma intencionada. El Responsable se compromete a no introducir datos de categorías especiales en campos de texto libre.

---

## 5. Obligaciones del Encargado

El Encargado se obliga a:

a) Tratar los datos personales únicamente conforme a las **instrucciones documentadas** del Responsable, incluidas las transferencias internacionales, salvo obligación legal que se comunicará al Responsable salvo prohibición legal.

b) Garantizar que las personas autorizadas para tratar los datos se han comprometido a respetar la **confidencialidad** (cláusula 6).

c) Adoptar las **medidas técnicas y organizativas** apropiadas (cláusula 7 y Anexo II).

d) Respetar las condiciones para recurrir a **otro encargado** (subencargados, cláusula 8).

e) **Asistir al Responsable** en la respuesta a las solicitudes de ejercicio de derechos de los interesados (cláusula 9).

f) Ayudar al Responsable a cumplir sus obligaciones de **seguridad, notificación de violaciones y evaluaciones de impacto** (cláusulas 7 y 10), teniendo en cuenta la naturaleza del tratamiento y la información disponible.

g) A elección del Responsable, **suprimir o devolver** los datos al finalizar la prestación (cláusula 11).

h) Poner a disposición del Responsable la información necesaria para demostrar el cumplimiento y permitir **auditorías** (cláusula 12).

i) Informar inmediatamente al Responsable si, en su opinión, una instrucción infringe el RGPD u otra norma de protección de datos.

j) **No utilizar los datos para fines propios** ni cederlos a terceros, salvo subencargados autorizados. El Encargado no accede a los datos de negocio del Responsable salvo para soporte solicitado, mantenimiento o resolución de incidencias, dejando traza de dichos accesos.

---

## 6. Confidencialidad

El Encargado mantendrá la confidencialidad de los datos personales tratados, obligación que subsiste tras la finalización del Acuerdo. Garantizará que cualquier persona que actúe bajo su autoridad y tenga acceso a los datos los trate únicamente siguiendo instrucciones del Responsable y bajo deber de confidencialidad.

---

## 7. Seguridad del tratamiento (medidas técnicas y organizativas)

Teniendo en cuenta el estado de la técnica y los riesgos del tratamiento, el Encargado aplica las medidas descritas en el **Anexo II**, entre ellas:

- **Aislamiento multi-tenant**: cada organización cliente queda lógicamente aislada mediante un identificador de organización (`org_id`) presente en todas las tablas de negocio. El acceso a los datos de una organización por parte de otra está impedido a nivel de base de datos.
- **Control de acceso a nivel de fila (Row-Level Security, RLS)** en PostgreSQL: las políticas de seguridad filtran cada consulta por la organización del usuario autenticado, de modo que un usuario solo puede acceder a los datos de su propia organización.
- **Cifrado en tránsito** (TLS/HTTPS) en todas las comunicaciones; cifrado en reposo proporcionado por los proveedores de infraestructura.
- **Autenticación** de usuarios mediante enlaces de un solo uso (OTP) gestionados por el proveedor de autenticación.
- **Control de roles** (administrador, comercial, gestor) con permisos diferenciados.
- **Registro de auditoría** de las acciones sensibles sobre los datos.
- **Minimización**: solo se tratan los datos necesarios para la finalidad descrita.

El Responsable reconoce que estas medidas son adecuadas al riesgo en el momento de la firma y podrán evolucionar para mantener un nivel de seguridad equivalente o superior.

---

## 8. Subencargados del tratamiento

El Responsable **autoriza de forma general** al Encargado a recurrir a los siguientes subencargados para la prestación del servicio (**Anexo III**):

| Subencargado | Servicio prestado | Ubicación principal del tratamiento |
|---|---|---|
| **Supabase, Inc.** | Base de datos, autenticación y almacenamiento | UE — Fráncfort (`eu-central-1`), Alemania |
| **Vercel, Inc.** | Alojamiento de la aplicación y ejecución de procesos | Estados Unidos / red global |
| **Sendinblue/Brevo (Sendinblue SAS)** | Envío de correo electrónico transaccional | Unión Europea (Francia) |
| **Google LLC** | Acceso a reseñas públicas vía Google Business Profile / Places API | Estados Unidos / red global |

El Encargado impone a cada subencargado, mediante contrato, obligaciones de protección de datos equivalentes a las del presente Acuerdo.

El Encargado **informará al Responsable de cualquier cambio** previsto en la incorporación o sustitución de subencargados, otorgando al Responsable la posibilidad de **oponerse** por motivos razonables relacionados con la protección de datos en un plazo de `[15]` días. La oposición fundada que impida la prestación del servicio facultará a cualquiera de las partes a resolver el Contrato Principal sin penalización.

---

## 9. Asistencia en el ejercicio de derechos de los interesados

Teniendo en cuenta la naturaleza del tratamiento, el Encargado asistirá al Responsable, mediante medidas técnicas y organizativas apropiadas, en la atención de las solicitudes de ejercicio de los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad. Si un interesado dirige una solicitud directamente al Encargado, este la trasladará al Responsable sin dilación indebida y no responderá por su cuenta salvo instrucción del Responsable.

---

## 10. Notificación de violaciones de la seguridad

El Encargado notificará al Responsable, **sin dilación indebida y a más tardar en 48 horas** desde que tenga conocimiento, cualquier violación de la seguridad de los datos personales que afecte a datos tratados por cuenta del Responsable, facilitando al menos: la naturaleza de la violación, las categorías y número aproximado de interesados y registros afectados, las posibles consecuencias y las medidas adoptadas o propuestas. Corresponde al Responsable, en su caso, notificar a la autoridad de control (AEPD) y a los interesados.

---

## 11. Devolución y supresión de los datos

A la finalización de la prestación del servicio, el Encargado, **a elección del Responsable**:

- Devolverá al Responsable los datos personales en un formato estructurado y de uso común; y/o
- Suprimirá los datos personales y las copias existentes,

en un plazo máximo de `[30]` días, salvo que la normativa exija su conservación, en cuyo caso se informará al Responsable de dicha obligación. El Encargado certificará por escrito la supresión a solicitud del Responsable.

---

## 12. Auditorías

El Encargado pondrá a disposición del Responsable la información necesaria para demostrar el cumplimiento de las obligaciones del artículo 28 del RGPD, y permitirá y contribuirá a la realización de **auditorías**, incluidas inspecciones, por parte del Responsable o de un auditor autorizado por este, con preaviso razonable de `[30]` días, sin perturbar de forma desproporcionada la actividad del Encargado y respetando la confidencialidad de los datos de otros clientes (multi-tenant).

---

## 13. Responsabilidad

Cada parte responderá frente a la otra y frente a terceros por los daños que cause como consecuencia del incumplimiento de sus obligaciones bajo este Acuerdo y la normativa de protección de datos, en los términos del artículo 82 del RGPD. Los límites de responsabilidad del Contrato Principal serán de aplicación salvo en lo que la normativa imperativa disponga.

---

## 14. Transferencias internacionales

En la medida en que algún subencargado (p. ej. Vercel o Google) trate datos fuera del Espacio Económico Europeo, dichas transferencias se ampararán en un mecanismo válido conforme al Capítulo V del RGPD (decisión de adecuación o **Cláusulas Contractuales Tipo** de la Comisión Europea), junto con las garantías adicionales que procedan. El tratamiento principal de los datos de negocio se realiza en la **UE (Fráncfort)**.

---

## 15. Ley aplicable y jurisdicción

Este Acuerdo se rige por la legislación española y por el RGPD. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la normativa aplicable y a lo previsto en el Contrato Principal.

---

## Firmas

| El Responsable | El Encargado |
|---|---|
| `[RAZÓN SOCIAL DEL CLIENTE]` | Alejandro Castillo Cantón (Atribuya) |
| Fdo.: `__________________` | Fdo.: `__________________` |
| Fecha: `__________` | Fecha: `__________` |

---

### Anexo I — Detalles del tratamiento
Ver cláusula 4 (naturaleza, finalidad, interesados y categorías de datos).

### Anexo II — Medidas técnicas y organizativas
Ver cláusula 7 (aislamiento multi-tenant por `org_id`, RLS de PostgreSQL, cifrado en tránsito, autenticación OTP, control de roles, registro de auditoría, minimización).

### Anexo III — Subencargados autorizados
Ver cláusula 8 (Supabase, Vercel, Brevo, Google).
