# Servidor local do Meu Ateliê (sem internet). Uso: python3 servidor.py
import http.server, os, socket, sys

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp'}
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, *a):
        pass

def ip_local():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        return s.getsockname()[0]
    except Exception:
        return 'IP-DO-MAC'

print(f"\n  🎨  Meu Ateliê está ligado!\n\n  No iPad (mesmo Wi-Fi), abra no Safari:\n      http://{ip_local()}:{PORTA}\n\n  Neste Mac: http://localhost:{PORTA}\n  Para desligar, feche esta janela.\n", flush=True)
http.server.ThreadingHTTPServer(('0.0.0.0', PORTA), Handler).serve_forever()
