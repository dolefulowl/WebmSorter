import os
import re
import cv2
from datetime import datetime


class Webm:
    def __init__(self, webm_folder, thumb_folder, webm_amount_path='webm_amount.txt'):
        self.extensions = ['.webm', '.mp4']
        self.webm_folder = webm_folder
        self.thumb_folder = thumb_folder
        self.webm_amount_path = webm_amount_path
        self.webms = self._video_list()
        self.amount = len(self.webms)
        self.tempo_name = 'tempo_name'
    
    # Gets only videos from your directory.
    def _video_list(self):
        files = os.listdir(self.webm_folder)
        video_list = []
        for file in files:
            extension = os.path.splitext(f'{file}')[1]
            if extension in self.extensions:
                video_list.append(file)
        return video_list

    def _video_to_frame(self, video, name):
        vidcap = cv2.VideoCapture(video)
        success, image = vidcap.read()
        frames = 0
        while frames != 30:
            try:
                cv2.imwrite(f'{self.thumb_folder}{name}.png', image)
            except Exception as e:
                print(e)
            vidcap.release()

            success, image = vidcap.read()
            frames += 1

    def _prepare_thumbs_filenames(self):
        eng = '[A-Za-z]'
        for webm_name in self.webms:
            start_name = os.path.splitext(f'{webm_name}')[0]
            is_thumb = f'{self.thumb_folder}{start_name}.png'
            # Skipp if the thumb exists
            if os.path.exists(is_thumb):
                continue
            webm_path = f'{self.webm_folder}{webm_name}'
            lang_flag = False

            # Since OpenCV support only latin symbols
            # there's a need to set a temporary latin name to the file.
            if re.search(eng, webm_name):
                lang_flag = True
                self._video_to_frame(webm_path, self.tempo_name)
            else:
                self._video_to_frame(webm_path, start_name)

            # And then return the name as it was if it's necessary.
            if lang_flag:
                try:
                    print('renaming')
                    ex_path = f'{self.thumb_folder}{self.tempo_name}.png'
                    new_path = f'{self.thumb_folder}{start_name}.png'
                    os.rename(ex_path, new_path)
                except Exception as e:
                    print(e)

    # If the current webm amount in the folder is different, we prepare new thumbs.
    def _check_updates(self):
        with open(self.webm_amount_path, 'r', encoding='utf-8') as fr:
            last_amount = int(fr.read())
            if last_amount != self.amount:
                with open(self.webm_amount_path, 'w', encoding='utf-8') as fw:
                    fw.write(str(self.amount))
                self._prepare_thumbs_filenames()

    def sort_webm(self):
        self._check_updates()
        result = {}
        for webm_name in self.webms:

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
