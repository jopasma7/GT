import threading
import requests
import utils.config
from funciones.extra import obtener_mundos_disponibles
from bs4 import BeautifulSoup
from utils.selenium import verificar_cookie_y_sesion
import yaml
import os

# Al principio del menú, carga el archivo UNA VEZ:
def cargar_bans_global():
    global_bans_path = utils.config.get_bans_file()
    if not os.path.exists(global_bans_path):
        return {}
    with open(global_bans_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def fetch_and_save_bans_background():
    """
    Descarga y parsea la tabla de baneos para todos los mundos,
    guardando los datos en logs/global/bans.yml bajo la clave del mundo.
    Cada jugador tendrá una lista de baneos (historial) en cada mundo.
    Muestra un resumen final por consola solo si hay nuevos baneos o errores,
    y una sola línea final con los mundos procesados.
    """
    print("⏳ Iniciando actualización de usuarios baneados para todos los mundos...")
    session = verificar_cookie_y_sesion()
    global_bans_path = "logs/global/bans.yml"
    os.makedirs(os.path.dirname(global_bans_path), exist_ok=True)
    if os.path.exists(global_bans_path):
        with open(global_bans_path, "r", encoding="utf-8") as f:
            global_bans = yaml.safe_load(f) or {}
    else:
        global_bans = {}

    resumen_mensajes = []
    mundos_actualizados = []
    mundos_errores = []

    for mundo in obtener_mundos_disponibles():
        url = f"https://{mundo}.guerrastribales.es/admintool/multi.php?mode=list_banned"
        try:
            response = session.get(url, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            tables = soup.find_all("table", class_="vis")
            target_table = None
            for t in tables:
                ths = t.find_all("th")
                for th in ths:
                    th_text = th.get_text(strip=True).lower()
                    if th_text in ("name", "nombre", "date", "deadline", "admin", "reason", "remark", "punishment", "restart", "bantype"):
                        target_table = t
                        break
                if target_table:
                    break

            if not target_table:
                mundos_errores.append(mundo)
                continue

            rows = target_table.find_all("tr")[1:]  # Saltar cabecera
            nuevos = 0
            nuevos_nombres = []
            for row in rows:
                cols = row.find_all("td")
                if len(cols) < 13:
                    continue
                nombre = cols[0].find("a").text.strip() if cols[0].find("a") else ""
                date = cols[4].text.strip()
                deadline = cols[5].text.strip()
                unban_date = cols[6].text.strip()
                admin = cols[7].text.strip()
                reason = cols[8].text.strip()
                remark = cols[9].text.strip()
                punishment = cols[10].text.strip()
                restart = cols[11].text.strip()
                bantype = cols[12].text.strip()
                nuevo_ban = {
                    "date": date,
                    "deadline": deadline,
                    "unban_date": unban_date,
                    "admin": admin,
                    "reason": reason,
                    "remark": remark,
                    "punishment": punishment,
                    "restart": restart,
                    "bantype": bantype
                }

                if mundo not in global_bans:
                    global_bans[mundo] = {}
                if nombre not in global_bans[mundo]:
                    global_bans[mundo][nombre] = []

                # Evitar duplicados exactos (por date y unban_date)
                ya_registrado = any(
                    list(ban.values())[0]["date"] == date and list(ban.values())[0]["unban_date"] == unban_date
                    for ban in global_bans[mundo][nombre]
                )
                if not ya_registrado:
                    numero_ban = len(global_bans[mundo][nombre]) + 1
                    global_bans[mundo][nombre].append({numero_ban: nuevo_ban})
                    nuevos += 1
                    nuevos_nombres.append(nombre)

            if nuevos > 0:
                resumen_mensajes.append(f"✨🛡️  [{mundo}] Se han añadido nuevos baneos:")
                for nombre in nuevos_nombres:
                    resumen_mensajes.append(f"   • 🚫 {nombre}")
                resumen_mensajes.append(f"Total añadidos: {nuevos}")
            mundos_actualizados.append(mundo)

        except Exception as e:
            mundos_errores.append(mundo)

    with open(global_bans_path, "w", encoding="utf-8") as f:
        yaml.dump(global_bans, f, allow_unicode=True, sort_keys=False)

    # Mostrar resumen final bonito y compacto
    if resumen_mensajes:
        print("\n".join(resumen_mensajes))
    if mundos_actualizados:
        print(f"🎉 Finalizada la actualización de usuarios baneados para los mundos: {', '.join(mundos_actualizados)}.")
    if mundos_errores:
        print(f"⚠️  No se pudo obtener la tabla de baneos para: {', '.join(mundos_errores)}.")

def revisar_ban_en_todos_los_mundos(nombre_jugador):
    """
    Devuelve un diccionario {mundo: [ban_dict, ...]} solo para los mundos donde el jugador tiene baneos.
    """
    global_bans_path = "logs/global/bans.yml"
    if not os.path.exists(global_bans_path):
        return {}

    with open(global_bans_path, "r", encoding="utf-8") as f:
        global_bans = yaml.safe_load(f) or {}

    mundos_baneados = {}
    for mundo in obtener_mundos_disponibles():
        mundo_bans = global_bans.get(mundo, {})
        historial = mundo_bans.get(nombre_jugador, [])
        if historial:
            # Extrae solo la info del ban (sin el número como clave)
            lista_bans = []
            for ban_dict in historial:
                for num, ban in ban_dict.items():
                    ban_con_info = dict(ban)
                    ban_con_info["Nº"] = num
                    lista_bans.append(ban_con_info)
            mundos_baneados[mundo] = lista_bans
    return mundos_baneados

def obtener_historial_baneos_jugador(nombre_jugador):
    """
    Devuelve una lista con el historial completo de baneos del jugador en todos los mundos.
    Cada elemento es un diccionario con la información del ban y el mundo.
    """
    global_bans_path = "logs/global/bans.yml"
    if not os.path.exists(global_bans_path):
        return []

    with open(global_bans_path, "r", encoding="utf-8") as f:
        global_bans = yaml.safe_load(f) or {}

    historial_total = []
    for mundo in obtener_mundos_disponibles():
        mundo_bans = global_bans.get(mundo, {})
        historial = mundo_bans.get(nombre_jugador, [])
        for ban_dict in historial:
            for num, ban in ban_dict.items():
                ban_con_info = dict(ban)
                ban_con_info["Mundo"] = mundo
                ban_con_info["Nº"] = num
                historial_total.append(ban_con_info)

    return historial_total

def check_ban_jugador(nombre_jugador, global_bans, mundo_actual=None):
    """
    Devuelve (estado, fecha_exp, mundo_ban) donde:
    - estado: "permanente", "temporal", "otro_mundo" o None
    - fecha_exp: fecha de expiración o None
    - mundo_ban: mundo donde está baneado o None
    """
    #print(f"🔍 Revisando baneos para el jugador: {nombre_jugador} en {mundo_actual}")
    historial = []
    for mundo in global_bans:
        mundo_bans = global_bans.get(mundo, {})
        historial += [(mundo, ban_dict) for ban_dict in mundo_bans.get(nombre_jugador, [])]
    for mundo, ban_dict in historial:
        for num, ban in ban_dict.items():
            unban = ban.get("unban_date", "").lower()
            if mundo_actual is not None and mundo == mundo_actual:
                if "perm" in unban:
                    return "permanente", ban.get("unban_date"), mundo
                elif unban:
                    return "temporal", ban.get("unban_date"), mundo
    # Si no hay ban en el mundo actual pero sí en otro mundo
    for mundo, ban_dict in historial:
        for num, ban in ban_dict.items():
            unban = ban.get("unban_date", "").lower()
            if "perm" in unban or unban:
                return "otro_mundo", ban.get("unban_date"), mundo
    return None, None, None