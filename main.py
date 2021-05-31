import eel
from webm import Webm

THUMB_FOLDER = 'web/thumbnails/'
WEBM_FOLDER = 'web/webm/'
WEBM_AMOUNT_PATH = 'webm_amount.txt'

# WEBM_AMOUNT_PATH is an optional argument
webm = Webm(WEBM_FOLDER, THUMB_FOLDER)
eel.init('web')


# this function is only needed to call it from js
@eel.expose
def get_sorted_webm():
    return webm.sort_webm()


eel.start('index.html', size=(1280, 720))
