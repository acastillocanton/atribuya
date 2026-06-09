import "server-only";
import { notifyInvitedUser } from "./notify-invited-user";

/**
 * Email de bienvenida al primer admin de una organización recién creada (o a
 * un admin adicional invitado más tarde desde `/super`). Contiene el enlace
 * mágico de acceso de un solo uso (`/auth/confirm?...&type=invite`).
 *
 * Wrapper fino sobre `notifyInvitedUser` (rol "admin") — se mantiene para no
 * tocar el flujo de `/super`. Best-effort: el caller (inviteOrgAdmin) lo
 * invoca sin dejar que un fallo de email rompa la invitación.
 */

export type InvitedAdminNotificationInput = {
  /** Email del nuevo admin (destinatario). */
  adminEmail: string;
  /** Nombre completo del admin — para el saludo. */
  adminName: string;
  /** Nombre comercial de la organización a la que se le da acceso. */
  orgName: string;
  /** Enlace mágico de un solo uso para completar el acceso. */
  inviteLink: string;
  /** Base URL para el logo y enlaces absolutos. */
  appBase: string;
};

export async function notifyInvitedAdmin(input: InvitedAdminNotificationInput) {
  return notifyInvitedUser({
    email: input.adminEmail,
    name: input.adminName,
    orgName: input.orgName,
    inviteLink: input.inviteLink,
    appBase: input.appBase,
    role: "admin",
  });
}
