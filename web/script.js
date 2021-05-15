
// Receives json with webm paths and its created date (it contains only y and m).
// It looks like => some_date: [path1, path2, ..., pathN)
function createPage (dates_names) {
    const webms = Object.keys(dates_names).sort().reverse();
    webms.forEach(function(date) {
      let div = document.createElement('div');
      div.className = `date-container`;
      div.innerHTML = `<strong class="date">${date}</strong>`;
      document.body.append(div);
        dates_names[date].forEach(function (name) {
            const raw_name = name.replace(/\.[^/.]+$/, "")
            const path = `webm/${name}`
            const poster = `thumbnails/${raw_name}.png`
            html = `<a href="#" class="post__image" id="${path}" data-name="${name}" 
            onclick="return false;"><img class="video" src="${poster}" alt=""></a>`;
            div.innerHTML += html
        })
    });
    doVideoLogic();
}

function doVideoLogic() {
    const modal = document.querySelector('.modal');
    const videoLinks = document.querySelectorAll('.video');
    const video = document.querySelector('.modal video');
    let videoOpen = false;

    function openVideo (e) {
        videoOpen = true;

        const path = e.path[1]['id'];
        const name = e.path[1].attributes['data-name'].value

        video.src =`${path}`;
        document.documentElement.style.setProperty('--text', `'${name}`);
        modal.classList.add('show');
    }

    function pauseVideo() {
        videoOpen = false;
        video.pause();
        modal.style.transform = `scale(1)`;
    }

    // Close the modal if body was clicked
    function closeModal (e) {
        if(!videoOpen) { return }
        const element = e.path[0].attributes['class'].value;
        if(element === 'date' || element === 'date-container') {
            pauseVideo();
            modal.classList.remove('show');
        }
    }

    function dragAndZoom(elmnt) {
        let scale = 1;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let start, end, delta
        elmnt.onmousedown = dragMouseDown;
        elmnt.onwheel = zoom;

        function zoom(e) {
            e = e || window.event;
            e.preventDefault();
            let delta = e.deltaY
            if (delta > 0) {
                if(scale < 0.50) {return}
                scale -= 0.25
            } else {
                scale += 0.25
            }
            elmnt.style.transform = `scale(${scale})`;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            start = new Date();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement(e) {
            end = new Date();
            timeVideoWasOpened = (end - start) / 1000.0;
            if (timeVideoWasOpened < 0.150) {
                let isFullScreen = (document.webkitIsFullScreen || document.isFullScreen);
                if(isFullScreen) {
                    let closeFullScreen = (document.cancelFullScreen || document.webkitCancelFullScreen);
                    closeFullScreen.call(document);
                } else{
                    pauseVideo();
                }
                modal.classList.remove('show');

            } else {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }


    // Calculates a centre of the screen and places a video there
    video.addEventListener('loadedmetadata', function(e){
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight + 36; // plus border

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const left = (windowWidth - videoWidth) / 2;
        const top = (windowHeight - videoHeight) / 2;

        modal.style.top = top + "px";
        modal.style.left = left + "px";
    });
    // Add listeners
    document.addEventListener('click', closeModal);
    videoLinks.forEach((link) => {
        link.addEventListener('click', openVideo);
    });
    modal.addEventListener('fullscreenchange', function(event) {
            if (!document.fullscreenElement) {
                pauseVideo();
            }
        }, false);
    dragAndZoom(modal);
}
// calls the function from the pythpn-side and inserts its output to the js-function
eel.get_sorted_webm()(createPage);


