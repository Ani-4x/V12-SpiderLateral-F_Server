import socketio
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio, app)

@sio.event
def connect(sid, environ):
    print('Client connected:', sid)

@sio.event
def update_dashboard(sid):
    sio.emit('chart_update', {'img': visualize()['img']})
