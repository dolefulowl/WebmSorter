import os
import re
import cv2
from datetime import datetime


class Webm:
    def __init__(self, webm_folder, thumb_folder):
        self.webm_folder = webm_folder
        self.thumb_folder = thumb_folder
        self.webms = os.listdir(self.webm_folder)
        self.amount = len([name for name in self.webms if os.path.isfile(os.path.join(self.webm_folder, name))])
        self.extensions = ['.webm', '.mp4']

    def video_to_frame(self, video, name, path_output_dir):
        vidcap = cv2.VideoCapture(video)
        success, image = vidcap.read()
        frames = 0
        while True:
            if frames == 30:
                try:
                    cv2.imwrite(f'{path_output_dir}{name}.png', image)
                except Exception as e:
                    print(e)
                vidcap.release()
            elif frames > 30:
                break
            success, image = vidcap.read()
            frames += 1

    def prepare_thumbs_filenames(self):
        webms = self.webms
        thumb_path = self.thumb_folder
        eng = '[A-Za-z]'
        for webm_name in webms:
            extension = os.path.splitext(f'{webm_name}')[1]
            start_name = os.path.splitext(f'{webm_name}')[0]
            is_thumb = f'{thumb_path}{start_name}.png'
            # Skipp if the thumb exists
            if os.path.exists(is_thumb):
                continue
            # Skipp if not video
            if extension not in self.extensions:
                continue
            webm_path = f'{self.webm_folder}{webm_name}'
            lang_flag = False
            raw_name = os.path.splitext(f'{webm_name}')[0]

            # Since OpenCV support only latin symbols
            # There's a need to set a temporary latin name to the file
            if re.search(eng, webm_name):
                lang_flag = True
                raw_name = 'imjusttemponame'
            # Create a thumb
            self.video_to_frame(webm_path, raw_name, thumb_path)
            # And then return the name as it was if it's necessary
            if lang_flag:
                try:
                    print('renaming')
                    ex_path = f'{thumb_path}imjusttemponame.png'
                    new_path = f'{thumb_path}{start_name}.png'
                    os.rename(ex_path, new_path)
                except Exception as e:
                    print(e)

    def sort_webm(self):
        webms = self.webms
        result = {}
        for webm_name in webms:
            # Skipp if not video
            extension = os.path.splitext(f'{webm_name}')[1]
            if extension not in self.extensions:
                continue
            timestamp = os.path.getmtime(f'{self.webm_folder}{webm_name}')
            human_date = datetime.utcfromtimestamp(timestamp).strftime('%Y-%m')
            if human_date not in result:
                result[human_date] = [webm_name]
            else:
                last_data = result[human_date]
                last_data.append(webm_name)
                result[human_date] = last_data
        return result

    def __repr__(self):
        return f'{self.amount}'
