import sys
import requests
from bs4 import BeautifulSoup


# Función para verificar si el archivo CSV tiene los encabezados correctos
def get_table_with_headers(tables, expected_headers):
    for table in tables:
        headers = [th.get_text(strip=True) for th in table.find_all("th")]
        if headers == expected_headers:
            return table
    return None


# Pedir rango de páginas al usuario
# Total de páginas se obtiene de la respuesta del servidor
def pedir_rango_paginas(total_paginas):
    print(f"\n🔢 Hay un total de {total_paginas} páginas disponibles.")
    while True:
        try:
            inicio = input(f"¿Desde qué página quieres iniciar la búsqueda? (1-{total_paginas}) [Enter = 1]: ").strip()
            fin = input(f"¿Hasta qué página quieres buscar? ({inicio or 1}-{total_paginas}) [Enter = {total_paginas}]: ").strip()
            if inicio == "" and fin == "":
                return 1, total_paginas
            if not inicio:
                inicio = 1
            if not fin:
                fin = total_paginas
            if not str(inicio).isdigit() or not str(fin).isdigit():
                print("Introduce números válidos.")
                continue
            inicio = int(inicio)
            fin = int(fin)
            if 1 <= inicio <= fin <= total_paginas:
                return inicio, fin
            else:
                print("El rango no es válido.")
        except KeyboardInterrupt:
            print("\nOperación cancelada.")
            sys.exit(0)
  
# Función para colorear texto en la terminal          
def color_texto(texto, color):
    colores = {
        "azul": "\033[94m",
        "verde": "\033[92m",
        "amarillo": "\033[93m",
        "rojo": "\033[91m",
        "gris": "\033[90m",
        "magenta": "\033[95m",
        "cian": "\033[96m",
        "blanco": "\033[97m",
        "negro": "\033[30m",
        "morado": "\033[35m",
        "naranja": "\033[33m",
        "reset": "\033[0m"
    }
    return f"{colores.get(color, '')}{texto}{colores['reset']}"

def obtener_mundos_disponibles():
    """
    Devuelve una lista de mundos realmente accesibles para el usuario desde la página INDEX_URL.
    """
    from utils.selenium import verificar_cookie_y_sesion
    import utils.config
    from bs4 import BeautifulSoup

    session = verificar_cookie_y_sesion()
    resp = session.get(utils.config.INDEX_URL, headers=utils.config.HEADERS)
    soup = BeautifulSoup(resp.text, "html.parser")

    mundos = []
    # Busca todos los enlaces a multi.php (solo accesibles)
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.endswith("/multi.php"):
            # Extrae el subdominio como nombre de mundo
            url = href
            if url.startswith("http"):
                mundo = url.split("//")[1].split(".")[0]
            else:
                # Si es relativo, ignóralo
                continue
            if mundo not in mundos:
                mundos.append(mundo)
    return sorted(mundos)

