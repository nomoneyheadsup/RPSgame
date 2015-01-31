import Settings
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, StaticFileHandler, url
import tornado.web
from tornado import websocket
import os

from RPS import *

LOCAL = False
#LOCAL = True
# Remember to set LOCAL_TEST in render.js as well

if LOCAL:
    LISTEN_PORT = 8888
    SOCK_PORT = 8888
else:
    LISTEN_PORT = os.environ.get("PORT", 5000)
    SOCK_PORT = 80
    
class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            (r"/websocket", WebSocketHandler),
            (r"/(lobbyPacket.js)", WebHandler),
            (r"/(jquery.min.js)", WebHandler),
            (r"/(.*)",StaticFileHandler, {'path' : Settings.STATIC_PATH})
        ]
        settings = {"template_path": Settings.TEMPLATE_PATH}
        tornado.web.Application.__init__(self, handlers, **settings)

class MainHandler(RequestHandler):
    def get(self):
        if LOCAL:
            self.render("index9n0aj3o1n2k.html")
        else:
            self.render("index.html")
        
class WebHandler(RequestHandler):
    def get(self, filename):
        self.render(filename, SOCK_PORT = SOCK_PORT)
        
sockclients = []
        
class WebSocketHandler(websocket.WebSocketHandler):
    def open(self):
        print "WebSocket opened"
        sockclients.append(self)

    def on_message(self, message): # message is a byte string
        #print(b'Received message: ' + str(list(message)))
        ParsePacket(self, [ord(m) for m in message])

    def on_close(self):
        print "WebSocket closed"
        DeletePlayerFromAllGames(self)
        sockclients.remove(self)

def main():
    application = Application()
    application.listen(LISTEN_PORT)
    IOLoop.instance().start()

if __name__ == "__main__":
    main()