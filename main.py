import eel
from webm import Webm

THUMB_FOLDER = 'web/thumbnails/'
WEBM_FOLDER = 'web/webm/'
webm = Webm(WEBM_FOLDER, THUMB_FOLDER)
eel.init('web')

# if the current  webm amount in the folder is different
# we prepare new thumbs
with open('webm_amount.txt', 'r', encoding='utf-8') as f:
    last_amount = int(f.read())
    if last_amount != webm.amount:
        with open('webm_amount.txt', 'w', encoding='utf-8') as f:
            f.write(str(webm.amount))
        webm.prepare_thumbs_filenames()

# this function only needs to call it from js
@eel.expose
def get_sorted_webm():
    return webm.sort_webm()


eel.start('index.html', size=(1280, 720))
