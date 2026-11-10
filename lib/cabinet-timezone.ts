// Les créneaux de réservation publique sont exprimés en heure du cabinet
// (Cameroun, WAT, UTC+1, pas d'heure d'été). On convertit nous-mêmes vers un
// instant UTC précis au lieu de passer par Date.prototype.setHours(), qui
// utiliserait le fuseau horaire de l'appareil du patient — correct
// uniquement s'il se trouve physiquement en heure du Cameroun, ce qui n'est
// pas garanti (diaspora, appareil mal configuré...).
const CABINET_UTC_OFFSET_MINUTES = 60;

/** `date` ne fournit que l'année/mois/jour ; `timeStr` est au format "HH:mm" (heure du cabinet). */
export function cabinetWallTimeToUtcIso(date: Date, timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const utcMs =
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0) -
    CABINET_UTC_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs).toISOString();
}
