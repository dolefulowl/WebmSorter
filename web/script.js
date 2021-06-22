/* Receives json with webm paths and its created date (it contains only y and m).
It looks like => some_date: [path1, path2, ..., pathN) */
function createPage (dates_names) {
    
    const webms = Object.keys(dates_names).sort().reverse();

    webms.forEach(function(date) {
      let div = document.createElement('div');
      let time = document.createElement('time');
      div.className = `date-container`;
      time.className = 'date'
      time.innerHTML = date;
      document.body.append(time, div);
      dates_names[date].forEach(function (name) {
        const rawName = name.replace(/\.[^/.]+$/, "")
        const path = `webm/${name}`
        const poster = `thumbnails/${rawName}.png`

        html = `<a href="#" class="preview" id="${path}" data-name="${name}" 
        onclick="return false;"><img class="thumbmail" src="${poster}" alt=""></a>`;
        div.innerHTML += html
      })
    });
    doVideoLogic();
}

function doVideoLogic() {
    const modal = document.querySelector('.modal');
    const thumbs = document.querySelectorAll('.thumbmail');
    const video = document.querySelector('.modal video');
    let videoOpen = false;

    function openModal (e) {
        videoOpen = true;
        const path = e.path[1]['id'];
        const name = e.path[1].attributes['data-name'].value
        video.src =`${path}`;

        // remove the custom resolution
        video.style.height = null;
        video.style.width = null;
        modal.style.top = null;
        modal.style.left = null;
        video.style.maxHeight = '90vh';

        modal.setAttribute('data-mediainfo', name);
        modal.classList.add('show');
    }

    function closeModal (e) {
        if(!videoOpen) { return }
        const clickedElement = e.path[0].attributes['class'].value;
        if(clickedElement === 'date' || clickedElement === 'date-container') {
            pauseVideo();
            modal.classList.remove('show');
        }
    }

    function pauseVideo() {
        videoOpen = false;
        video.pause();
    }

    function dragAndZoom(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;  // vars to calculate pos
        let lastX;
        elmnt.onmousedown = dragMouseDown;
        elmnt.onwheel = zoomVideo;

        function zoomVideo(e) {
            e = e || window.event;
            e.preventDefault();
            
            video.style.maxHeight = null;
            let scrollDelta = e.deltaY;

            // calculate a ratio
            const ratio = video.videoHeight / video.videoWidth;

            // define the current video sizes
            let width = video.offsetWidth;
            let height = video.offsetHeight;

            // in percents
            const scaleVideoWidth = (width / 100) * 25;

            if (scrollDelta > 0) {
                width -=  scaleVideoWidth;
                if (width < 120) { return }
            } else {
                width +=  scaleVideoWidth;
            }
            // calculate a height depending on our new width and ratio
            height = width * ratio;

            video.style.height = `${height}px`;
            video.style.width = `${width}px`;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            lastX = pos3;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            video.controls = false;
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement(e) {
            if (lastX === pos3 || lastX === pos3 - 1 || lastX === pos3 + 1) {
                video.controls = false;
                let isFullScreen = (document.webkitIsFullScreen || document.isFullScreen);
                if(isFullScreen) {
                    let closeFullScreen = (document.cancelFullScreen || document.webkitCancelFullScreen);
                    closeFullScreen.call(document);
                } else{
                    pauseVideo();
                }
                modal.classList.remove('show');
            }
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
            setTimeout(function() { video.controls = true; }, 100);
            }
    }


    /*------------------------Add listeners------------------------*/
    document.addEventListener('click', closeModal);
    thumbs.forEach((thumb) => {thumb.addEventListener('click', openModal);});

    modal.addEventListener('fullscreenchange', function(event) {
            if (!document.fullscreenElement) { pauseVideo(); }
    }, false);

    // although it's a function, there's few listener in it
    dragAndZoom(modal);
}


// calls the function from the pythpn-side and inserts its output to the js-function
eel.get_sorted_webm()(createPage);
